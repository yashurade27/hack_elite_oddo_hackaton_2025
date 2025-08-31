import { NextRequest, NextResponse } from 'next/server';
import { 
  createEvent, 
  getPublicEvents, 
  getOrganizerEvents, 
  updateEvent, 
  deleteEvent,
  getCategories,
  toggleEventStatus
} from '@/lib/actions/events';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (type === 'organizer' && sessionId) {
      // Get organizer's events
      const result = await getOrganizerEvents(sessionId);
      return NextResponse.json(result);
    } else if (type === 'categories') {
      // Get categories
      const result = await getCategories();
      return NextResponse.json(result);
    } else {
      // Get public events
      const filters = {
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        search: search || undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      };

      const result = await getPublicEvents(filters);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, ...eventData } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const result = await createEvent(sessionId, eventData);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, eventUuid, action, ...eventData } = body;

    if (!sessionId || !eventUuid) {
      return NextResponse.json(
        { success: false, error: 'Session ID and Event UUID are required' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'toggle-status') {
      result = await toggleEventStatus(sessionId, eventUuid, eventData.status);
    } else {
      result = await updateEvent(sessionId, eventUuid, eventData);
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Events PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const eventUuid = searchParams.get('eventUuid');

    if (!sessionId || !eventUuid) {
      return NextResponse.json(
        { success: false, error: 'Session ID and Event UUID are required' },
        { status: 400 }
      );
    }

    const result = await deleteEvent(sessionId, eventUuid);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Events DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}