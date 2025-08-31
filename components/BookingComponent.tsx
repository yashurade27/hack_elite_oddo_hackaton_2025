'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { toast } from 'sonner';

const bookingFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  ticketTypeId: z.string().min(1, 'Please select a ticket type'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 tickets per booking'),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  remainingQuantity: number;
  maxPerUser: number;
}

interface Event {
  uuid: string;
  title: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  venueName: string;
  venueAddress: string;
  bannerImageUrl: string | null;
  category: {
    name: string;
    icon: string;
  };
  ticketTypes: TicketType[];
}

interface BookingComponentProps {
  event: Event;
  onBookingComplete?: (bookingId: string) => void;
}

export default function BookingComponent({ event, onBookingComplete }: BookingComponentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      ticketTypeId: '',
      quantity: 1,
    },
  });

  const watchedTicketTypeId = form.watch('ticketTypeId');
  const watchedQuantity = form.watch('quantity');

  // Update selected ticket type when form value changes
  React.useEffect(() => {
    const ticketType = event.ticketTypes.find(t => t.id === watchedTicketTypeId);
    setSelectedTicketType(ticketType || null);
  }, [watchedTicketTypeId, event.ticketTypes]);

  const calculateTotal = () => {
    if (!selectedTicketType) return 0;
    return selectedTicketType.price * watchedQuantity;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true);
    
    try {
      // Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.uuid,
          ticketTypeId: data.ticketTypeId,
          quantity: data.quantity,
          attendeeDetails: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
          },
        }),
      });

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const booking = await bookingResponse.json();

      if (selectedTicketType && selectedTicketType.price > 0) {
        // Create payment order for paid tickets
        const paymentResponse = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: calculateTotal(),
            currency: 'INR',
            bookingId: booking.id,
          }),
        });

        if (!paymentResponse.ok) {
          throw new Error('Failed to create payment order');
        }

        const order = await paymentResponse.json();

        // Initialize Razorpay payment
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'EventHive',
          description: `Booking for ${event.title}`,
          order_id: order.id,
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: booking.id,
                }),
              });

              if (verifyResponse.ok) {
                toast.success('Payment successful! Your booking is confirmed.');
                onBookingComplete?.(booking.id);
                router.push(`/booking/success?bookingId=${booking.id}`);
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: data.fullName,
            email: data.email,
            contact: data.phone,
          },
          theme: {
            color: '#3b82f6',
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // Free ticket - booking is complete
        toast.success('Free ticket booked successfully!');
        onBookingComplete?.(booking.id);
        router.push(`/booking/success?bookingId=${booking.id}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMaxQuantity = () => {
    if (!selectedTicketType) return 1;
    return Math.min(selectedTicketType.remainingQuantity, selectedTicketType.maxPerUser);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Event Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-muted-foreground mb-4">{event.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{event.category.icon}</span>
                  <span>{event.category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(event.startDatetime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatTime(event.startDatetime)} - {formatTime(event.endDatetime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{event.venueName}</span>
                </div>
              </div>
            </div>
            
            {event.bannerImageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img 
                  src={event.bannerImageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Attendee Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Attendee Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Ticket Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Select Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ticketTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Type *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="space-y-3"
                          >
                            {event.ticketTypes.map((ticketType) => (
                              <div key={ticketType.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                                <RadioGroupItem 
                                  value={ticketType.id} 
                                  id={ticketType.id}
                                  disabled={ticketType.remainingQuantity === 0}
                                />
                                <div className="flex-1">
                                  <Label 
                                    htmlFor={ticketType.id} 
                                    className={`flex items-center justify-between cursor-pointer ${
                                      ticketType.remainingQuantity === 0 ? 'text-muted-foreground' : ''
                                    }`}
                                  >
                                    <div>
                                      <div className="font-medium">{ticketType.name}</div>
                                      {ticketType.description && (
                                        <div className="text-sm text-muted-foreground">
                                          {ticketType.description}
                                        </div>
                                      )}
                                      <div className="text-sm text-muted-foreground">
                                        {ticketType.remainingQuantity > 0 
                                          ? `${ticketType.remainingQuantity} available`
                                          : 'Sold out'
                                        }
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">
                                        {ticketType.price === 0 ? 'Free' : `₹${ticketType.price.toLocaleString()}`}
                                      </div>
                                      {ticketType.remainingQuantity === 0 && (
                                        <Badge variant="destructive" className="text-xs">
                                          Sold Out
                                        </Badge>
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedTicketType && (
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max={getMaxQuantity()}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            Maximum {getMaxQuantity()} tickets per booking
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTicketType ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Ticket Type:</span>
                          <span className="font-medium">{selectedTicketType.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Quantity:</span>
                          <span className="font-medium">{watchedQuantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Price per ticket:</span>
                          <span className="font-medium">
                            {selectedTicketType.price === 0 ? 'Free' : `₹${selectedTicketType.price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="flex items-center gap-1">
                          {calculateTotal() === 0 ? 'Free' : (
                            <>
                              <IndianRupee className="w-4 h-4" />
                              {calculateTotal().toLocaleString()}
                            </>
                          )}
                        </span>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading || selectedTicketType.remainingQuantity === 0}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          calculateTotal() === 0 ? 'Book Free Ticket' : 'Proceed to Payment'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please select a ticket type to see booking summary.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Booking confirmation will be sent to your email</p>
                    <p>• Please arrive 15 minutes before the event starts</p>
                    <p>• Tickets are non-refundable</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}