import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/actions/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    console.log('API /api/auth/signout called with sessionId:', sessionId ? 'present' : 'missing');

    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
    }

    // Sign out user (clears Redis session)
    const result = await signOut(sessionId);

    if (result.success) {
      console.log('Signout successful');
      return NextResponse.json({ 
        success: true, 
        message: result.message 
      });
    } else {
      console.log('Signout failed:', result.message);
      return NextResponse.json({ 
        error: result.message 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('API /api/auth/signout error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}