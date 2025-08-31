

import React from 'react';
import { Calendar, Clock, MapPin, Users, Tag, Ticket, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

// Simplified interface to match dynamic homepage data
interface EventData {
  id: string; // UUID as string for navigation
  uuid: string;
  title: string;
  description: string;
  shortDescription?: string;
  bannerImage?: string;
  venueName: string;
  venueAddress: string;
  startDatetime: string | Date;
  endDatetime: string | Date;
  timezone: string;
  maxAttendees?: number | null;
  minAge?: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'past' | 'sold-out' | 'available';
  isFeatured: boolean;
  isTrending: boolean;
  category: {
    id: number;
    name: string;
    icon?: string;
    colorCode?: string;
  };
  ticketTypes?: {
    id: number;
    name: string;
    price: number;
    currency: string;
    remainingQuantity: number;
    isActive: boolean;
  }[];
  // Additional dynamic properties from HomePage
  date?: string;
  time?: string;
  location?: string;
  price?: number;
  currency?: string;
  formattedPrice?: string;
  attendees?: number;
  totalReviews?: number;
  organizer?: string;
  organizerName?: string;
  image?: string;
  categoryColor?: string;
  availableTickets?: number;
}

interface CardEventProps {
  event: EventData;
  onBookTicket?: (eventId: string) => void; // Changed to string for UUID
  onViewDetails?: (eventId: string) => void; // Changed to string for UUID
  className?: string;
}

export default function CardEvent({ 
  event, 
  onBookTicket, 
  onViewDetails, 
  className = "" 
}: CardEventProps) {
  
  // Early return if event is not provided or invalid
  if (!event) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Event data not available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure ticketTypes is always an array
  const safeTicketTypes = event.ticketTypes || [];
  
  const formatNumber = (num: number) => {
    // Use a consistent format to avoid hydration mismatches
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(dateObj);
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(dateObj);
    } catch {
      return 'Invalid Time';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return `${currency === 'INR' ? '₹' : currency} ${formatNumber(price)}`;
  };

  const getLowestPrice = () => {
    const activeTickets = safeTicketTypes.filter(ticket => 
      ticket.isActive && ticket.remainingQuantity > 0
    );
    if (activeTickets.length === 0) return null;
    return Math.min(...activeTickets.map(ticket => ticket.price));
  };

  const getAvailableTickets = () => {
    return safeTicketTypes.reduce((total, ticket) => 
      ticket.isActive ? total + ticket.remainingQuantity : total, 0
    );
  };

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      'Music': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800',
      'Sports': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800',
      'Technology': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800',
      'Business': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-700',
      'Food': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800',
      'Arts': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-800',
      'Workshop': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800',
      'Concert': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-200 dark:border-indigo-800',
      'Hackathon': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-200 dark:border-cyan-800',
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-200 dark:border-gray-700';
  };

  const isEventSoldOut = event.status === 'sold-out' || getAvailableTickets() === 0;
  const isEventUpcoming = event.status !== 'past' && (typeof event.startDatetime === 'string' ? new Date(event.startDatetime) : event.startDatetime) > new Date();
  const lowestPrice = event.formattedPrice ? event.price : getLowestPrice();

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 overflow-hidden w-full min-w-[380px] max-w-[420px] mx-auto ${className}`}>
      <CardHeader className="p-0 relative">
        {/* Event Image */}
        <div className="relative h-64 w-full overflow-hidden">
          {(event.image || event.bannerImage) ? (
            <Image
              src={event.image || event.bannerImage || ''}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-primary/40" />
            </div>
          )}
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {event.isFeatured && (
              <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
                Featured
              </Badge>
            )}
            {event.isTrending && (
              <Badge className="bg-red-500 text-white hover:bg-red-600">
                Trending
              </Badge>
            )}
            {isEventSoldOut && (
              <Badge variant="destructive">
                Sold Out
              </Badge>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={getCategoryColor(event.category.name)}>
              {event.category.name}
            </Badge>
          </div>

          {/* Price Tag */}
          {(event.formattedPrice || lowestPrice !== null) && (
            <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center gap-1">
                <IndianRupee className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">
                  {event.formattedPrice || (lowestPrice === 0 ? 'Free' : lowestPrice ? `${formatNumber(lowestPrice)}+` : 'Free')}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Event Title */}
        <h3 className="font-bold text-2xl mb-4 line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Event Description */}
        <p className="text-muted-foreground text-base mb-6 line-clamp-3 leading-relaxed">
          {event.shortDescription || event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-4">
          {/* Date and Time */}
          <div className="flex items-center gap-3 text-base">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
            <span>{event.date || formatDate(event.startDatetime)}</span>
            <Clock className="w-5 h-5 text-primary ml-3 flex-shrink-0" />
            <span>{event.time || formatTime(event.startDatetime)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 text-base">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="line-clamp-1">{event.location || event.venueName}</span>
          </div>

          {/* Capacity */}
          {event.maxAttendees && (
            <div className="flex items-center gap-3 text-base">
              <Users className="w-5 h-5 text-primary flex-shrink-0" />
              <span>Max {formatNumber(event.maxAttendees)} attendees</span>
              <span className="text-muted-foreground">
                • {event.availableTickets || getAvailableTickets()} tickets left
              </span>
            </div>
          )}

          {/* Age Restriction */}
          {event.minAge && (
            <div className="flex items-center gap-3 text-base text-muted-foreground">
              <Tag className="w-5 h-5 flex-shrink-0" />
              <span>Age {event.minAge}+ required</span>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {/* Ticket Types Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="w-5 h-5 text-primary" />
            <span className="font-semibold text-base">Available Tickets</span>
          </div>
          
          {safeTicketTypes.length === 0 ? (
            <div className="text-base text-muted-foreground text-center py-3">
              No tickets available
            </div>
          ) : safeTicketTypes.filter(ticket => ticket.isActive && ticket.remainingQuantity > 0).length === 0 ? (
            <div className="text-base text-muted-foreground text-center py-3">
              All tickets sold out
            </div>
          ) : (
            <div className="space-y-3">
              {safeTicketTypes
                .filter(ticket => ticket.isActive && ticket.remainingQuantity > 0)
                .slice(0, 2) // Show only first 2 ticket types
                .map((ticket) => (
                  <div key={ticket.id} className="flex justify-between items-center text-base p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                    <span className="text-foreground font-medium">{ticket.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">
                        {formatPrice(ticket.price, ticket.currency)}
                      </span>
                      <Badge variant="outline" className="text-sm">
                        {ticket.remainingQuantity} left
                      </Badge>
                    </div>
                  </div>
                ))}
              
              {safeTicketTypes.filter(ticket => ticket.isActive && ticket.remainingQuantity > 0).length > 2 && (
                <div className="text-sm text-muted-foreground text-center pt-2">
                  +{safeTicketTypes.filter(ticket => ticket.isActive && ticket.remainingQuantity > 0).length - 2} more ticket types
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0 flex gap-4">
        <Button
          variant="outline"
          className="flex-1 h-12 text-base font-medium"
          onClick={() => onViewDetails?.(event.uuid)}
        >
          View Details
        </Button>
        
        <Button
          className="flex-1 h-12 text-base font-medium"
          disabled={isEventSoldOut || !isEventUpcoming || (event.status !== 'PUBLISHED' && event.status !== 'available')}
          onClick={() => onBookTicket?.(event.uuid)}
        >
          {isEventSoldOut ? 'Sold Out' : 
           !isEventUpcoming || event.status === 'past' ? 'Event Ended' : 
           (event.status !== 'PUBLISHED' && event.status !== 'available') ? 'Not Available' : 
           'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}