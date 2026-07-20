import { NextResponse } from 'next/server';
import { chatWithBrain, chatWithBrainStream, GROQ_MODELS, type ChatMessage } from '@/lib/ai/brains';
import { initializeFirebase } from '@/firebase/core';
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
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, model, secret_key, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: 'Messages are required.' }, { status: 400 });
    }

    if (!secret_key) {
      return NextResponse.json({ success: false, error: 'secret_key is required.' }, { status: 401 });
    }

    const { firestore } = initializeFirebase();

    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, error: 'Invalid secret_key.' }, { status: 401 });
    }

    const userData = authSnap.docs[0].data();
    const userId = userData.uid;

    const aiConfigRef = doc(firestore, 'users', userId, 'ai', 'config');
    const aiConfigSnap = await getDoc(aiConfigRef);

    if (!aiConfigSnap.exists()) {
      return NextResponse.json({ success: false, error: 'AI service not initialized.' }, { status: 403 });
    }

    const aiConfig = aiConfigSnap.data();
    if (aiConfig.usage >= aiConfig.limit && aiConfig.plan !== 'Enterprise') {
      return NextResponse.json({ success: false, error: 'AI Limit Reached.' }, { status: 429 });
    }

    const modelMapping: Record<string, string> = {
      'sts-lite': GROQ_MODELS.STS_LITE,
      'sts-core': GROQ_MODELS.STS_CORE,
      'sts-prime': GROQ_MODELS.STS_PRIME
    };

    const selectedFriendlyModel = model || 'sts-core';
    const internalModel = modelMapping[selectedFriendlyModel] || GROQ_MODELS.STS_CORE;

    await updateDoc(aiConfigRef, {
      usage: increment(1),
      updatedAt: serverTimestamp()
    });

    if (stream) {
      const groqStream = await chatWithBrainStream(messages as ChatMessage[], internalModel);
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of groqStream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) controller.enqueue(encoder.encode(content));
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
      });
    }

    const aiResponse = await chatWithBrain(messages as ChatMessage[], internalModel);

    return NextResponse.json({
      success: true,
      data: {
        content: aiResponse,
        model: selectedFriendlyModel,
        timestamp: new Date().toISOString(),
        usage: { total: (aiConfig.usage || 0) + 1, limit: aiConfig.limit }
      }
    });

  } catch (error: any) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error.' }, { status: 500 });
  }
}
