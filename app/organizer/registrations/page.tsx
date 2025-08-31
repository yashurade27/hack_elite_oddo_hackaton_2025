'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Eye,
  Download,
  Mail,
  Phone,
  Ticket,
  CreditCard,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { getOrganizerEventRegistrations } from '@/lib/actions/events';
import useSession from '@/hooks/useSession';

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatPrice = (price: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export default function OrganizerRegistrationsPage() {
  const router = useRouter();
  const { user } = useSession();
  const [eventGroups, setEventGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get sessionId from localStorage
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('Please log in to view registrations');
          return;
        }

        const result = await getOrganizerEventRegistrations(sessionId);
        
        if (result.success && result.eventGroups) {
          setEventGroups(result.eventGroups);
        } else {
          setError(result.error || 'Failed to load registrations');
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Failed to load registrations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [user]);

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Registrations</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalRegistrations = eventGroups.reduce((sum: number, group: any) => sum + group.totalRegistrations, 0);
  const totalRevenue = eventGroups.reduce((sum: number, group: any) => sum + group.totalRevenue, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Event Registrations</h1>
          <p className="text-muted-foreground">
            View and manage registrations for your events
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{eventGroups.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                  <p className="text-2xl font-bold">{totalRegistrations}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        {eventGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Registrations Found</h3>
            <p className="text-muted-foreground mb-6">
              No one has registered for your events yet. Share your events to get more registrations!
            </p>
            <Button onClick={() => router.push('/organizer/create-event')}>
              Create New Event
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {eventGroups.map((eventGroup: any) => {
              const isExpanded = expandedEvents.has(eventGroup.event.uuid);
              
              return (
                <Card key={eventGroup.event.uuid} className="overflow-hidden">
                  <Collapsible 
                    open={isExpanded} 
                    onOpenChange={() => toggleEventExpansion(eventGroup.event.uuid)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4 text-left">
                            {/* Event Image */}
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={eventGroup.event.bannerImage || '/placeholder-event.jpg'}
                                alt={eventGroup.event.title}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                            
                            {/* Event Info */}
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{eventGroup.event.title}</CardTitle>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(eventGroup.event.startDatetime)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(eventGroup.event.startDatetime)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {eventGroup.event.venueName}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats and Toggle */}
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="flex items-center gap-4 mb-2">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-primary">{eventGroup.totalRegistrations}</p>
                                  <p className="text-xs text-muted-foreground">Registrations</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">{formatPrice(eventGroup.totalRevenue)}</p>
                                  <p className="text-xs text-muted-foreground">Revenue</p>
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Separator className="mb-6" />
                        
                        {/* Actions */}
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold">Registered Attendees</h3>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/events/${eventGroup.event.uuid}`);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Event
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export List
                            </Button>
                          </div>
                        </div>

                        {/* Registrations List */}
                        <div className="space-y-4">
                          {eventGroup.registrations.map((registration: any, index: number) => (
                            <div key={registration.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-semibold text-primary">
                                        {(registration.user.firstName?.[0] || '') + (registration.user.lastName?.[0] || '')}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-semibold">
                                        {registration.user.firstName} {registration.user.lastName}
                                      </p>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Mail className="w-3 h-3" />
                                          {registration.user.email}
                                        </div>
                                        {registration.user.phone && (
                                          <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {registration.user.phone}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Booking Details */}
                                  <div className="ml-14">
                                    <div className="flex items-center gap-4 text-sm mb-2">
                                      <Badge variant="outline">#{registration.bookingReference}</Badge>
                                      <Badge variant={registration.bookingStatus === 'CONFIRMED' ? 'default' : 'secondary'}>
                                        {registration.bookingStatus}
                                      </Badge>
                                      <span className="text-muted-foreground">
                                        Booked: {formatDate(registration.bookingDate)}
                                      </span>
                                    </div>
                                    
                                    {/* Tickets */}
                                    <div className="space-y-1">
                                      {registration.bookingItems?.map((item: any, itemIndex: number) => (
                                        <div key={itemIndex} className="flex justify-between items-center text-sm">
                                          <span>{item.ticketType.name} × {item.quantity}</span>
                                          <span className="font-medium">{formatPrice(item.totalPrice, registration.currency)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-lg font-bold">
                                    {formatPrice(registration.finalAmount, registration.currency)}
                                  </p>
                                  <Badge variant={registration.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs">
                                    {registration.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}