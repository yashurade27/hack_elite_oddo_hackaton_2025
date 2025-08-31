'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Share2,
  BarChart3,
  DollarSign,
  Ticket,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEvents } from '@/hooks/useEvents';
import { toast } from 'sonner';

// Utility functions
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const formatPrice = (price: number, currency: string) => {
  if (price === 0) return 'Free';
  return `${currency === 'INR' ? '₹' : currency}${formatNumber(price)}`;
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

const getCategoryColor = (categoryName: string) => {
  const colors: Record<string, string> = {
    'Music': 'bg-purple-100 text-purple-800 border-purple-200',
    'Sports': 'bg-green-100 text-green-800 border-green-200',
    'Technology': 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return colors[categoryName] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function OrganizerEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const { getEventByUuid, toggleEventStatus, deleteEvent, loading } = useEvents();
  
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      const result = await getEventByUuid(eventId);
      if (result.success && result.event) {
        setEvent(result.event);
      } else {
        setError(result.error || 'Event not found');
      }
    };

    fetchEvent();
  }, [eventId, getEventByUuid]);

  const handleStatusToggle = async () => {
    if (!event) return;
    
    const newStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const result = await toggleEventStatus(event.uuid, newStatus);
    
    if (result.success) {
      setEvent({ ...event, status: newStatus });
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    
    if (confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      const result = await deleteEvent(event.uuid);
      
      if (result.success) {
        router.push('/organizer');
      }
    }
  };

  const getTotalRevenue = () => {
    if (!event?.ticketTypes) return 0;
    return event.ticketTypes.reduce((total: number, ticket: any) => {
      const soldTickets = ticket.totalQuantity - ticket.remainingQuantity;
      return total + (soldTickets * ticket.price);
    }, 0);
  };

  const getTotalBookings = () => {
    return event?._count?.bookings || 0;
  };

  const getAvailableTickets = () => {
    return event?.ticketTypes?.reduce((total: number, ticket: any) => 
      ticket.isActive ? total + ticket.remainingQuantity : total, 0
    ) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'The event you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/organizer')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => router.push('/organizer')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{event.title}</h1>
                <p className="text-sm text-muted-foreground">Event Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => window.open(`/events/${eventId}`, '_blank')}
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => router.push(`/organizer/events/${eventId}/edit`)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleStatusToggle}
                disabled={loading}
              >
                {event.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-2"
                onClick={handleDeleteEvent}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Status & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={`mt-2 ${getStatusColor(event.status)}`}>
                        {event.status === 'PUBLISHED' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {event.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{getTotalBookings()}</div>
                      <p className="text-xs text-muted-foreground">Total Bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <div className="text-2xl font-bold">₹{formatNumber(getTotalRevenue())}</div>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Available Tickets</p>
                      <div className="text-2xl font-bold">{getAvailableTickets()}</div>
                    </div>
                    <Ticket className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Event Header */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Event Image */}
                  <div className="relative h-64 w-full overflow-hidden rounded-lg">
                    <Image
                      src={event.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {event.isFeatured && (
                        <Badge className="bg-yellow-500/90 text-yellow-900 border-yellow-400">
                          Featured
                        </Badge>
                      )}
                      {event.isTrending && (
                        <Badge className="bg-red-500/90 text-white border-red-400">
                          🔥 Trending
                        </Badge>
                      )}
                      <Badge className={getCategoryColor(event.category.name)}>
                        {event.category.icon} {event.category.name}
                      </Badge>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{event.title}</h2>
                      <p className="text-muted-foreground mt-2">{event.shortDescription}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">{formatDate(new Date(event.startDatetime))}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Time</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(new Date(event.startDatetime))} - {formatTime(new Date(event.endDatetime))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Venue</p>
                          <p className="text-sm text-muted-foreground">{event.venueName}</p>
                        </div>
                      </div>
                      {event.maxAttendees && (
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Capacity</p>
                            <p className="text-sm text-muted-foreground">{formatNumber(event.maxAttendees)} attendees</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle>Event Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Ticket Types */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.ticketTypes?.map((ticket: any, index: number) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{ticket.name}</h4>
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Price: {formatPrice(ticket.price, ticket.currency)}</span>
                            <span>Available: {ticket.remainingQuantity}/{ticket.totalQuantity}</span>
                            <span>Max per person: {ticket.maxPerUser}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatPrice(ticket.price, ticket.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.totalQuantity - ticket.remainingQuantity} sold
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions & Analytics */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(`/events/${eventId}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Event Page
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => router.push(`/organizer/events/${eventId}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
                      toast.success('Event link copied to clipboard!');
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Event Link
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement analytics page
                      toast.info('Analytics page coming soon!');
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Event Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Featured</span>
                    <Badge variant={event.isFeatured ? "default" : "secondary"}>
                      {event.isFeatured ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trending</span>
                    <Badge variant={event.isTrending ? "default" : "secondary"}>
                      {event.isTrending ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      variant={event.status === 'PUBLISHED' ? "destructive" : "default"}
                      onClick={handleStatusToggle}
                      disabled={loading}
                    >
                      {event.status === 'PUBLISHED' ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Unpublish Event
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Publish Event
                        </>
                      )}
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={handleDeleteEvent}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Revenue</span>
                      <span className="font-medium">₹{formatNumber(getTotalRevenue())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Bookings</span>
                      <span className="font-medium">{getTotalBookings()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tickets Remaining</span>
                      <span className="font-medium">{getAvailableTickets()}</span>
                    </div>
                    {event.ticketTypes && event.ticketTypes.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Conversion Rate</span>
                        <span className="font-medium">
                          {(((event.ticketTypes.reduce((total: number, t: any) => total + t.totalQuantity, 0) - getAvailableTickets()) / 
                            event.ticketTypes.reduce((total: number, t: any) => total + t.totalQuantity, 0)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}