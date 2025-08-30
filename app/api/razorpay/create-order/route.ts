import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, eventId, userId, attendeeInfo, ticketDetails } = body;

    // Validate required fields
    if (!amount || !currency || !eventId || !userId || !attendeeInfo || !ticketDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create order options
    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: `receipt_${eventId}_${userId}_${Date.now()}`,
      notes: {
        event_id: eventId.toString(),
        user_id: userId.toString(),
        attendee_name: attendeeInfo.name,
        attendee_email: attendeeInfo.email,
        attendee_phone: attendeeInfo.phone,
        ticket_types: JSON.stringify(ticketDetails),
        merchant_name: 'EventHive',
        merchant_category: 'event_booking'
      }
    };

    // Create order with Razorpay
    const order = await razorpay.orders.create(options);

    // Return order details
    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}