import { db } from "./db";
import { eventSubscriptionPlans, eventPostingRates } from "@shared/schema";

export async function seedEventData() {
  console.log("Seeding event subscription plans and posting rates...");

  try {
    // Check if data already exists
    const existingPlans = await db.select().from(eventSubscriptionPlans).limit(1);
    if (existingPlans.length > 0) {
      console.log("Event data already exists, skipping seed");
      return;
    }

    // Seed subscription plans
    await db.insert(eventSubscriptionPlans).values([
      {
        id: "monthly_once",
        name: "Monthly Post",
        description: "One event post per month",
        postsPerMonth: 1,
        basePrice: "29.99"
      },
      {
        id: "monthly_twice",
        name: "Bi-Monthly Posts",
        description: "Two event posts per month",
        postsPerMonth: 2,
        basePrice: "49.99"
      },
      {
        id: "weekly",
        name: "Weekly Posts",
        description: "Four event posts per month",
        postsPerMonth: 4,
        basePrice: "89.99"
      },
      {
        id: "daily",
        name: "Daily Posts",
        description: "Unlimited event posts",
        postsPerMonth: 30,
        basePrice: "199.99"
      }
    ]);

    // Seed posting rates by reach
    await db.insert(eventPostingRates).values([
      {
        id: "citywide",
        reachType: "citywide",
        singlePostPrice: "19.99"
      },
      {
        id: "metro",
        reachType: "metro",
        singlePostPrice: "39.99"
      },
      {
        id: "statewide",
        reachType: "statewide",
        singlePostPrice: "79.99"
      },
      {
        id: "national",
        reachType: "national",
        singlePostPrice: "149.99"
      },
      {
        id: "global",
        reachType: "global",
        singlePostPrice: "299.99"
      }
    ]);

    // Seed some sample events including today's events
    await seedSampleEvents();
    await seedTodaysEvents();

    console.log("Event data seeded successfully");
  } catch (error) {
    console.error("Error seeding event data:", error);
  }
}

async function seedSampleEvents() {
  const { localEvents } = await import("@shared/schema");
  const { db } = await import("./db");
  const { nanoid } = await import("nanoid");
  
  const sampleEvents = [
    {
      id: nanoid(),
      title: "Downtown Farmers Market",
      description: "Fresh local produce, artisanal goods, and community gathering every Saturday morning.",
      organizerId: "demo_organizer_1",
      eventDate: new Date(), // Today
      endDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours later
      location: "Downtown Square",
      address: "123 Main Street",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
      country: "US",
      reachType: "citywide",
      category: "community",
      price: "0.00",
      currency: "USD",
      capacity: 500,
      registeredCount: 142,
      imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&h=300&fit=crop",
      websiteUrl: "https://springfieldmarket.com",
      socialLinks: {
        facebook: "https://facebook.com/springfieldmarket",
        instagram: "https://instagram.com/springfieldmarket"
      },
      tags: ["market", "local", "organic", "community"],
      isPublished: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      title: "Tech Startup Networking Event",
      description: "Connect with entrepreneurs, investors, and tech professionals in the metro area.",
      organizerId: "demo_organizer_2",
      eventDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // Today, 2 hours from now
      location: "Innovation Hub",
      address: "456 Technology Drive",
      city: "Springfield",
      state: "IL",
      zipCode: "62702",
      country: "US",
      reachType: "metro",
      category: "business",
      price: "25.00",
      currency: "USD",
      capacity: 100,
      registeredCount: 67,
      imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=300&fit=crop",
      ticketUrl: "https://eventbrite.com/tech-networking-2025",
      socialLinks: {
        linkedin: "https://linkedin.com/company/innovation-hub",
        twitter: "https://twitter.com/innovationhub"
      },
      tags: ["tech", "networking", "startup", "business"],
      isPublished: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      title: "Spring Music Festival",
      description: "Three days of live music featuring local and regional bands across multiple genres.",
      organizerId: "demo_organizer_3",
      eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // One month
      endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // Three days
      location: "Riverside Park",
      address: "789 River Road",
      city: "Springfield",
      state: "IL",
      zipCode: "62703",
      country: "US",
      reachType: "statewide",
      category: "entertainment",
      price: "45.00",
      currency: "USD",
      capacity: 2000,
      registeredCount: 834,
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
      ticketUrl: "https://tickets.springmusicfest.com",
      websiteUrl: "https://springmusicfest.com",
      socialLinks: {
        facebook: "https://facebook.com/springmusicfest",
        instagram: "https://instagram.com/springmusicfest",
        youtube: "https://youtube.com/springmusicfest"
      },
      mediaLinks: {
        livestream: "https://youtube.com/live/springmusicfest",
        photos: "https://photos.springmusicfest.com"
      },
      tags: ["music", "festival", "live", "outdoor"],
      isPublished: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      title: "Professional Development Workshop",
      description: "Career advancement strategies and skill building for working professionals.",
      organizerId: "demo_organizer_4",
      eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Three weeks
      location: "Business Center",
      address: "321 Corporate Blvd",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "US",
      reachType: "national",
      category: "education",
      price: "75.00",
      currency: "USD",
      capacity: 50,
      registeredCount: 23,
      imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=300&fit=crop",
      ticketUrl: "https://professional-dev-workshop.com/register",
      socialLinks: {
        linkedin: "https://linkedin.com/events/professional-development"
      },
      tags: ["professional", "workshop", "career", "skills"],
      isPublished: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    // Check if events already exist
    const existingEvents = await db.select().from(localEvents).limit(1);
    if (existingEvents.length === 0) {
      await db.insert(localEvents).values(sampleEvents);
      console.log(`Inserted ${sampleEvents.length} sample events`);
    }
  } catch (error) {
    console.error("Error inserting sample events:", error);
  }
}

async function seedTodaysEvents() {
  const { localEvents } = await import("@shared/schema");
  const { db } = await import("./db");
  const { nanoid } = await import("nanoid");
  const { and, gte, lt } = await import("drizzle-orm");
  
  // Check if today's events already exist
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const existingTodayEvents = await db.select().from(localEvents)
    .where(
      and(
        gte(localEvents.eventDate, today),
        lt(localEvents.eventDate, tomorrow)
      )
    )
    .limit(1);
    
  if (existingTodayEvents.length > 0) {
    console.log("Today's events already exist, skipping seed");
    return;
  }
  
  const todaysEvents = [
    {
      id: nanoid(),
      title: "Morning Coffee & Networking",
      description: "Start your day with great coffee and meaningful connections with local professionals.",
      organizerId: "demo_organizer_3",
      eventDate: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      endDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      location: "The Coffee House",
      address: "789 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      reachType: "citywide",
      category: "networking",
      price: "0.00",
      capacity: 50,
      registeredCount: 23,
      imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=300&fit=crop",
      isPublished: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      title: "Local Art Gallery Opening",
      description: "Discover emerging artists from the community at this exclusive gallery opening event.",
      organizerId: "demo_organizer_4",
      eventDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      endDate: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours from now
      location: "Downtown Art Gallery",
      address: "456 Art District",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "US",
      reachType: "metro",
      category: "arts",
      price: "15.00",
      capacity: 100,
      registeredCount: 67,
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
      isPublished: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      title: "Business Lunch Meetup",
      description: "Join local entrepreneurs and business owners for lunch and discussion about market trends.",
      organizerId: "demo_organizer_5",
      eventDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      location: "Business Center Restaurant",
      address: "123 Commerce Drive",
      city: "Doral",
      state: "FL",
      zipCode: "33178",
      country: "US",
      reachType: "citywide",
      category: "business",
      price: "25.00",
      capacity: 40,
      registeredCount: 31,
      imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=500&h=300&fit=crop",
      isPublished: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: nanoid(),
      title: "Evening Yoga in the Park",
      description: "Relax and unwind with a peaceful yoga session in the local park. All levels welcome.",
      organizerId: "demo_organizer_6",
      eventDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      endDate: new Date(Date.now() + 7.5 * 60 * 60 * 1000), // 7.5 hours from now
      location: "Central Park East",
      address: "Central Park",
      city: "New York",
      state: "NY",
      zipCode: "10021",
      country: "US",
      reachType: "citywide",
      category: "wellness",
      price: "0.00",
      capacity: 30,
      registeredCount: 18,
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68e3f?w=500&h=300&fit=crop",
      isPublished: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    await db.insert(localEvents).values(todaysEvents);
    console.log("Today's events seeded successfully");
  } catch (error) {
    console.error("Error seeding today's events:", error);
  }
}