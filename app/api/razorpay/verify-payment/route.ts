import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendTicketEmail, TicketEmailData } from '@/lib/mail';

// Function to generate ticket verification QR code
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

    console.log('Payment verification data:', {
      eventId,
      userId,
      attendeeInfo,
      ticketDetails,
      totalAmount
    });

    // Validate required fields
    if (!eventId || !userId || !attendeeInfo || !ticketDetails || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields for payment verification' },
        { status: 400 }
      );
    }

    // Verify signature
    const body_string = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body_string.toString())
      .digest('hex');

    if (expected_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Validate event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) }
    });

    if (!event) {
      console.error('Event not found:', eventId);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      console.error('User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate ticket types exist
    for (const ticket of ticketDetails) {
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: ticket.ticketTypeId }
      });
      if (!ticketType) {
        console.error('Ticket type not found:', ticket.ticketTypeId);
        return NextResponse.json(
          { error: `Ticket type not found: ${ticket.ticketTypeId}` },
          { status: 404 }
        );
      }
      if (ticketType.eventId !== parseInt(eventId)) {
        console.error('Ticket type does not belong to event:', {
          ticketTypeId: ticket.ticketTypeId,
          ticketTypeEventId: ticketType.eventId,
          requestEventId: parseInt(eventId)
        });
        return NextResponse.json(
          { error: 'Invalid ticket type for event' },
          { status: 400 }
        );
      }
    }

    // Generate unique booking reference
    const bookingReference = `EVT-${eventId}-${Date.now()}`;

    // Create booking with transaction
    const booking = await prisma.$transaction(async (prisma) => {
      const newBooking = await prisma.booking.create({
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
        include: { bookingItems: { include: { ticketType: true } }, event: true },
      });

      // Update ticket quantities
      for (const ticket of ticketDetails) {
        await prisma.ticketType.update({
          where: { id: ticket.ticketTypeId },
          data: { remainingQuantity: { decrement: ticket.quantity } },
        });
      }

      return newBooking;
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
        gatewayResponse: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
        completedAt: new Date(),
      },
    });

    // Generate tickets
    const tickets = [];
    const emailTickets: TicketEmailData[] = [];

    for (const bookingItem of booking.bookingItems) {
      for (let i = 0; i < bookingItem.quantity; i++) {
        const ticketNumber = `TKT-${booking.id}-${bookingItem.id}-${i + 1}`;
        const ticketQRCode = generateTicketQRCode(booking.uuid, ticketNumber);
        const barcode = `${booking.id}${bookingItem.id}${i + 1}${Date.now()}`;

        const ticket = await prisma.ticket.create({
          data: {
            bookingId: booking.id,
            ticketTypeId: bookingItem.ticketTypeId,
            ticketNumber,
            qrCode: ticketQRCode,
            barcode,
            attendeeName: attendeeInfo.name,
            attendeeEmail: attendeeInfo.email,
            attendeePhone: attendeeInfo.phone,
          },
        });

        tickets.push(ticket);

        // ✅ Prepare email ticket
        emailTickets.push({
          ticketNumber: ticket.ticketNumber,
          qrCode: ticket.qrCode,
          eventTitle: booking.event.title,
          venueName: booking.event.venueName,
          startDate: booking.event.startDatetime,
          attendeeName: booking.attendeeName,
          additionalInfo: `Ticket Type: ${bookingItem.ticketType.name}`,
        });
      }
    }

    // ✅ Send tickets via email
    await sendTicketEmail(booking.attendeeEmail, emailTickets);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully & tickets emailed',
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
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
    }
    
    return NextResponse.json(
      { 
        error: 'Payment verification failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined
      },
      { status: 500 }
    );
  }
}