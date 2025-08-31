import { NextRequest, NextResponse } from 'next/server';
import { getEventByUuid } from '@/lib/actions/events';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const result = await getEventByUuid(eventId);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Event GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve event' },
      { status: 500 }
    );
  }
}