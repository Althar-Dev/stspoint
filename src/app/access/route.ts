import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { doc, getDoc } from 'firebase/firestore';

/**
 * API: Application Access Validation
 * URL: /access?key=... (Web) or /access?key=...&token=... (Bot)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const token = searchParams.get('token');

    if (!key) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing activation key parameter.' 
      }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    
    // Check in the global Application Keys registry
    const keyRef = doc(firestore, 'Application_Keys', key);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid key. Application not found in registry.' 
      }, { status: 404 });
    }

    const data = keySnap.data();

    // 1. Check if the key has been activated by a partner
    if (data.status !== 'used') {
      return NextResponse.json({ 
        success: false, 
        message: 'Application key exists but has not been activated yet.' 
      }, { status: 403 });
    }

    // 2. Validate Type & Token
    if (data.type === 'bot') {
      if (!token) {
        return NextResponse.json({ 
          success: false, 
          message: 'Access denied: Token is required for Bot type applications.' 
        }, { status: 400 });
      }

      if (data.token !== token) {
        return NextResponse.json({ 
          success: false, 
          message: 'Access denied: Invalid token for this Bot application.' 
        }, { status: 401 });
      }
    }

    // 3. Success Response
    return NextResponse.json({
      success: true,
      message: 'Access Authorized',
      data: {
        id: data.key,
        name: data.name,
        type: data.type,
        activated_at: data.updatedAt || data.createdAt
      }
    });

  } catch (error: any) {
    console.error('Access API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error.' 
    }, { status: 500 });
  }
}
