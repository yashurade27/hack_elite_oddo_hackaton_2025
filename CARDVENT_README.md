# CardEvent Component

A comprehensive, feature-rich event card component for displaying event information with ticket details. Built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

### Event Information Display
- **Title & Description**: Full event details with truncation for clean layout
- **Date & Time**: Formatted date and time display with timezone support
- **Location**: Venue name and address information
- **Category**: Color-coded category badges (Technology, Music, Sports, etc.)
- **Event Image**: High-quality banner images with fallback design
- **Status Indicators**: Featured, Trending, and Sold Out badges

### Ticket Management
- **Multiple Ticket Types**: Support for various ticket categories:
  - General Admission
  - VIP/Premium
  - Student Discounts
  - Early Bird Pricing
- **Pricing Display**: Formatted pricing with currency support (₹ for INR)
- **Availability Tracking**: Real-time ticket availability
- **Sale Periods**: Ticket sale start and end dates
- **Purchase Limits**: Maximum tickets per user restrictions

### Smart Features
- **Pricing Intelligence**: Displays lowest available price
- **Availability Status**: Shows remaining tickets and sold-out status
- **Event State Management**: Handles upcoming, ongoing, and completed events
- **Responsive Design**: Mobile-first design with hover effects
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

```tsx
import CardEvent from '@/components/CardEvent';

const MyComponent = () => {
  const handleBookTicket = (eventId: number, ticketTypeId: number) => {
    // Implement booking logic
    console.log(`Booking event ${eventId}, ticket ${ticketTypeId}`);
  };

  const handleViewDetails = (eventId: number) => {
    // Navigate to event details
    router.push(`/events/${eventId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CardEvent
        event={eventData}
        onBookTicket={handleBookTicket}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};
```

## Props

### CardEventProps
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `event` | `EventData` | Yes | Complete event information object |
| `onBookTicket` | `(eventId: number, ticketTypeId: number) => void` | No | Callback when user clicks book ticket |
| `onViewDetails` | `(eventId: number) => void` | No | Callback when user clicks view details |
| `className` | `string` | No | Additional CSS classes |

### EventData Structure
```tsx
interface EventData {
  id: number;
  uuid: string;
  title: string;
  description: string;
  shortDescription?: string;
  bannerImage?: string;
  venueName: string;
  venueAddress: string;
  startDatetime: Date;
  endDatetime: Date;
  timezone: string;
  maxAttendees?: number | null;
  minAge?: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  isFeatured: boolean;
  isTrending: boolean;
  category: Category;
  ticketTypes: TicketType[];
}
```

### TicketType Structure
```tsx
interface TicketType {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  totalQuantity: number;
  remainingQuantity: number;
  maxPerUser: number;
  saleStartDatetime: Date;
  saleEndDatetime: Date;
  isActive: boolean;
}
```

## Styling & Theming

The component uses Tailwind CSS and supports both light and dark themes through CSS variables. Key design elements:

- **Card Layout**: Clean card design with hover effects
- **Color Coding**: Category-based color schemes
- **Typography**: Proper text hierarchy with font weights
- **Spacing**: Consistent padding and margins
- **Responsive**: Mobile-first responsive design

### Category Colors
- **Technology**: Blue theme
- **Music**: Purple theme  
- **Sports**: Green theme
- **Business**: Gray theme
- **Food**: Orange theme
- **Arts**: Pink theme
- **Workshop**: Yellow theme
- **Concert**: Indigo theme
- **Hackathon**: Cyan theme

## Event States

The component intelligently handles different event states:

1. **Upcoming Events**: Full booking functionality
2. **Sold Out**: Disabled booking with sold out indicator
3. **Past Events**: Shows "Event Ended" status
4. **Draft Events**: Shows "Not Available" status
5. **Featured Events**: Special featured badge
6. **Trending Events**: Trending indicator

## Integration with Prisma Schema

This component is designed to work seamlessly with your Prisma schema:

- Matches all `Event` model fields
- Supports all `TicketType` relationships
- Handles `Category` associations
- Compatible with enum values (`EventStatus`, `UserType`, etc.)

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui components:
  - Card
  - Badge
  - Button
  - Separator
- Lucide React icons
- Next.js Image component

## Examples

Check out `EventCardsDemo.tsx` for complete usage examples with sample data covering:
- Technology conferences
- Music concerts
- Sports events
- Various ticket types and pricing strategies

## Performance Considerations

- **Image Optimization**: Uses Next.js Image component for optimized loading
- **Efficient Rendering**: Minimal re-renders with proper key props  
- **Memory Usage**: Lightweight component with no heavy dependencies
- **Accessibility**: WCAG compliant with proper semantic HTML

This component provides a complete solution for displaying event information in a modern, user-friendly interface that matches your EventHive application's requirements.