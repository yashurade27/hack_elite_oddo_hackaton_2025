'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEvents } from '@/hooks/useEvents';
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

export default function OrganizerDashboard() {
  const router = useRouter();
  const { getOrganizerEvents, toggleEventStatus, deleteEvent, loading } = useEvents();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const result = await getOrganizerEvents();
    if (result.success) {
      setEvents(result.events || []);
      setFilteredEvents(result.events || []);
    }
  };

  // Filter events based on search and status
  useEffect(() => {
    let filtered = events;

    if (searchQuery.trim()) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venueName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status.toLowerCase() === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, statusFilter]);

  const handleStatusToggle = async (eventUuid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const result = await toggleEventStatus(eventUuid, newStatus as 'PUBLISHED' | 'DRAFT');
    
    if (result.success) {
      fetchEvents(); // Refresh the events list
    }
  };

  const handleDeleteEvent = async (eventUuid: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      const result = await deleteEvent(eventUuid);
      
      if (result.success) {
        fetchEvents(); // Refresh the events list
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalRevenue = (event: Event) => {
    return event.ticketTypes.reduce((total, ticket) => {
      const soldTickets = ticket.totalQuantity - ticket.remainingQuantity;
      return total + (soldTickets * ticket.price);
    }, 0);
  };

  const getEventStats = () => {
    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.status === 'PUBLISHED').length;
    const totalBookings = events.reduce((sum, e) => sum + (e._count?.bookings || 0), 0);
    const totalRevenue = events.reduce((sum, event) => sum + getTotalRevenue(event), 0);

    return { totalEvents, publishedEvents, totalBookings, totalRevenue };
  };

  const stats = getEventStats();

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and track performance</p>
        </div>
        <Button onClick={() => router.push('/organizer/create-event')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedEvents} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From ticket sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedEvents}</div>
            <p className="text-xs text-muted-foreground">
              Live and accepting bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm pl-10"
              />
            </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('published')}>
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
                  Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Events List */}
          {filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.uuid} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 
                          className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                          onClick={() => router.push(`/organizer/events/${event.uuid}`)}
                        >
                          {event.title}
                        </h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        {event.isFeatured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                        {event.isTrending && (
                          <Badge variant="secondary">Trending</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          {event.category.icon} {event.category.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.startDatetime)}
                        </span>
                        <span className="flex items-center gap-1">
                          📍 {event.venueName}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event._count?.bookings || 0} bookings
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          ₹{getTotalRevenue(event).toLocaleString()} revenue
                        </span>
                        <span>
                          Starting from ₹{Math.min(...event.ticketTypes.map(t => t.price))}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/organizer/events/${event.uuid}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/events/${event.uuid}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Event
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/organizer/events/${event.uuid}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusToggle(event.uuid, event.status)}>
                          <Eye className="w-4 h-4 mr-2" />
                          {event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEvent(event.uuid, event.title)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No events found' : 'No events yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first event to get started'}
              </p>
              {(!searchQuery && statusFilter === 'all') && (
                <Button onClick={() => router.push('/organizer/create-event')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Event
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}