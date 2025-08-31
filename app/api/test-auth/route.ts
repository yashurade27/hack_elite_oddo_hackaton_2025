import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get sessionId from cookies
    const sessionId = request.cookies.get('sessionId')?.value;
    
    console.log('Test API - SessionId from cookie:', sessionId);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No sessionId in cookies' }, { status: 401 });
    }

    // Test getCurrentUser function
    const user = await getCurrentUser(sessionId);
    console.log('Test API - User from getCurrentUser:', user);

    // Also test direct database lookup
    const dbUsers = await prisma.user.findMany({
      where: {
        userType: 'ORGANIZER'
      },
      select: {
        id: true,
        uuid: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
      }
    });

    console.log('Test API - All organizers in DB:', dbUsers);

    return NextResponse.json({
      sessionId,
      userFromSession: user,
      organizersInDB: dbUsers,
      success: true
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}