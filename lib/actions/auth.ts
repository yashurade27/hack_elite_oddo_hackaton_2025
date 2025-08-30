"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redis } from '@/lib/redis';

const prisma = new PrismaClient();

// Login related functions only in this file
// Registration/signup functions moved to app/actions/signup.ts



// Sign in user with email and password
export async function signIn(email: string, password: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    if(user.isBanned){
      return { error: 'Your account has been banned. Please contact support.' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: 'Invalid email or password' };
    }

    // Generate a session ID
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store session in Redis (7 days expiry)
    await redis.setex(`session:${sessionId}`, 60 * 60 * 24 * 7, user.id);
    //await redis.setex(`session:${sessionId}:role`, 60 * 60 * 24 * 7, user.role);

    return { 
      success: true, 
      sessionId, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
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
      console.log('getCurrentUser: No valid sessionId provided');
      return null;
    }
    // Get user ID from Redis session
    const userId = await redis.get(`session:${sessionId}`);
    
     if (!userId || typeof userId !== 'string') {
      console.log('getCurrentUser: No valid userId found in Redis');
      return null;
    }
    
    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });
    
    return user;
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
//    await redis.del(`session:${sessionId}:role`);
    
    return { success: true, message: 'Successfully signed out' };
  } catch (error) {
    console.error('Signout error:', error);
    return { success: false, message: 'Failed to sign out' };
  }
}

