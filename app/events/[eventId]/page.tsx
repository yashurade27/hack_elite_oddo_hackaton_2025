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
  Ticket,
  Share2,
  Heart,
  Star,
  ChevronLeft,
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getEventByUuid } from '@/lib/actions/events';

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

const getCategoryColor = (categoryName: string) => {
  const colors: Record<string, string> = {
    'Music': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800',
    'Sports': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800',
    'Technology': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800',
  };
  return colors[categoryName] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-700';
};

interface TicketSelection {
  [ticketId: number]: number;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  
  // State for dynamic data
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketSelections, setTicketSelections] = useState<TicketSelection>({});
  const [isLiked, setIsLiked] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        setError(null);
        const result = await getEventByUuid(eventId);
        
        if (result.success && result.event) {
          setEvent(result.event);
        } else {
          setError(result.error || 'Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'This event could not be found.'}</p>
          <div className="space-x-4">
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => router.push('/')}>
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Utility functions (moved after null checks)
  const updateTicketQuantity = (ticketId: number, quantity: number, maxPerUser: number) => {
    setTicketSelections(prev => ({
      ...prev,
      [ticketId]: Math.max(0, Math.min(quantity, maxPerUser))
    }));
  };

  const getTotalTickets = () => {
    return Object.values(ticketSelections).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(ticketSelections).reduce((total, [ticketId, quantity]) => {
      const ticket = event?.ticketTypes?.find((t: any) => t.id === parseInt(ticketId));
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const getAvailableTickets = () => {
    if (!event?.ticketTypes) return 0;
    return event.ticketTypes.reduce((total: number, ticket: any) => 
      ticket.isActive ? total + ticket.remainingQuantity : total, 0
    );
  };

  const isEventSoldOut = getAvailableTickets() === 0;
  const isEventUpcoming = new Date(event.startDatetime) > new Date();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'This event could not be found.'}</p>
          <div className="space-x-4">
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => router.push('/')}>
              Browse Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Events
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div className="space-y-6">
              {/* Event Image */}
              <div className="relative h-96 w-full overflow-hidden rounded-2xl">
                <Image
                  src={event.bannerImage || '/placeholder-event.jpg'}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {event.isFeatured && (
                    <Badge className="bg-yellow-500/90 text-yellow-900 border-yellow-400">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {event.isTrending && (
                    <Badge className="bg-red-500/90 text-white border-red-400">
                      🔥 Trending
                    </Badge>
                  )}
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={getCategoryColor(event.category.name)}>
                    {event.category.icon} {event.category.name}
                  </Badge>
                </div>
              </div>

              {/* Event Title and Description */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-foreground leading-tight">
                  {event.title}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {event.shortDescription}
                </p>
              </div>
            </div>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-base">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-muted-foreground">{formatDate(new Date(event.startDatetime))}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-base">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-muted-foreground">
                          {formatTime(new Date(event.startDatetime))} - {formatTime(new Date(event.endDatetime))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">{event.venueName}</p>
                    <p className="text-muted-foreground">{event.venueAddress}</p>
                  </div>
                </div>

                <Separator />

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.maxAttendees && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-muted-foreground">{formatNumber(event.maxAttendees)} attendees</p>
                      </div>
                    </div>
                  )}
                  {event.minAge && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Age Restriction</p>
                        <p className="text-muted-foreground">{event.minAge}+ years</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Registration & Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Registration Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    Register for Event
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Starting from {formatPrice(event.ticketTypes?.[0]?.price || 0, 'INR')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary mb-1">
                        {getAvailableTickets()} 
                      </p>
                      <p className="text-sm text-muted-foreground">tickets available</p>
                    </div>
                    
                    {isEventSoldOut ? (
                      <Badge variant="destructive" className="text-base px-6 py-3 w-full">
                        Event Sold Out
                      </Badge>
                    ) : !isEventUpcoming ? (
                      <Badge variant="secondary" className="text-base px-6 py-3 w-full">
                        Event Ended
                      </Badge>
                    ) : event.status !== 'PUBLISHED' ? (
                      <Badge variant="secondary" className="text-base px-6 py-3 w-full">
                        Event Not Available
                      </Badge>
                    ) : (
                      <Button 
                        className="w-full h-14 text-lg font-semibold" 
                        size="lg"
                        onClick={() => router.push(`/events/${eventId}/register`)}
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Register Now
                      </Button>
                    )}
                  </div>

                  {/* Quick Ticket Info */}
                  {!isEventSoldOut && isEventUpcoming && event.status === 'PUBLISHED' && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="font-medium text-sm">Available Tickets:</h4>
                      {event.ticketTypes?.filter((ticket: any) => ticket.isActive && ticket.remainingQuantity > 0)
                        .slice(0, 3)
                        .map((ticket: any) => (
                          <div key={ticket.id} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{ticket.name}</span>
                            <span className="font-medium">{formatPrice(ticket.price, ticket.currency)}</span>
                          </div>
                        ))}
                      {(event.ticketTypes?.filter((ticket: any) => ticket.isActive && ticket.remainingQuantity > 0).length || 0) > 3 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          +{(event.ticketTypes?.filter((ticket: any) => ticket.isActive && ticket.remainingQuantity > 0).length || 0) - 3} more ticket types
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Component */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Event Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium">{event.venueName}</p>
                    <p className="text-sm text-muted-foreground">{event.venueAddress}</p>
                  </div>
                  
                  {/* Map Placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border border-border">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-primary/40 mx-auto mb-2" />
                      <p className="text-lg font-medium text-muted-foreground">Map</p>
                      <p className="text-xs text-muted-foreground">Interactive map coming soon</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </CardContent>
              </Card>

              {/* Organizer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Event Organizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Organizer Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border">
                      <Users className="w-6 h-6 text-primary/60" />
                    </div>
                    
                    {/* Organizer Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.category.name} event organizer with expertise in creating memorable experiences.
                      </p>
                      
                      {/* Organizer Stats */}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Verified Organizer</span>
                        <span>{event._count?.bookings || 0} Bookings</span>
                        <span>{event._count?.reviews || 0} Reviews</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Contact Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Contact Organizer
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
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