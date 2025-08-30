// import React from 'react';
// import CardEvent from '@/components/CardEvent';
// import { sampleEventData, sampleMusicEvent, sampleSportsEvent } from '@/components/SampleEventData';

// export default function EventCardsDemo() {
//   const handleBookTicket = (eventId: number, ticketTypeId: number) => {
//     console.log(`Booking ticket for event ${eventId}, ticket type ${ticketTypeId}`);
//     // Here you would implement the booking logic
//     // Navigate to booking page or open booking modal
//   };

//   const handleViewDetails = (eventId: number) => {
//     console.log(`Viewing details for event ${eventId}`);
//     // Here you would implement navigation to event details page
//     // router.push(`/events/${eventId}`)
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold mb-2">Featured Events</h1>
//         <p className="text-muted-foreground">Discover amazing events happening around you</p>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <CardEvent
//           event={sampleEventData}
//           onBookTicket={handleBookTicket}
//           onViewDetails={handleViewDetails}
//         />
        
//         <CardEvent
//           event={sampleMusicEvent}
//           onBookTicket={handleBookTicket}
//           onViewDetails={handleViewDetails}
//         />
        
//         <CardEvent
//           event={sampleSportsEvent}
//           onBookTicket={handleBookTicket}
//           onViewDetails={handleViewDetails}
//         />
//       </div>

//       {/* Additional sections */}
//       <div className="mt-12">
//         <h2 className="text-2xl font-bold mb-6">How Our Event Cards Work</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Event Information</h3>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li>• Event title, description, and category</li>
//               <li>• Date, time, and location details</li>
//               <li>• Capacity and age restrictions</li>
//               <li>• Featured and trending badges</li>
//               <li>• High-quality event banners</li>
//             </ul>
//           </div>
          
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Ticket Types</h3>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li>• Multiple ticket categories (General, VIP, Student, Early Bird)</li>
//               <li>• Dynamic pricing with currency support</li>
//               <li>• Sale start and end dates</li>
//               <li>• Real-time availability tracking</li>
//               <li>• Maximum tickets per user limits</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }