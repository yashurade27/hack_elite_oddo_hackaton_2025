"use server";

import { prisma } from "@/lib/prisma"; // Use shared Prisma instance
import bcrypt from "bcryptjs";
import { redis } from '@/lib/redis';

// Sign in user with email and password
export async function signIn(email: string, password: string) {
  try {
    console.log('SignIn attempt for email:', email);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return { error: 'Invalid email or password' };
    }

    // Generate a session ID
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store session in Redis (7 days expiry)
    await redis.setex(`session:${sessionId}`, 60 * 60 * 24 * 7, user.id.toString());

    console.log('SignIn successful for user:', user.email);
    
    return { 
      success: true, 
      sessionId, 
      user: { 
        id: user.id, 
        name: `${user.firstName} ${user.lastName}`, 
        email: user.email, 
        role: user.userType, 
      } 
    };
  } catch (error) {
    console.error('Signin error:', error);
    return { error: 'Failed to sign in' };
  }
}

// Helper to get current user from session
export async function getCurrentUser(sessionId?: string) {
  try {
    // If sessionId is not passed, we can't get the user
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return null;
    }
    
    // Get user ID from Redis session
    const userId = await redis.get(`session:${sessionId}`);
    
     if (!userId || typeof userId !== 'string') {
      return null;
    }
    
    const userIdNumber = parseInt(userId);
    
    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        userType: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return null;
    }
    
    // Return user with computed name field
    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      role: user.userType,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function signOut(sessionId?: string) {
  if (!sessionId) {
    return { success: false, message: 'No session to logout from' };
  }
  
  try {
    // Clear the session from Redis
    await redis.del(`session:${sessionId}`);
    
    return { success: true, message: 'Successfully signed out' };
  } catch (error) {
    console.error('Signout error:', error);
    return { success: false, message: 'Failed to sign out' };
  }
}

// Test function to verify database connection
export async function testDatabaseConnection() {
  try {
    const userCount = await prisma.user.count();
    console.log('Database connection successful. User count:', userCount);
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
      },
      take: 5,
    });
    
    console.log('Sample users:', users);
    return { success: true, userCount, users };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

