"use client";

import { useRouter } from 'next/navigation';
import CardEvent from "@/components/CardEvent";
import SearchHome from "@/components/User/SearchHome";
import { sampleEventData, sampleMusicEvent, sampleSportsEvent } from "@/components/SampleEventData";

export default function Home() {
  const router = useRouter();

  const handleBookTicket = (eventId: number, ticketTypeId: number) => {
    console.log(`Booking ticket for event ${eventId}, ticket type ${ticketTypeId}`);
    // Navigate directly to event details page for booking
    router.push(`/events/${eventId}`);
  };

  const handleViewDetails = (eventId: number) => {
    console.log(`Viewing details for event ${eventId}`);
    // Navigate to event details page
    router.push(`/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search Section */}
      <div className="w-full px-6 py-8">
        <SearchHome/>
      </div>

      {/* Events Grid Section */}
      <div className="w-full px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardEvent
              event={sampleEventData}
              onBookTicket={handleBookTicket}
              onViewDetails={handleViewDetails}
            />

            <CardEvent
              event={sampleMusicEvent}
              onBookTicket={handleBookTicket}
              onViewDetails={handleViewDetails}
            />

            <CardEvent
              event={sampleSportsEvent}
              onBookTicket={handleBookTicket}
              onViewDetails={handleViewDetails}
            />

            <CardEvent
              event={sampleEventData}
              onBookTicket={handleBookTicket}
              onViewDetails={handleViewDetails}
            />

            <CardEvent
              event={sampleMusicEvent}
              onBookTicket={handleBookTicket}
              onViewDetails={handleViewDetails}
            />

            <CardEvent
              event={sampleSportsEvent}
              onBookTicket={handleBookTicket}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="w-full px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to discover more events?</h3>
            <p className="text-purple-100">Join thousands of event-goers and never miss out on amazing experiences!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
