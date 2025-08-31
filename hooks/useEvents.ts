'use client';

import { useState, useCallback } from 'react';
import useSession from './useSession';
import { toast } from 'sonner';

interface Event {
  id: number;
  uuid: string;
  title: string;
  description: string;
  shortDescription?: string;
  bannerImage?: string;
  venueName: string;
  venueAddress: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  category: {
    id: number;
    name: string;
    icon?: string;
    colorCode?: string;
  };
  organizer: {
    id: number;
    firstName: string;
    lastName: string;
  };
  ticketTypes: Array<{
    id: number;
    name: string;
    price: number;
    currency: string;
    remainingQuantity: number;
    totalQuantity: number;
  }>;
  _count?: {
    bookings: number;
    reviews: number;
  };
}

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  colorCode?: string;
}

export function useEvents() {
  const { sessionId, user } = useSession();
  const [loading, setLoading] = useState(false);

  const createEvent = useCallback(async (eventData: {
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
    ticketTypes: Array<{
      name: string;
      description?: string;
      price: number;
      currency?: string;
      totalQuantity: number;
      maxPerUser?: number;
      saleStartDatetime: string;
      saleEndDatetime: string;
    }>;
  }) => {
    console.log('createEvent called - sessionId:', sessionId, 'user:', user?.email, 'role:', user?.role);
    
    if (!sessionId || !user) {
      toast.error('Please log in to create events');
      return { success: false };
    }

    if (user.role !== 'ORGANIZER') {
      toast.error('Only organizers can create events');
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...eventData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Event created successfully');
        return { success: true, event: data.event };
      } else {
        toast.error(data.error || 'Failed to create event');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  const getPublicEvents = useCallback(async (filters?: {
    categoryId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters?.categoryId) params.set('categoryId', filters.categoryId.toString());
      if (filters?.search) params.set('search', filters.search);
      if (filters?.limit) params.set('limit', filters.limit.toString());
      if (filters?.offset) params.set('offset', filters.offset.toString());

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, events: data.events as Event[] };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error fetching public events:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrganizerEvents = useCallback(async () => {
    if (!sessionId || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (user.role !== 'ORGANIZER') {
      return { success: false, error: 'Access denied' };
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/events?type=organizer&sessionId=${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, events: data.events as Event[] };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  const getEventByUuid = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, event: data.event as Event };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventUuid: string, eventData: Partial<{
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
    refundPolicy: string;
    termsConditions: string;
  }>) => {
    if (!sessionId || !user) {
      toast.error('Please log in to update events');
      return { success: false };
    }

    if (user.role !== 'ORGANIZER') {
      toast.error('Only organizers can update events');
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          eventUuid,
          ...eventData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Event updated successfully');
        return { success: true, event: data.event };
      } else {
        toast.error(data.error || 'Failed to update event');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  const toggleEventStatus = useCallback(async (eventUuid: string, status: 'PUBLISHED' | 'DRAFT') => {
    if (!sessionId || !user) {
      toast.error('Please log in to change event status');
      return { success: false };
    }

    if (user.role !== 'ORGANIZER') {
      toast.error('Only organizers can change event status');
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          eventUuid,
          action: 'toggle-status',
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Event ${status.toLowerCase()} successfully`);
        return { success: true, event: data.event };
      } else {
        toast.error(data.error || 'Failed to change event status');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error toggling event status:', error);
      toast.error('Failed to change event status');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  const deleteEvent = useCallback(async (eventUuid: string) => {
    if (!sessionId || !user) {
      toast.error('Please log in to delete events');
      return { success: false };
    }

    if (user.role !== 'ORGANIZER') {
      toast.error('Only organizers can delete events');
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/events?sessionId=${sessionId}&eventUuid=${eventUuid}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Event deleted successfully');
        return { success: true };
      } else {
        toast.error(data.error || 'Failed to delete event');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [sessionId, user]);

  const getCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/events?type=categories');
      const data = await response.json();

      if (response.ok) {
        return { success: true, categories: data.categories as Category[] };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  return {
    loading,
    createEvent,
    getPublicEvents,
    getOrganizerEvents,
    getEventByUuid,
    updateEvent,
    toggleEventStatus,
    deleteEvent,
    getCategories,
  };
}