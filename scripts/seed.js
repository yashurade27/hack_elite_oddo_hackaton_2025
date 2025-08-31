import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create categories
    console.log('Creating categories...');
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Technology' },
        update: {},
        create: {
          name: 'Technology',
          description: 'Tech conferences, workshops, and meetups',
          icon: '💻',
          colorCode: '#3B82F6',
        },
      }),
      prisma.category.upsert({
        where: { name: 'Music' },
        update: {},
        create: {
          name: 'Music',
          description: 'Concerts, festivals, and music events',
          icon: '🎵',
          colorCode: '#8B5CF6',
        },
      }),
      prisma.category.upsert({
        where: { name: 'Sports' },
        update: {},
        create: {
          name: 'Sports',
          description: 'Sports events, tournaments, and games',
          icon: '⚽',
          colorCode: '#10B981',
        },
      }),
      prisma.category.upsert({
        where: { name: 'Business' },
        update: {},
        create: {
          name: 'Business',
          description: 'Networking events, seminars, and conferences',
          icon: '💼',
          colorCode: '#F59E0B',
        },
      }),
      prisma.category.upsert({
        where: { name: 'Arts & Culture' },
        update: {},
        create: {
          name: 'Arts & Culture',
          description: 'Art exhibitions, cultural events, and workshops',
          icon: '🎨',
          colorCode: '#EC4899',
        },
      }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample organizer
    console.log('Creating organizer user...');
    const organizer = await prisma.user.upsert({
      where: { email: 'organizer@eventhive.com' },
      update: {},
      create: {
        email: 'organizer@eventhive.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewXBNHMM8LfM2Xoi', // password123
        firstName: 'Event',
        lastName: 'Organizer',
        phone: '+91-9876543210',
        userType: 'ORGANIZER',
        isVerified: true,
        isActive: true,
      },
    });

    console.log('✅ Created organizer user');

    // Get category references
    const techCategory = categories.find(c => c.name === 'Technology');
    const musicCategory = categories.find(c => c.name === 'Music');
    const sportsCategory = categories.find(c => c.name === 'Sports');

    // Create sample events
    console.log('Creating sample events...');
    
    // Tech Conference
    const techEvent = await prisma.event.create({
      data: {
        title: 'Future Tech Conference 2025',
        description: 'Join us for the most innovative technology conference of the year. Learn about AI, blockchain, quantum computing, and the future of technology from industry leaders and experts.',
        shortDescription: 'The premier technology conference featuring AI, blockchain, and quantum computing insights.',
        bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        categoryId: techCategory.id,
        organizerId: organizer.id,
        venueName: 'Mumbai Convention Center',
        venueAddress: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
        latitude: 19.0596,
        longitude: 72.8295,
        startDatetime: new Date('2025-09-15T09:00:00Z'),
        endDatetime: new Date('2025-09-15T18:00:00Z'),
        timezone: 'Asia/Kolkata',
        maxAttendees: 500,
        minAge: 16,
        status: 'PUBLISHED',
        isFeatured: true,
        refundPolicy: 'Full refund available up to 7 days before the event.',
        termsConditions: 'By attending this event, you agree to our photography policy and code of conduct.',
        ticketTypes: {
          create: [
            {
              name: 'Early Bird',
              description: 'Early bird special pricing - includes lunch and networking session',
              price: 2999,
              currency: 'INR',
              totalQuantity: 100,
              remainingQuantity: 85,
              maxPerUser: 5,
              saleStartDatetime: new Date('2025-06-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-08-15T23:59:59Z'),
              isActive: true,
            },
            {
              name: 'Regular',
              description: 'Regular admission ticket - includes lunch',
              price: 3999,
              currency: 'INR',
              totalQuantity: 300,
              remainingQuantity: 280,
              maxPerUser: 10,
              saleStartDatetime: new Date('2025-06-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-14T23:59:59Z'),
              isActive: true,
            },
            {
              name: 'VIP',
              description: 'VIP access with front row seating, networking dinner, and exclusive workshop',
              price: 7999,
              currency: 'INR',
              totalQuantity: 50,
              remainingQuantity: 42,
              maxPerUser: 3,
              saleStartDatetime: new Date('2025-06-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-09-14T23:59:59Z'),
              isActive: true,
            },
          ],
        },
      },
    });

    // Music Concert
    const musicEvent = await prisma.event.create({
      data: {
        title: 'Indie Music Festival',
        description: 'Experience the best of indie music with performances from emerging and established artists. A full day of music, food, and great vibes in the heart of the city.',
        shortDescription: 'A celebration of indie music featuring emerging and established artists.',
        bannerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        categoryId: musicCategory.id,
        organizerId: organizer.id,
        venueName: 'Phoenix Marketcity Amphitheater',
        venueAddress: 'Lal Bahadur Shastri Rd, Kurla West, Mumbai, Maharashtra 400070',
        latitude: 19.0822,
        longitude: 72.8814,
        startDatetime: new Date('2025-10-20T16:00:00Z'),
        endDatetime: new Date('2025-10-20T23:00:00Z'),
        timezone: 'Asia/Kolkata',
        maxAttendees: 1000,
        minAge: 18,
        status: 'PUBLISHED',
        isTrending: true,
        refundPolicy: 'Tickets are non-refundable but transferable to other persons.',
        termsConditions: 'Age verification required. No outside food or beverages allowed.',
        ticketTypes: {
          create: [
            {
              name: 'General Admission',
              description: 'Standing access to the concert area',
              price: 1999,
              currency: 'INR',
              totalQuantity: 700,
              remainingQuantity: 650,
              maxPerUser: 8,
              saleStartDatetime: new Date('2025-07-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-10-19T23:59:59Z'),
              isActive: true,
            },
            {
              name: 'Premium Standing',
              description: 'Premium standing area closer to the stage',
              price: 3499,
              currency: 'INR',
              totalQuantity: 200,
              remainingQuantity: 175,
              maxPerUser: 6,
              saleStartDatetime: new Date('2025-07-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-10-19T23:59:59Z'),
              isActive: true,
            },
            {
              name: 'VIP Seating',
              description: 'Reserved seating with complimentary drinks and snacks',
              price: 5999,
              currency: 'INR',
              totalQuantity: 100,
              remainingQuantity: 88,
              maxPerUser: 4,
              saleStartDatetime: new Date('2025-07-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-10-19T23:59:59Z'),
              isActive: true,
            },
          ],
        },
      },
    });

    // Sports Event
    const sportsEvent = await prisma.event.create({
      data: {
        title: 'Mumbai Marathon 2025',
        description: 'Join thousands of runners in the annual Mumbai Marathon. Choose from 5K, 10K, half marathon, or full marathon distances. All fitness levels welcome!',
        shortDescription: 'Annual marathon event with multiple distance options for all fitness levels.',
        bannerImage: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&q=80',
        categoryId: sportsCategory.id,
        organizerId: organizer.id,
        venueName: 'Chhatrapati Shivaji Maharaj Terminus',
        venueAddress: 'Chhatrapati Shivaji Terminus Area, Fort, Mumbai, Maharashtra 400001',
        latitude: 18.9401,
        longitude: 72.8353,
        startDatetime: new Date('2025-11-15T06:00:00Z'),
        endDatetime: new Date('2025-11-15T12:00:00Z'),
        timezone: 'Asia/Kolkata',
        maxAttendees: 5000,
        minAge: 12,
        status: 'PUBLISHED',
        refundPolicy: 'Registration fees are non-refundable but bib transfers are allowed.',
        termsConditions: 'Medical certificate required for full marathon participants.',
        ticketTypes: {
          create: [
            {
              name: '5K Fun Run',
              description: 'Perfect for beginners - includes t-shirt, medal, and refreshments',
              price: 800,
              currency: 'INR',
              totalQuantity: 2000,
              remainingQuantity: 1750,
              maxPerUser: 5,
              saleStartDatetime: new Date('2025-08-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-11-10T23:59:59Z'),
              isActive: true,
            },
            {
              name: '10K Challenge',
              description: 'Intermediate distance - includes t-shirt, medal, and refreshments',
              price: 1200,
              currency: 'INR',
              totalQuantity: 1500,
              remainingQuantity: 1320,
              maxPerUser: 3,
              saleStartDatetime: new Date('2025-08-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-11-10T23:59:59Z'),
              isActive: true,
            },
            {
              name: 'Half Marathon',
              description: '21K distance - includes premium t-shirt, finisher medal, and goodies',
              price: 2000,
              currency: 'INR',
              totalQuantity: 1000,
              remainingQuantity: 850,
              maxPerUser: 2,
              saleStartDatetime: new Date('2025-08-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-11-05T23:59:59Z'),
              isActive: true,
            },
            {
              name: 'Full Marathon',
              description: 'Ultimate 42K challenge - includes premium package and recognition',
              price: 3500,
              currency: 'INR',
              totalQuantity: 500,
              remainingQuantity: 425,
              maxPerUser: 1,
              saleStartDatetime: new Date('2025-08-01T00:00:00Z'),
              saleEndDatetime: new Date('2025-11-01T23:59:59Z'),
              isActive: true,
            },
          ],
        },
      },
    });

    console.log('✅ Created 3 sample events');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${categories.length} categories created`);
    console.log(`- 1 organizer created (organizer@eventhive.com / password123)`);
    console.log(`- 3 events created with ticket types`);
    console.log('\nYou can now:');
    console.log('1. View events on the home page');
    console.log('2. Login as organizer (organizer@eventhive.com / password123)');
    console.log('3. Create new events as an organizer');
    console.log('4. Register for events as a user');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });