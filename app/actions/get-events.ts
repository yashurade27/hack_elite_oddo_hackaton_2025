"use server";

import {
  sampleEventData,
  sampleMusicEvent,
  sampleSportsEvent,
} from "@/components/SampleEventData";

// Create a larger dataset by duplicating and modifying the sample events
const generateEvents = () => {
  const baseEvents = [sampleEventData, sampleMusicEvent, sampleSportsEvent];
  const events = [];

  for (let i = 0; i < 25; i++) {
    const baseEvent = baseEvents[i % 3];
    const event = {
      ...baseEvent,
      id: i + 1,
      uuid: `event-${i + 1}-uuid`,
      title: `${baseEvent.title} #${i + 1}`,
      startDatetime: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // Events spread over 25 days
      endDatetime: new Date(
        Date.now() + i * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
      ), // 8 hours duration
      ticketTypes: baseEvent.ticketTypes.map((ticket) => ({
        ...ticket,
        id: ticket.id + i * 10,
        uuid: `ticket-${ticket.id + i * 10}-uuid`,
      })),
    };
    events.push(event);
  }

  return events;
};

const allEvents = generateEvents();

type EventType = typeof sampleEventData;

export interface PaginationResult {
  events: EventType[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    eventsPerPage: number;
  };
}

export async function getEvents(
  page: number = 1,
  eventsPerPage: number = 6,
  searchQuery?: string,
  category?: string
): Promise<PaginationResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredEvents = [...allEvents];

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.venueName.toLowerCase().includes(query) ||
        event.category.name.toLowerCase().includes(query)
    );
  }

  // Apply category filter
  if (category && category !== "all") {
    filteredEvents = filteredEvents.filter(
      (event) => event.category.name.toLowerCase() === category.toLowerCase()
    );
  }

  // Calculate pagination
  const totalCount = filteredEvents.length;
  const totalPages = Math.ceil(totalCount / eventsPerPage);
  const startIndex = (page - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;

  // Get events for current page
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  return {
    events: paginatedEvents as EventType[],
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      eventsPerPage,
    },
  };
}
