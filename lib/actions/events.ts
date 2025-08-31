"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

// Default fallback banner image
const DEFAULT_BANNER_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

// Create a new event
export async function createEvent(sessionId: string, eventData: {
  title: string;
  description: string;
  shortDescription?: string;
  bannerImage?: string;
  categoryId: number;
  venueName: string;
  venueAddress: string;
  latitude?: number;
  longitude?: number;
  startDatetime: string;
  endDatetime: string;
  timezone?: string;
  maxAttendees?: number;
  minAge?: number;
  refundPolicy?: string;
  termsConditions?: string;
  ticketTypes: {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    totalQuantity: number;
    maxPerUser?: number;
    saleStartDatetime: string;
    saleEndDatetime: string;
  }[];
}) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.userType !== "ORGANIZER") {
      return { success: false, error: "Only organizers can create events" };
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: eventData.categoryId }
    });

    if (!category) {
      return { success: false, error: "Invalid category" };
    }

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        shortDescription: eventData.shortDescription,
        bannerImage: eventData.bannerImage || DEFAULT_BANNER_IMAGE,
        categoryId: eventData.categoryId,
        organizerId: user.id,
        venueName: eventData.venueName,
        venueAddress: eventData.venueAddress,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        startDatetime: new Date(eventData.startDatetime),
        endDatetime: new Date(eventData.endDatetime),
        timezone: eventData.timezone || "Asia/Kolkata",
        maxAttendees: eventData.maxAttendees,
        minAge: eventData.minAge,
        refundPolicy: eventData.refundPolicy,
        termsConditions: eventData.termsConditions,
        status: "DRAFT",
        ticketTypes: {
          create: eventData.ticketTypes.map(ticket => ({
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            currency: ticket.currency || "INR",
            totalQuantity: ticket.totalQuantity,
            remainingQuantity: ticket.totalQuantity,
            maxPerUser: ticket.maxPerUser || 10,
            saleStartDatetime: new Date(ticket.saleStartDatetime),
            saleEndDatetime: new Date(ticket.saleEndDatetime),
            isActive: true,
          }))
        }
      },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        ticketTypes: true,
      },
    });

    // Convert Decimal objects to numbers for client components
    const serializedEvent = {
      ...event,
      latitude: event.latitude ? Number(event.latitude) : null,
      longitude: event.longitude ? Number(event.longitude) : null,
      ticketTypes: event.ticketTypes.map(ticket => ({
        ...ticket,
        price: Number(ticket.price)
      }))
    };

    return { success: true, event: serializedEvent };
  } catch (error) {
    console.error("Create event error:", error);
    return { success: false, error: "Failed to create event" };
  }
}

// Get all events for public viewing
export async function getPublicEvents(filters?: {
  categoryId?: number;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = {
      status: "PUBLISHED",
      startDatetime: {
        gte: new Date()
      }
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { venueName: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        ticketTypes: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { isTrending: 'desc' },
        { startDatetime: 'asc' }
      ],
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    // Convert Decimal objects to numbers for client components
    const serializedEvents = events.map(event => ({
      ...event,
      latitude: event.latitude ? Number(event.latitude) : null,
      longitude: event.longitude ? Number(event.longitude) : null,
      ticketTypes: event.ticketTypes.map(ticket => ({
        ...ticket,
        price: Number(ticket.price)
      }))
    }));

    return { success: true, events: serializedEvents };
  } catch (error) {
    console.error("Get public events error:", error);
    return { success: false, error: "Failed to retrieve events" };
  }
}

// Get event by UUID
export async function getEventByUuid(uuid: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { uuid },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        ticketTypes: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        reviews: {
          where: { isVisible: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          }
        }
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Convert Decimal objects to numbers for client components
    const serializedEvent = {
      ...event,
      latitude: event.latitude ? Number(event.latitude) : null,
      longitude: event.longitude ? Number(event.longitude) : null,
      ticketTypes: event.ticketTypes.map(ticket => ({
        ...ticket,
        price: Number(ticket.price)
      }))
    };

    return { success: true, event: serializedEvent };
  } catch (error) {
    console.error("Get event by UUID error:", error);
    return { success: false, error: "Failed to retrieve event" };
  }
}

// Get organizer's events
export async function getOrganizerEvents(sessionId: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.userType !== "ORGANIZER") {
      return { success: false, error: "Only organizers can access this" };
    }

    const events = await prisma.event.findMany({
      where: {
        organizerId: user.id
      },
      include: {
        category: true,
        ticketTypes: {
          where: { isActive: true },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert Decimal objects to numbers for client components
    const serializedEvents = events.map(event => ({
      ...event,
      latitude: event.latitude ? Number(event.latitude) : null,
      longitude: event.longitude ? Number(event.longitude) : null,
      ticketTypes: event.ticketTypes.map(ticket => ({
        ...ticket,
        price: Number(ticket.price)
      }))
    }));

    return { success: true, events: serializedEvents };
  } catch (error) {
    console.error("Get organizer events error:", error);
    return { success: false, error: "Failed to retrieve events" };
  }
}

// Update event
export async function updateEvent(sessionId: string, eventUuid: string, eventData: Partial<{
  title: string;
  description: string;
  shortDescription: string;
  bannerImage: string;
  categoryId: number;
  venueName: string;
  venueAddress: string;
  latitude: number;
  longitude: number;
  startDatetime: string;
  endDatetime: string;
  timezone: string;
  maxAttendees: number;
  minAge: number;
  status: string;
  refundPolicy: string;
  termsConditions: string;
}>) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.userType !== "ORGANIZER") {
      return { success: false, error: "Only organizers can update events" };
    }

    // Check if event belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: {
        uuid: eventUuid,
        organizerId: user.id,
      },
    });

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    const updateData: any = { ...eventData };

    // Use fallback image if bannerImage is empty
    if (eventData.bannerImage !== undefined && !eventData.bannerImage) {
      updateData.bannerImage = DEFAULT_BANNER_IMAGE;
    }

    // Convert date strings to Date objects
    if (eventData.startDatetime) {
      updateData.startDatetime = new Date(eventData.startDatetime);
    }
    if (eventData.endDatetime) {
      updateData.endDatetime = new Date(eventData.endDatetime);
    }

    const event = await prisma.event.update({
      where: {
        uuid: eventUuid,
      },
      data: updateData,
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        ticketTypes: true,
      },
    });

    // Convert Decimal objects to numbers for client components
    const serializedEvent = {
      ...event,
      latitude: event.latitude ? Number(event.latitude) : null,
      longitude: event.longitude ? Number(event.longitude) : null,
      ticketTypes: event.ticketTypes.map(ticket => ({
        ...ticket,
        price: Number(ticket.price)
      }))
    };

    return { success: true, event: serializedEvent };
  } catch (error) {
    console.error("Update event error:", error);
    return { success: false, error: "Failed to update event" };
  }
}

// Delete event
export async function deleteEvent(sessionId: string, eventUuid: string) {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.userType !== "ORGANIZER") {
      return { success: false, error: "Only organizers can delete events" };
    }

    // Check if event belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: {
        uuid: eventUuid,
        organizerId: user.id,
      },
      include: {
        _count: {
          select: {
            bookings: true,
          }
        }
      }
    });

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    // Don't allow deletion if there are bookings
    if (existingEvent._count.bookings > 0) {
      return { success: false, error: "Cannot delete event with existing bookings. Please cancel the event instead." };
    }

    await prisma.event.delete({
      where: {
        uuid: eventUuid,
      },
    });

    return { success: true, message: "Event deleted successfully" };
  } catch (error) {
    console.error("Delete event error:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

// Get all categories
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return { success: true, categories };
  } catch (error) {
    console.error("Get categories error:", error);
    return { success: false, error: "Failed to retrieve categories" };
  }
}

// Publish/Unpublish event
export async function toggleEventStatus(sessionId: string, eventUuid: string, status: "PUBLISHED" | "DRAFT") {
  try {
    const user = await getCurrentUser(sessionId);
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.userType !== "ORGANIZER") {
      return { success: false, error: "Only organizers can change event status" };
    }

    // Check if event belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: {
        uuid: eventUuid,
        organizerId: user.id,
      },
      include: {
        ticketTypes: {
          where: { isActive: true }
        }
      }
    });

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    // Validation for publishing
    if (status === "PUBLISHED") {
      if (existingEvent.ticketTypes.length === 0) {
        return { success: false, error: "Cannot publish event without ticket types" };
      }
      
      // If no banner image, use default fallback image
      if (!existingEvent.bannerImage) {
        await prisma.event.update({
          where: { uuid: eventUuid },
          data: { bannerImage: DEFAULT_BANNER_IMAGE }
        });
      }
    }

    const event = await prisma.event.update({
      where: {
        uuid: eventUuid,
      },
      data: { status },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        ticketTypes: true,
      },
    });

    // Convert Decimal objects to numbers for client components
    const serializedEvent = {
      ...event,
      latitude: event.latitude ? Number(event.latitude) : null,
      longitude: event.longitude ? Number(event.longitude) : null,
      ticketTypes: event.ticketTypes.map(ticket => ({
        ...ticket,
        price: Number(ticket.price)
      }))
    };

    return { success: true, event: serializedEvent };
  } catch (error) {
    console.error("Toggle event status error:", error);
    return { success: false, error: "Failed to update event status" };
  }
}