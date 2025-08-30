// Sample data to demonstrate the CardEvent component
// This shows the exact structure expected by the component

export const sampleEventData = {
  id: 1,
  uuid: "550e8400-e29b-41d4-a716-446655440000",
  title: "TechCrunch Startup Battlefield 2025",
  description: "Join the most prestigious startup competition in India. Watch as innovative startups pitch their groundbreaking ideas to top investors and industry leaders. Network with entrepreneurs, investors, and tech enthusiasts from across the country.",
  shortDescription: "The ultimate startup competition with top investors and industry leaders.",
  bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  venueName: "Bengaluru International Exhibition Centre",
  venueAddress: "10th Mile, Tumkur Road, Bengaluru, Karnataka 560073",
  startDatetime: new Date("2025-09-15T09:00:00Z"),
  endDatetime: new Date("2025-09-15T18:00:00Z"),
  timezone: "Asia/Kolkata",
  maxAttendees: 500,
  minAge: 18,
  status: "PUBLISHED" as const,
  isFeatured: true,
  isTrending: true,
  category: {
    id: 1,
    name: "Technology",
    description: "Tech events and conferences",
    icon: "💻",
    colorCode: "#3B82F6"
  },
  ticketTypes: [
    {
      id: 1,
      uuid: "ticket-1-uuid",
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
    },
    {
      id: 2,
      uuid: "ticket-2-uuid", 
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
    },
    {
      id: 3,
      uuid: "ticket-3-uuid",
      name: "Student",
      description: "Discounted tickets for students with valid ID",
      price: 1,
      currency: "INR",
      totalQuantity: 50,
      remainingQuantity: 30,
      maxPerUser: 1,
      saleStartDatetime: new Date("2025-08-01T00:00:00Z"),
      saleEndDatetime: new Date("2025-09-14T23:59:59Z"),
      isActive: true
    },
    {
      id: 4,
      uuid: "ticket-4-uuid",
      name: "VIP",
      description: "Premium access with networking lunch and front row seating",
      price: 2,
      currency: "INR", 
      totalQuantity: 50,
      remainingQuantity: 15,
      maxPerUser: 2,
      saleStartDatetime: new Date("2025-08-01T00:00:00Z"),
      saleEndDatetime: new Date("2025-09-14T23:59:59Z"),
      isActive: true
    }
  ]
};

export const sampleMusicEvent = {
  id: 2,
  uuid: "550e8400-e29b-41d4-a716-446655440001",
  title: "Sunburn Arena ft. Martin Garrix",
  description: "Experience the electrifying performance by world's #1 DJ Martin Garrix in this exclusive arena concert. Dance the night away with the best electronic music.",
  shortDescription: "Martin Garrix live in concert - an unforgettable EDM experience.",
  bannerImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  venueName: "DY Patil Stadium",
  venueAddress: "D.Y. Patil Stadium, Sector 7, Nerul, Navi Mumbai, Maharashtra",
  startDatetime: new Date("2025-10-20T19:00:00Z"),
  endDatetime: new Date("2025-10-21T02:00:00Z"),
  timezone: "Asia/Kolkata",
  maxAttendees: 15000,
  minAge: 21,
  status: "PUBLISHED" as const,
  isFeatured: true,
  isTrending: false,
  category: {
    id: 2,
    name: "Music",
    description: "Concerts and music events",
    icon: "🎵",
    colorCode: "#8B5CF6"
  },
  ticketTypes: [
    {
      id: 5,
      uuid: "ticket-5-uuid",
      name: "General Admission",
      description: "Standing area access",
      price: 1,
      currency: "INR",
      totalQuantity: 10000,
      remainingQuantity: 2500,
      maxPerUser: 4,
      saleStartDatetime: new Date("2025-08-15T00:00:00Z"),
      saleEndDatetime: new Date("2025-10-19T23:59:59Z"),
      isActive: true
    },
    {
      id: 6,
      uuid: "ticket-6-uuid",
      name: "VIP Premium",
      description: "Dedicated VIP area with premium bar access",
      price: 2,
      currency: "INR",
      totalQuantity: 500,
      remainingQuantity: 120,
      maxPerUser: 2,
      saleStartDatetime: new Date("2025-08-15T00:00:00Z"),
      saleEndDatetime: new Date("2025-10-19T23:59:59Z"),
      isActive: true
    }
  ]
};

export const sampleSportsEvent = {
  id: 3,
  uuid: "550e8400-e29b-41d4-a716-446655440002",
  title: "IPL 2025 Final - Mumbai vs Chennai",
  description: "Witness cricket history in the making as two powerhouse teams clash in the ultimate showdown. The most anticipated cricket match of the year with electrifying atmosphere.",
  shortDescription: "The ultimate cricket showdown - IPL Final 2025",
  bannerImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80",
  venueName: "Narendra Modi Stadium",
  venueAddress: "Narendra Modi Stadium, Motera, Ahmedabad, Gujarat 380005",
  startDatetime: new Date("2025-05-26T19:30:00Z"),
  endDatetime: new Date("2025-05-27T00:30:00Z"),
  timezone: "Asia/Kolkata",
  maxAttendees: 132000,
  minAge: null,
  status: "PUBLISHED" as const,
  isFeatured: true,
  isTrending: true,
  category: {
    id: 3,
    name: "Sports",
    description: "Sports events and tournaments",
    icon: "⚽",
    colorCode: "#10B981"
  },
  ticketTypes: [
    {
      id: 7,
      uuid: "ticket-7-uuid",
      name: "Popular Stand",
      description: "Budget-friendly seating with great view",
      price: 1,
      currency: "INR",
      totalQuantity: 50000,
      remainingQuantity: 0, // Sold out
      maxPerUser: 6,
      saleStartDatetime: new Date("2025-03-01T00:00:00Z"),
      saleEndDatetime: new Date("2025-05-25T23:59:59Z"),
      isActive: true
    },
    {
      id: 8,
      uuid: "ticket-8-uuid",
      name: "Premium Stand",
      description: "Premium seating with better amenities",
      price: 2,
      currency: "INR",
      totalQuantity: 20000,
      remainingQuantity: 500,
      maxPerUser: 4,
      saleStartDatetime: new Date("2025-03-01T00:00:00Z"),
      saleEndDatetime: new Date("2025-05-25T23:59:59Z"),
      isActive: true
    }
  ]
};