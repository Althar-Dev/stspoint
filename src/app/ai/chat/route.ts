
import { NextResponse } from 'next/server';
import { chatWithBrain, chatWithBrainStream, GROQ_MODELS, type ChatMessage } from '@/lib/ai/brains';
import { initializeFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * API: Intelligent Chat Endpoint (Supports Streaming)
 * URL: https://api.stspoint.id/ai/chat
 * Method: POST
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, model, secret_key, stream = false } = body;

    // 1. Validasi Input Dasar
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Messages are required and must be an array.' 
      }, { status: 400 });
    }

    if (!secret_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication failed: secret_key is required.' 
      }, { status: 401 });
    }

    const { firestore } = initializeFirebase();

    // 2. Autentikasi User via secretKey
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication failed: Invalid secret_key.' 
      }, { status: 401 });
    }

    const userData = authSnap.docs[0].data();
    const userId = userData.uid;

    // 3. Cek AI Limit & Plan
    const aiConfigRef = doc(firestore, 'users', userId, 'ai', 'config');
    const aiConfigSnap = await getDoc(aiConfigRef);

    if (!aiConfigSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI service not initialized for this account.' 
      }, { status: 403 });
    }

    const aiConfig = aiConfigSnap.data();
    const currentUsage = aiConfig.usage || 0;
    const currentLimit = aiConfig.limit || 0;

    if (currentUsage >= currentLimit && aiConfig.plan !== 'Enterprise') {
      return NextResponse.json({ 
        success: false, 
        error: 'AI Limit Reached: Please upgrade your plan in the dashboard.' 
      }, { status: 429 });
    }

    // 4. Pemetaan model friendly ke internal Groq
    const modelMapping: Record<string, string> = {
      'sts-lite': GROQ_MODELS.STS_LITE,
      'sts-core': GROQ_MODELS.STS_CORE,
      'sts-prime': GROQ_MODELS.STS_PRIME
    };

    const selectedFriendlyModel = model || 'sts-core';
    const internalModel = modelMapping[selectedFriendlyModel] || GROQ_MODELS.STS_CORE;

    // 5. Update Usage di Firestore (Potong kuota di awal untuk mencegah eksploitasi stream)
    await updateDoc(aiConfigRef, {
      usage: increment(1),
      updatedAt: serverTimestamp()
    });

    // 6. Handle Streaming vs Static Response
    if (stream) {
      const groqStream = await chatWithBrainStream(messages as ChatMessage[], internalModel);
      
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of groqStream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                // Kirim chunk sebagai raw text atau SSE format
                controller.enqueue(encoder.encode(content));
              }
            }
          } catch (err) {
            console.error('Streaming Error:', err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 7. Non-Streaming Response (Original)
    const aiResponse = await chatWithBrain(messages as ChatMessage[], internalModel);

    return NextResponse.json({
      success: true,
      data: {
        content: aiResponse,
        model: selectedFriendlyModel,
        timestamp: new Date().toISOString(),
        usage: {
          total: currentUsage + 1,
          limit: currentLimit
        }
      }
    });

  } catch (error: any) {
    console.error('AI Chat API Error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error during AI inference.' 
    }, { status: 500 });
  }
}
