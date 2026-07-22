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
        access: false, 
        message: 'Missing key parameter.' 
      }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    
    // Check in the global Application Keys registry
    const keyRef = doc(firestore, 'Application_Keys', key);
    const keySnap = await getDoc(keyRef);

    if (!keySnap.exists()) {
      return NextResponse.json({ 
        access: false, 
        message: 'Invalid key. Application not found.' 
      }, { status: 404 });
    }

    const data = keySnap.data();

    // 1. Check if the key has been activated by a partner
    if (data.status !== 'used') {
      return NextResponse.json({ 
        access: false, 
        message: 'Application not activated.' 
      }, { status: 403 });
    }

    // 2. Validate Type & Token
    if (data.type === 'bot') {
      if (!token) {
        return NextResponse.json({ 
          access: false, 
          message: 'Token required for bot.' 
        }, { status: 400 });
      }

      if (data.token !== token) {
        return NextResponse.json({ 
          access: false, 
          message: 'Invalid token.' 
        }, { status: 401 });
      }
    }

    // 3. Success Response as requested
    return NextResponse.json({
      access: true,
      message: 'Access Granted',
      data: {
        id: data.key,
        name: data.name,
        type: data.type
      }
    });

  } catch (error: any) {
    console.error('Access API Error:', error);
    return NextResponse.json({ 
      access: false, 
      message: 'Internal Server Error.' 
    }, { status: 500 });
  }
}
