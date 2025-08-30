import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Function to generate UPI compliant QR code data
function generateUPIQRCode(options: {
  merchantName: string;
  merchantVPA?: string; // Virtual Payment Address
  transactionId: string;
  amount?: number;
  currency?: string;
  transactionRef: string;
  description: string;
}) {
  const {
    merchantName,
    merchantVPA = 'eventhive@paytm', // Replace with your actual UPI ID
    transactionId,
    amount,
    currency = 'INR',
    transactionRef,
    description
  } = options;

  // UPI QR Code format according to NPCI specifications
  const upiString = [
    `upi://pay?pa=${merchantVPA}`,
    `pn=${encodeURIComponent(merchantName)}`,
    transactionId ? `tr=${transactionId}` : '',
    transactionRef ? `tn=${encodeURIComponent(transactionRef)}` : '',
    amount ? `am=${amount}` : '',
    currency ? `cu=${currency}` : '',
    description ? `mc=${encodeURIComponent(description)}` : ''
  ].filter(Boolean).join('&');

  return upiString;
}

// Function to generate a simple verification QR (not for payment)
function generateTicketQRCode(bookingUuid: string, ticketNumber: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/verify-ticket/${bookingUuid}/${ticketNumber}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      eventId,
      userId,
      attendeeInfo,
      ticketDetails,
      totalAmount
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const body_string = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body_string.toString())
      .digest('hex');

    const is_authentic = expected_signature === razorpay_signature;

    if (!is_authentic) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Generate unique booking reference
    const bookingReference = `EVT-${eventId}-${Date.now()}`;

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        userId: parseInt(userId),
        eventId: parseInt(eventId),
        bookingReference,
        totalAmount,
        discountAmount: 0,
        finalAmount: totalAmount,
        currency: 'INR',
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        attendeeName: attendeeInfo.name,
        attendeeEmail: attendeeInfo.email,
        attendeePhone: attendeeInfo.phone,
        bookingItems: {
          create: ticketDetails.map((ticket: any) => ({
            ticketTypeId: ticket.ticketTypeId,
            quantity: ticket.quantity,
            unitPrice: ticket.price,
            totalPrice: ticket.price * ticket.quantity,
          })),
        },
      },
      include: {
        bookingItems: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: parseInt(userId),
        paymentGateway: 'RAZORPAY',
        transactionId: razorpay_payment_id,
        amount: totalAmount,
        currency: 'INR',
        paymentMethod: 'ONLINE',
        paymentStatus: 'COMPLETED',
        gatewayResponse: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
        completedAt: new Date(),
      },
    });

    // Generate tickets for each booking item
    const tickets = [];
    for (const bookingItem of booking.bookingItems) {
      for (let i = 0; i < bookingItem.quantity; i++) {
        const ticketNumber = `TKT-${booking.id}-${bookingItem.id}-${i + 1}`;
        
        // Generate proper ticket verification QR code (not payment QR)
        const ticketQRCode = generateTicketQRCode(booking.uuid, ticketNumber);
        
        // Generate barcode
        const barcode = `${booking.id}${bookingItem.id}${i + 1}${Date.now()}`;

        const ticket = await prisma.ticket.create({
          data: {
            bookingId: booking.id,
            ticketTypeId: bookingItem.ticketTypeId,
            ticketNumber,
            qrCode: ticketQRCode, // This is for ticket verification, not payment
            barcode,
            attendeeName: attendeeInfo.name,
            attendeeEmail: attendeeInfo.email,
            attendeePhone: attendeeInfo.phone,
          },
        });
        tickets.push(ticket);
      }
    }

    // Update ticket type remaining quantities
    for (const ticket of ticketDetails) {
      await prisma.ticketType.update({
        where: { id: ticket.ticketTypeId },
        data: {
          remainingQuantity: {
            decrement: ticket.quantity,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        id: booking.id,
        uuid: booking.uuid,
        bookingReference: booking.bookingReference,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
      },
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        qrCode: ticket.qrCode,
      })),
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { 
        error: 'Payment verification failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}