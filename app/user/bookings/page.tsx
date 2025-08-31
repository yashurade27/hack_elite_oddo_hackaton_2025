'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  CreditCard,
  Receipt,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getUserRegisteredEvents } from '@/lib/actions/events';
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

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <CheckCircle className="w-4 h-4" />;
    case 'CANCELLED':
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

export default function UserBookingsPage() {
  const router = useRouter();
  const { user } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get sessionId from localStorage
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('Please log in to view your bookings');
          return;
        }

        const result = await getUserRegisteredEvents(sessionId);
        
        if (result.success && result.bookings) {
          setBookings(result.bookings);
        } else {
          setError(result.error || 'Failed to load bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Bookings</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your event bookings and tickets
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground mb-6">
              You haven't booked any events yet. Start exploring events to make your first booking!
            </p>
            <Button onClick={() => router.push('/')}>
              Browse Events
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Event Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={booking.event.bannerImage || '/placeholder-event.jpg'}
                          alt={booking.event.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Event Info */}
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{booking.event.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.event.startDatetime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(booking.event.startDatetime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.event.venueName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Status */}
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(booking.bookingStatus)}>
                        {getStatusIcon(booking.bookingStatus)}
                        <span className="ml-1">{booking.bookingStatus}</span>
                      </Badge>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatPrice(booking.finalAmount, booking.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{booking.bookingReference}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Booked On</p>
                      <p className="text-sm">{formatDate(booking.bookingDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Attendee</p>
                      <p className="text-sm">{booking.attendeeName}</p>
                      <p className="text-xs text-muted-foreground">{booking.attendeeEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                      <Badge variant={booking.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Ticket Details */}
                  <div>
                    <h4 className="font-medium mb-3">Tickets ({booking.bookingItems?.length || 0})</h4>
                    <div className="space-y-2">
                      {booking.bookingItems?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{item.ticketType.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × {formatPrice(item.unitPrice, booking.currency)}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatPrice(item.totalPrice, booking.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/events/${booking.event.uuid}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Event
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      {booking.bookingStatus === 'CONFIRMED' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download Ticket
                          </Button>
                          <Button variant="outline" size="sm">
                            <Receipt className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}