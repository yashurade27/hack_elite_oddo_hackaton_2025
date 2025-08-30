import { prisma } from '@/lib/prisma';

async function seedDatabase() {
  try {
    // Create categories first
    const techCategory = await prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: "Technology",
        description: "Tech events and conferences",
        icon: "💻",
        colorCode: "#3B82F6"
      }
    });

    const musicCategory = await prisma.category.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: "Music",
        description: "Concerts and music events",
        icon: "🎵",
        colorCode: "#8B5CF6"
      }
    });

    const sportsCategory = await prisma.category.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: "Sports",
        description: "Sports events and tournaments",
        icon: "⚽",
        colorCode: "#10B981"
      }
    });

    // Create events
    const event1 = await prisma.event.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        organizerId: 1, // Assuming user with ID 1 exists
        categoryId: 1,
        title: "TechCrunch Startup Battlefield 2025",
        description: "Join the most prestigious startup competition in India. Watch as innovative startups pitch their groundbreaking ideas to top investors and industry leaders.",
        shortDescription: "The ultimate startup competition with top investors and industry leaders.",
        bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        venueName: "Bengaluru International Exhibition Centre",
        venueAddress: "10th Mile, Tumkur Road, Bengaluru, Karnataka 560073",
        startDatetime: new Date("2025-09-15T09:00:00Z"),
        endDatetime: new Date("2025-09-15T18:00:00Z"),
        timezone: "Asia/Kolkata",
        maxAttendees: 500,
        minAge: 18,
        status: "PUBLISHED",
        isFeatured: true,
        isTrending: true
      }
    });

    // Create ticket types for event 1
    await prisma.ticketType.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        uuid: "ticket-1-uuid",
        eventId: 1,
        name: "Early Bird",
        description: "Limited time offer for early registrations",
        price: 1,
        currency: "INR",
        totalQuantity: 100,
        remainingQuantity: 25,
        maxPerUser: 2,
        saleStartDatetime: new Date("2025-08-01T00:00:00Z"),
        saleEndDatetime: new Date("2025-09-01T23:59:59Z"),
        isActive: true
      }
    });

    await prisma.ticketType.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        uuid: "ticket-2-uuid",
        eventId: 1,
        name: "General",
        description: "Standard admission ticket",
        price: 2,
        currency: "INR",
        totalQuantity: 300,
        remainingQuantity: 150,
        maxPerUser: 5,
        saleStartDatetime: new Date("2025-08-01T00:00:00Z"),
        saleEndDatetime: new Date("2025-09-14T23:59:59Z"),
        isActive: true
      }
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();