import { db } from "./db";
import { localEvents, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function seedLocalEventsForPompanoBeach() {
  console.log("Seeding local events for Pompano Beach, FL (33334)...");

  try {
    // Check if Pompano Beach events already exist
    const existingEvents = await db.select().from(localEvents).where(
      and(
        eq(localEvents.city, "Pompano Beach"),
        eq(localEvents.state, "FL")
      )
    ).limit(1);

    if (existingEvents.length > 0) {
      console.log("Pompano Beach events already exist, skipping seed");
      return;
    }

    // Create system event organizer user if it doesn't exist
    let systemUser;
    try {
      const existingSystemUser = await db.select().from(users).where(eq(users.id, "system-event-organizer")).limit(1);
      if (existingSystemUser.length === 0) {
        await db.insert(users).values({
          id: "system-event-organizer",
          email: "events@pompanobeachfl.gov",
          firstName: "City",
          lastName: "of Pompano Beach",
          role: "admin",
        });
      }
      systemUser = "system-event-organizer";
    } catch (error) {
      console.error("Error creating system user:", error);
      throw error;
    }

    // Create realistic local events for Pompano Beach, FL
    const pompanoBeachEvents = [
      {
        id: "pompano-farmers-market-2025",
        title: "Pompano Beach Green Market",
        description: "Weekly farmers market featuring fresh local produce, artisanal foods, live music, and family activities. Support local farmers and vendors while enjoying the beautiful South Florida weather.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-01T08:00:00Z"),
        endDate: new Date("2025-02-01T14:00:00Z"),
        location: "Pompano Beach City Hall Parking Lot",
        address: "100 W Atlantic Blvd, Pompano Beach, FL 33060",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "citywide",
        category: "Community",
        price: "0.00",
        capacity: 500,
        tags: ["farmers market", "local produce", "family friendly", "outdoor", "weekly"],
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
        isPublished: true,
        isFeatured: true,
      },
      {
        id: "pompano-beach-art-festival-2025",
        title: "Pompano Beach Arts Festival",
        description: "Annual arts festival showcasing local and regional artists, live performances, food vendors, and interactive art workshops. Celebrating creativity in the heart of Pompano Beach.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-15T10:00:00Z"),
        endDate: new Date("2025-02-16T18:00:00Z"),
        location: "Pompano Beach Cultural Center",
        address: "50 W Atlantic Blvd, Pompano Beach, FL 33060",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "metro",
        category: "Arts & Culture",
        price: "15.00",
        capacity: 2000,
        tags: ["arts", "festival", "local artists", "family friendly", "weekend"],
        imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b",
        isPublished: true,
        isFeatured: true,
      },
      {
        id: "lighthouse-cove-sunset-yoga-2025",
        title: "Sunset Yoga at Lighthouse Cove",
        description: "Relaxing beach yoga session at beautiful Lighthouse Cove. All skill levels welcome. Bring your own mat and water. Experience tranquility as the sun sets over the Atlantic Ocean.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-03T17:30:00Z"),
        endDate: new Date("2025-02-03T18:30:00Z"),
        location: "Lighthouse Cove Beach",
        address: "2200 NE 33rd St, Pompano Beach, FL 33062",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "citywide",
        category: "Fitness & Wellness",
        price: "20.00",
        capacity: 50,
        tags: ["yoga", "beach", "sunset", "wellness", "outdoor"],
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        isPublished: true,
        isFeatured: false,
      },
      {
        id: "pompano-business-networking-2025",
        title: "Pompano Beach Business Network Mixer",
        description: "Monthly networking event for local business owners, entrepreneurs, and professionals. Includes light refreshments, guest speaker presentations, and valuable business connections.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-06T18:00:00Z"),
        endDate: new Date("2025-02-06T20:00:00Z"),
        location: "Pompano Beach Chamber of Commerce",
        address: "2200 E Atlantic Blvd, Pompano Beach, FL 33062",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "citywide",
        category: "Business & Professional",
        price: "25.00",
        capacity: 100,
        tags: ["networking", "business", "professional", "monthly", "chamber"],
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
        isPublished: true,
        isFeatured: false,
      },
      {
        id: "hillsboro-lighthouse-tour-2025",
        title: "Historic Hillsboro Lighthouse Tours",
        description: "Guided tours of the historic Hillsboro Lighthouse, built in 1907. Learn about maritime history, lighthouse operations, and enjoy panoramic views of the coastline.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-08T10:00:00Z"),
        endDate: new Date("2025-02-08T16:00:00Z"),
        location: "Hillsboro Lighthouse",
        address: "2890 N Ocean Blvd, Lighthouse Point, FL 33064",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "metro",
        category: "Tours & Sightseeing",
        price: "12.00",
        capacity: 200,
        tags: ["lighthouse", "history", "tours", "maritime", "weekend"],
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
        isPublished: true,
        isFeatured: false,
      },
      {
        id: "sample-road-food-festival-2025",
        title: "Sample Road Food Truck Festival",
        description: "Popular food truck festival featuring diverse cuisines, live music, family activities, and local vendors. Over 30 food trucks serving everything from BBQ to gourmet desserts.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-09T11:00:00Z"),
        endDate: new Date("2025-02-09T21:00:00Z"),
        location: "Sample McDougald House",
        address: "450 NE 10th St, Pompano Beach, FL 33060",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "metro",
        category: "Food & Drink",
        price: "5.00",
        capacity: 1500,
        tags: ["food trucks", "festival", "family friendly", "live music", "weekend"],
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
        isPublished: true,
        isFeatured: true,
      },
      {
        id: "pompano-fishing-tournament-2025",
        title: "Pompano Beach Fishing Tournament",
        description: "Annual fishing tournament open to all ages and skill levels. Multiple categories including offshore, inshore, and pier fishing. Prizes for biggest catch, most fish, and youth categories.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-22T06:00:00Z"),
        endDate: new Date("2025-02-22T18:00:00Z"),
        location: "Pompano Beach Fishing Pier",
        address: "222 N Pompano Beach Blvd, Pompano Beach, FL 33062",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "metro",
        category: "Sports & Recreation",
        price: "35.00",
        capacity: 300,
        tags: ["fishing", "tournament", "competition", "pier", "ocean"],
        imageUrl: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c",
        isPublished: true,
        isFeatured: false,
      },
      {
        id: "library-book-club-2025",
        title: "Pompano Beach Library Book Club",
        description: "Monthly book discussion group featuring contemporary fiction and non-fiction selections. Coffee and light refreshments provided. New members always welcome.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-12T19:00:00Z"),
        endDate: new Date("2025-02-12T20:30:00Z"),
        location: "Pompano Beach Library",
        address: "1213 E Atlantic Blvd, Pompano Beach, FL 33060",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "citywide",
        category: "Education & Learning",
        price: "0.00",
        capacity: 25,
        tags: ["book club", "reading", "discussion", "monthly", "education"],
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        isPublished: true,
        isFeatured: false,
      },
      {
        id: "beach-cleanup-volunteer-2025",
        title: "Pompano Beach Cleanup Day",
        description: "Community volunteer event to help keep our beautiful beaches clean. Supplies provided including gloves, trash bags, and water. Great for families, schools, and community groups.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-14T08:00:00Z"),
        endDate: new Date("2025-02-14T11:00:00Z"),
        location: "Pompano Beach Pier Area",
        address: "222 N Pompano Beach Blvd, Pompano Beach, FL 33062",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "citywide",
        category: "Community",
        price: "0.00",
        capacity: 150,
        tags: ["volunteer", "beach cleanup", "environment", "community", "family friendly"],
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
        isPublished: true,
        isFeatured: false,
      },
      {
        id: "seniors-water-aerobics-2025",
        title: "Senior Water Aerobics Classes",
        description: "Low-impact water aerobics classes designed for seniors. Improve flexibility, strength, and cardiovascular health in a fun, social environment. All fitness levels welcome.",
        organizerId: systemUser,
        eventDate: new Date("2025-02-04T10:00:00Z"),
        endDate: new Date("2025-02-04T11:00:00Z"),
        location: "Emma Lou Olson Civic Center Pool",
        address: "1801 NE 6th St, Pompano Beach, FL 33060",
        city: "Pompano Beach",
        state: "FL",
        zipCode: "33334",
        reachType: "citywide",
        category: "Fitness & Wellness",
        price: "8.00",
        capacity: 30,
        tags: ["water aerobics", "seniors", "fitness", "pool", "health"],
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
        isPublished: true,
        isFeatured: false,
      }
    ];

    // Insert all events
    for (const event of pompanoBeachEvents) {
      await db.insert(localEvents).values(event);
    }

    console.log(`Seeded ${pompanoBeachEvents.length} local events for Pompano Beach, FL`);
  } catch (error) {
    console.error("Error seeding Pompano Beach events:", error);
    throw error;
  }
}