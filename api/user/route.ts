import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth";

export async function POST(request: NextRequest) {
  try {
    // Try to get sessionId from various sources
    let sessionId;
    
    // 1. Check JSON body
    const body = await request.json();
    if (body.sessionId) {
      sessionId = body.sessionId;
    }
    
    // 2. If not in body, check Authorization header
    if (!sessionId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionId = authHeader.substring(7);
      }
    }
    
    // 3. If not in header, check cookies
    if (!sessionId) {
      sessionId = request.cookies.get('sessionId')?.value;
    }
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "No session ID provided" },
        { status: 401 }
      );
    }
    
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}