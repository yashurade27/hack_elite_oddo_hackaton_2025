import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create categories
    console.log('Creating categories...');
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: "Technology" },
        update: {},
        create: {
          name: "Technology",
          description: "Tech events and conferences",
          icon: "💻",
          colorCode: "#3B82F6"
        }
      }),
      prisma.category.upsert({
        where: { name: "Music" },
        update: {},
        create: {
          name: "Music",
          description: "Music concerts and festivals",
          icon: "🎵",
          colorCode: "#10B981"
        }
      }),
      prisma.category.upsert({
        where: { name: "Business" },
        update: {},
        create: {
          name: "Business",
          description: "Business conferences and networking",
          icon: "💼",
          colorCode: "#F59E0B"
        }
      }),
      prisma.category.upsert({
        where: { name: "Sports" },
        update: {},
        create: {
          name: "Sports",
          description: "Sports events and competitions",
          icon: "⚽",
          colorCode: "#EF4444"
        }
      }),
      prisma.category.upsert({
        where: { name: "Food & Drink" },
        update: {},
        create: {
          name: "Food & Drink",
          description: "Culinary events and tastings",
          icon: "🍕",
          colorCode: "#8B5CF6"
        }
      })
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create organizer user
    console.log('Creating organizer user...');
    const organizer = await prisma.user.upsert({
      where: { email: 'organizer@eventhive.com' },
      update: {},
      create: {
        name: 'Event Organizer',
        email: 'organizer@eventhive.com',
        password: 'password123', // In production, this should be hashed
        role: 'ORGANIZER',
        isVerified: true,
        loyaltyPoints: 0,
        totalSpent: 0
      }
    });

    console.log('✅ Created organizer user');

    // Create sample events
    console.log('Creating events...');
    const events = [];

    // Tech Conference
    const techEvent = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        categoryId: categories[0].id,
        title: "Tech Conference 2025",
        description: "Join us for the biggest technology conference of the year! Learn about the latest trends in AI, web development, and cloud computing. Network with industry leaders and discover new opportunities.",
        shortDescription: "The biggest technology conference of the year",
        venueName: "Tech Convention Center",
        venueAddress: "123 Innovation Drive, Tech City, TC 12345",
        startDatetime: new Date('2025-09-15T09:00:00Z'),
        endDatetime: new Date('2025-09-15T18:00:00Z'),
        maxAttendees: 500,
        minAge: 16,
        status: 'PUBLISHED',
        isFeatured: true,
        isTrending: false,
        ticketTypes: {
          create: [
            {
              name: "Early Bird",
              description: "Early bird special pricing",
              price: 1500,
              totalQuantity: 100,
              remainingQuantity: 100,
              maxPerUser: 5,
              saleStartDatetime: new Date('2025-08-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-14T23:59:59Z'),
              isActive: true
            },
            {
              name: "Regular",
              description: "Regular admission ticket",
              price: 2000,
              totalQuantity: 300,
              remainingQuantity: 300,
              maxPerUser: 5,
              saleStartDatetime: new Date('2025-08-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-14T23:59:59Z'),
              isActive: true
            },
            {
              name: "VIP",
              description: "VIP access with premium perks",
              price: 3500,
              totalQuantity: 100,
              remainingQuantity: 100,
              maxPerUser: 3,
              saleStartDatetime: new Date('2025-08-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-14T23:59:59Z'),
              isActive: true
            }
          ]
        }
      }
    });
    events.push(techEvent);

    // Music Festival
    const musicEvent = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        categoryId: categories[1].id,
        title: "Summer Music Festival",
        description: "Experience an unforgettable weekend of music with top artists from around the world. Multiple stages, food trucks, and an amazing atmosphere await you!",
        shortDescription: "Weekend music festival with top artists",
        venueName: "Sunset Park",
        venueAddress: "456 Music Lane, Festival City, FC 67890",
        startDatetime: new Date('2025-09-20T15:00:00Z'),
        endDatetime: new Date('2025-09-22T23:00:00Z'),
        maxAttendees: 2000,
        minAge: 18,
        status: 'PUBLISHED',
        isFeatured: false,
        isTrending: true,
        ticketTypes: {
          create: [
            {
              name: "General Admission",
              description: "General festival access",
              price: 2500,
              totalQuantity: 1500,
              remainingQuantity: 1500,
              maxPerUser: 8,
              saleStartDatetime: new Date('2025-07-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-19T23:59:59Z'),
              isActive: true
            },
            {
              name: "VIP Experience",
              description: "VIP area access with premium amenities",
              price: 5000,
              totalQuantity: 500,
              remainingQuantity: 500,
              maxPerUser: 4,
              saleStartDatetime: new Date('2025-07-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-19T23:59:59Z'),
              isActive: true
            }
          ]
        }
      }
    });
    events.push(musicEvent);

    // Business Networking Event
    const businessEvent = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        categoryId: categories[2].id,
        title: "Business Networking Mixer",
        description: "Connect with fellow entrepreneurs, investors, and business leaders. Share ideas, build partnerships, and grow your network in a relaxed, professional environment.",
        shortDescription: "Professional networking event for entrepreneurs",
        venueName: "Grand Business Hotel",
        venueAddress: "789 Corporate Blvd, Business District, BD 13579",
        startDatetime: new Date('2025-09-25T18:00:00Z'),
        endDatetime: new Date('2025-09-25T22:00:00Z'),
        maxAttendees: 150,
        minAge: 21,
        status: 'PUBLISHED',
        isFeatured: false,
        isTrending: false,
        ticketTypes: {
          create: [
            {
              name: "Standard",
              description: "Access to networking event with refreshments",
              price: 1000,
              totalQuantity: 120,
              remainingQuantity: 120,
              maxPerUser: 2,
              saleStartDatetime: new Date('2025-08-15T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-24T23:59:59Z'),
              isActive: true
            },
            {
              name: "Premium",
              description: "Includes dinner and priority networking sessions",
              price: 2500,
              totalQuantity: 30,
              remainingQuantity: 30,
              maxPerUser: 1,
              saleStartDatetime: new Date('2025-08-15T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-24T23:59:59Z'),
              isActive: true
            }
          ]
        }
      }
    });
    events.push(businessEvent);

    console.log(`✅ Created ${events.length} events with ticket types`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${categories.length} categories created`);
    console.log(`- 1 organizer created (organizer@eventhive.com / password123)`);
    console.log(`- ${events.length} events created`);
    console.log('\n🚀 You can now:');
    console.log('1. View events on the home page');
    console.log('2. Login as organizer to manage events');
    console.log('3. Register for events as a user');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });