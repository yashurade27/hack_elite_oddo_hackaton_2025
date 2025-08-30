'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, Share2, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <p className="text-muted-foreground">
              Your booking has been confirmed and tickets have been generated.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-mono">{bookingId || 'DEMO-12345'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="text-green-600 font-semibold">Confirmed</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-semibold">₹2.00</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Event Information</h3>
              <div className="space-y-2">
                <h4 className="font-medium">TechCrunch Startup Battlefield 2025</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>September 15, 2025 at 9:00 AM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Bengaluru International Exhibition Centre</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Important Notes</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your tickets have been sent to your registered email</li>
                <li>• Please carry a valid ID along with your ticket</li>
                <li>• Arrive 30 minutes before the event starts</li>
                <li>• Screenshots of digital tickets are not accepted</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => alert('Download functionality - Demo')}>
                <Download className="w-4 h-4 mr-2" />
                Download Tickets
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => alert('Share functionality - Demo')}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Event
              </Button>
            </div>

            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}