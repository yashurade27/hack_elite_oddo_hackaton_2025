'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronLeft, 
  Users, 
  Ticket, 
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  sampleEventData, 
  sampleMusicEvent, 
  sampleSportsEvent 
} from '@/components/SampleEventData';

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

interface TicketSelection {
  [ticketId: number]: number;
}

interface AttendeeInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ticketType: string;
  specialRequirements: string;
}

export default function EventRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  // Get event data
  const getEventData = () => {
    switch(eventId) {
      case '1':
        return sampleEventData;
      case '2':
        return sampleMusicEvent;
      case '3':
        return sampleSportsEvent;
      default:
        return sampleEventData;
    }
  };

  const event = getEventData();
  const [ticketSelections, setTicketSelections] = useState<TicketSelection>({});
  const [attendeesInfo, setAttendeesInfo] = useState<AttendeeInfo[]>([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Ticket Selection, 2: Attendee Info, 3: Payment
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      const ticket = event.ticketTypes?.find(t => t.id === parseInt(ticketId));
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  // Initialize attendees info when ticket selection changes
  useEffect(() => {
    const newAttendees: AttendeeInfo[] = [];
    
    Object.entries(ticketSelections).forEach(([ticketId, quantity]) => {
      const ticket = event.ticketTypes?.find(t => t.id === parseInt(ticketId));
      if (ticket && quantity > 0) {
        for (let i = 0; i < quantity; i++) {
          newAttendees.push({
            id: `${ticketId}-${i}`,
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            ticketType: ticket.name,
            specialRequirements: ''
          });
        }
      }
    });
    
    setAttendeesInfo(newAttendees);
  }, [ticketSelections, event.ticketTypes]);

  const updateAttendeeInfo = (id: string, field: keyof AttendeeInfo, value: string) => {
    setAttendeesInfo(prev => 
      prev.map(attendee => 
        attendee.id === id ? { ...attendee, [field]: value } : attendee
      )
    );
  };

  const isAttendeeInfoComplete = (attendee: AttendeeInfo) => {
    return attendee.firstName.trim() !== '' && 
           attendee.lastName.trim() !== '' && 
           attendee.email.trim() !== '' && 
           attendee.phone.trim() !== '';
  };

  const allAttendeesInfoComplete = () => {
    return attendeesInfo.length > 0 && attendeesInfo.every(isAttendeeInfoComplete);
  };

  const handleProceedToPayment = () => {
    if (allAttendeesInfoComplete() && agreedToTerms) {
      setCurrentStep(3);
    }
  };

  const handleMakePayment = () => {
    // This will be implemented later
    alert('Payment functionality will be implemented soon!');
  };

  const renderTicketSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          Select Tickets
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose the number of tickets for each type
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {event.ticketTypes?.filter(ticket => ticket.isActive && ticket.remainingQuantity > 0)
          .map((ticket) => (
            <div key={ticket.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{ticket.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatPrice(ticket.price, ticket.currency)}</span>
                    <span>•</span>
                    <span>{ticket.remainingQuantity} available</span>
                    <span>•</span>
                    <span>Max {ticket.maxPerUser} per person</span>
                  </div>
                </div>
                <Badge variant={ticket.price === 0 ? "secondary" : "default"}>
                  {formatPrice(ticket.price, ticket.currency)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTicketQuantity(ticket.id, (ticketSelections[ticket.id] || 0) - 1, ticket.maxPerUser)}
                    disabled={(ticketSelections[ticket.id] || 0) <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-lg min-w-[2rem] text-center">
                    {ticketSelections[ticket.id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTicketQuantity(ticket.id, (ticketSelections[ticket.id] || 0) + 1, ticket.maxPerUser)}
                    disabled={(ticketSelections[ticket.id] || 0) >= ticket.maxPerUser || (ticketSelections[ticket.id] || 0) >= ticket.remainingQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {ticketSelections[ticket.id] > 0 && (
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(ticket.price * ticketSelections[ticket.id], ticket.currency)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

        <Separator />

        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">Total: {getTotalTickets()} tickets</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(getTotalPrice(), 'INR')}
            </p>
          </div>
          
          <Button 
            onClick={() => setCurrentStep(2)}
            disabled={getTotalTickets() === 0}
            size="lg"
          >
            Continue to Attendee Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAttendeeInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Attendee Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please provide information for all {getTotalTickets()} attendees
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {attendeesInfo.map((attendee, index) => (
          <div key={attendee.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{index + 1}</span>
              </div>
              <div>
                <h3 className="font-semibold">Attendee {index + 1}</h3>
                <p className="text-sm text-muted-foreground">{attendee.ticketType}</p>
              </div>
              {isAttendeeInfoComplete(attendee) && (
                <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`firstName-${attendee.id}`}>First Name *</Label>
                <Input
                  id={`firstName-${attendee.id}`}
                  value={attendee.firstName}
                  onChange={(e) => updateAttendeeInfo(attendee.id, 'firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`lastName-${attendee.id}`}>Last Name *</Label>
                <Input
                  id={`lastName-${attendee.id}`}
                  value={attendee.lastName}
                  onChange={(e) => updateAttendeeInfo(attendee.id, 'lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`email-${attendee.id}`}>Email *</Label>
                <Input
                  id={`email-${attendee.id}`}
                  type="email"
                  value={attendee.email}
                  onChange={(e) => updateAttendeeInfo(attendee.id, 'email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`phone-${attendee.id}`}>Phone Number *</Label>
                <Input
                  id={`phone-${attendee.id}`}
                  type="tel"
                  value={attendee.phone}
                  onChange={(e) => updateAttendeeInfo(attendee.id, 'phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`requirements-${attendee.id}`}>Special Requirements (Optional)</Label>
              <Textarea
                id={`requirements-${attendee.id}`}
                value={attendee.specialRequirements}
                onChange={(e) => updateAttendeeInfo(attendee.id, 'specialRequirements', e.target.value)}
                placeholder="Any dietary restrictions, accessibility needs, etc."
                rows={2}
              />
            </div>
          </div>
        ))}

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms and Conditions
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </Label>
          </div>

          {!allAttendeesInfoComplete() && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Please complete all required fields for all attendees
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            Back to Tickets
          </Button>
          
          <Button 
            onClick={handleProceedToPayment}
            disabled={!allAttendeesInfoComplete() || !agreedToTerms}
            size="lg"
          >
            Proceed to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Payment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review your order and complete payment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2">
            {Object.entries(ticketSelections).map(([ticketId, quantity]) => {
              const ticket = event.ticketTypes?.find(t => t.id === parseInt(ticketId));
              if (!ticket || quantity === 0) return null;
              
              return (
                <div key={ticketId} className="flex justify-between">
                  <span>{ticket.name} x{quantity}</span>
                  <span>{formatPrice(ticket.price * quantity, ticket.currency)}</span>
                </div>
              );
            })}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice(), 'INR')}</span>
            </div>
          </div>
        </div>

        {/* Attendees Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Attendees ({attendeesInfo.length})</h3>
          <div className="space-y-2">
            {attendeesInfo.map((attendee, index) => (
              <div key={attendee.id} className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {attendee.firstName} {attendee.lastName} - {attendee.ticketType}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(2)}
          >
            Back to Attendee Info
          </Button>
          
          <Button 
            onClick={handleMakePayment}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Make Payment ({formatPrice(getTotalPrice(), 'INR')})
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              Back to Event
            </Button>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Info Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={event.bannerImage || '/placeholder-event.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(new Date(event.startDatetime))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(new Date(event.startDatetime))}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.venueName}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          {currentStep === 1 && renderTicketSelection()}
          {currentStep === 2 && renderAttendeeInfo()}
          {currentStep === 3 && renderPaymentStep()}
        </div>
      </div>
    </div>
  );
}