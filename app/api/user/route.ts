import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    console.log('API /api/user called with sessionId:', sessionId ? 'present' : 'missing');

    if (!sessionId) {
      console.log('No sessionId provided');
      return NextResponse.json({ error: 'No session ID provided' }, { status: 401 });
    }

    // Get user from session
    const user = await getCurrentUser(sessionId);

    if (!user) {
      console.log('No user found for sessionId');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    console.log('User found:', { id: user.id, email: user.email, name: user.name });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id.toString(), // Convert to string for consistency
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('API /api/user error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}