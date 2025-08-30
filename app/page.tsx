"use client";

import { useRouter } from 'next/navigation';
import CardEvent from "@/components/CardEvent";
import SearchHome from "@/components/User/SearchHome";
import {
  sampleEventData,
  sampleMusicEvent,
  sampleSportsEvent,
} from "@/components/SampleEventData";

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
        <SearchHome />
      </div>

      {/* Events Grid Section */}
      <div className="w-full px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Featured Events
          </h2>
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
      {/* <div className="w-full px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to discover more events?</h3>
            <p className="text-purple-100">Join thousands of event-goers and never miss out on amazing experiences!</p>
          </div>
        </div>
      </div> */}
      <footer className="flex justify-center">
        <div className="flex max-w-[960px] flex-1 flex-col">
          <div className="flex flex-col gap-6 px-5 py-10 text-center @container">
            <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
              <a
                className="text-[#4e7297] text-base font-normal min-w-40 hover:text-[#363673] transition-colors"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-[#4e7297] text-base font-normal min-w-40 hover:text-[#363673] transition-colors"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-[#4e7297] text-base font-normal min-w-40 hover:text-[#363673] transition-colors"
                href="#"
              >
                Contact Us
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="#"
                className="text-[#4e7297] hover:text-[#363673] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Z" />
                </svg>
              </a>

              <a
                href="#"
                className="text-[#4e7297] hover:text-[#363673] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z" />
                </svg>
              </a>

              <a
                href="#"
                className="text-[#4e7297] hover:text-[#363673] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
                </svg>
              </a>
            </div>

            <p className="text-[#4e7297] text-sm font-normal leading-normal">
              © {new Date().getFullYear()} Neighborhood Watch. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
