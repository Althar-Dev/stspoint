
import { NextResponse } from 'next/server';
import { chatWithBrain, GROQ_MODELS, type ChatMessage } from '@/lib/ai/brains';
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
 * API: Intelligent Chat Endpoint
 * Method: POST
 * URL: https://ai.stspoint.id/api/chat
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, model, secret_key } = body;

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

    // 5. Panggil Brains Utility
    const aiResponse = await chatWithBrain(messages as ChatMessage[], internalModel);

    // 6. Update Usage di Firestore
    await updateDoc(aiConfigRef, {
      usage: increment(1),
      updatedAt: serverTimestamp()
    });

    // 7. Kirim respon balik
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
