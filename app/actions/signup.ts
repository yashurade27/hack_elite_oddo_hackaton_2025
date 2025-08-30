'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { sendMail } from '@/lib/mail';

// Validate email format
const emailSchema = z.string().email();

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email and store in Redis with expiration
export async function sendOtp(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  
  // Basic validation
  if (!email || !name || !password) {
    return { success: false, message: "All fields are required" };
  }
  
  try {
    // Validate email format
    emailSchema.parse(email);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }
    
    // Generate OTP and set expiration (5 minutes)
    const otp = generateOTP();
    const OTP_EXPIRY = 60 * 5; // 5 minutes
    
    // Store OTP in Redis with expiration
    await redis.setex(`signup:otp:${email}`, OTP_EXPIRY, otp);
    
    // Send OTP email
    await sendMail({
      to: email,
      subject: 'Your EventHive Signup OTP',
      html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px; box-shadow: 0px 4px 12px rgba(0,0,0,0.1); border: 1px solid #eaeaea;">
            
            <div style="text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="color: #4a90e2; margin: 0; font-size: 26px;">🎉 Welcome to <span style="color:#ff7b54;">EventHive</span>!</h2>
            </div>

            <p style="font-size: 16px; color: #333;">Hello <b>${name}</b>,</p>

            <p style="font-size: 15px; color: #555;">We’re excited to have you onboard! Your one-time password (OTP) for signup is:</p>

            <div style="background: #f4f8ff; border: 1px dashed #4a90e2; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                <h1 style="font-size: 36px; letter-spacing: 8px; color: #4a90e2; margin: 0;">${otp}</h1>
            </div>

            <p style="font-size: 14px; color: #777;">⚠️ This OTP will expire in <b>5 minutes</b>.</p>

            <p style="font-size: 14px; color: #777;">If you didn’t request this code, you can safely ignore this email.</p>

            <div style="text-align: center; margin-top: 30px; font-size: 13px; color: #aaa;">
                <p>— The EventHive Team</p>
            </div>

            </div>
      `,
    });
    
    return { success: true, message: "OTP sent to your email" };
  } catch (error) {
    console.error('OTP generation error:', error);
    return { success: false, message: error instanceof z.ZodError ? "Invalid email format" : "Failed to send OTP" };
  }
}

// Verify OTP from Redis
export async function verifyOtp(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const userOtp = formData.get('otp') as string;
  
  if (!email || !userOtp) {
    return { success: false, message: "Email and OTP required" };
  }
  
  try {
    // Get stored OTP from Redis
    const storedOtp = await redis.get(`signup:otp:${email}`);
    
    if (!storedOtp) {
      return { success: false, message: "OTP expired or invalid" };
    }
    
    // Verify OTP
    if (storedOtp !== userOtp) {
      return { success: false, message: "Invalid OTP" };
    }
    
    // Store verification status in Redis for 10 minutes
    await redis.setex(`signup:verified:${email}`, 60 * 10, "true");
    
    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, message: "Failed to verify OTP" };
  }
}

// Complete user signup after OTP verification
export async function signupUser(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const otp = formData.get('otp') as string;
  
  if (!name || !email || !password) {
    return { success: false, message: "All fields are required" };
  }
  
  try {
    // Check if the email was verified
    const verified = await redis.get(`signup:verified:${email}`);
    
    if (!verified) {
      return { success: false, message: "Email verification required" };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    // Clean up Redis keys
    await redis.del(`signup:otp:${email}`);
    await redis.del(`signup:verified:${email}`);
    
    return { success: true, message: "Account created successfully" };
  } catch (error) {
    console.error('User creation error:', error);
    return { success: false, message: "Failed to create account" };
  }
}