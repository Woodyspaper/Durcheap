import { db } from "./db";
import { taxRates, sellerTaxSettings, taxTransactions, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// US State tax rates (2024 data)
const usTaxRates = [
  { state: "AL", stateTaxRate: 0.04, localTaxRate: 0.0513, totalTaxRate: 0.0913 },
  { state: "AK", stateTaxRate: 0.0, localTaxRate: 0.0182, totalTaxRate: 0.0182 },
  { state: "AZ", stateTaxRate: 0.0556, localTaxRate: 0.0279, totalTaxRate: 0.0835 },
  { state: "AR", stateTaxRate: 0.065, localTaxRate: 0.0295, totalTaxRate: 0.0945 },
  { state: "CA", stateTaxRate: 0.075, localTaxRate: 0.0175, totalTaxRate: 0.0925 },
  { state: "CO", stateTaxRate: 0.029, localTaxRate: 0.049, totalTaxRate: 0.078 },
  { state: "CT", stateTaxRate: 0.0635, localTaxRate: 0.0, totalTaxRate: 0.0635 },
  { state: "DE", stateTaxRate: 0.0, localTaxRate: 0.0, totalTaxRate: 0.0 },
  { state: "FL", stateTaxRate: 0.06, localTaxRate: 0.0108, totalTaxRate: 0.0708 },
  { state: "GA", stateTaxRate: 0.04, localTaxRate: 0.0338, totalTaxRate: 0.0738 },
  { state: "HI", stateTaxRate: 0.04, localTaxRate: 0.0041, totalTaxRate: 0.0441 },
  { state: "ID", stateTaxRate: 0.06, localTaxRate: 0.0003, totalTaxRate: 0.0603 },
  { state: "IL", stateTaxRate: 0.0625, localTaxRate: 0.0276, totalTaxRate: 0.0901 },
  { state: "IN", stateTaxRate: 0.07, localTaxRate: 0.0, totalTaxRate: 0.07 },
  { state: "IA", stateTaxRate: 0.06, localTaxRate: 0.0082, totalTaxRate: 0.0682 },
  { state: "KS", stateTaxRate: 0.065, localTaxRate: 0.0223, totalTaxRate: 0.0873 },
  { state: "KY", stateTaxRate: 0.06, localTaxRate: 0.0, totalTaxRate: 0.06 },
  { state: "LA", stateTaxRate: 0.0445, localTaxRate: 0.0509, totalTaxRate: 0.0954 },
  { state: "ME", stateTaxRate: 0.055, localTaxRate: 0.0, totalTaxRate: 0.055 },
  { state: "MD", stateTaxRate: 0.06, localTaxRate: 0.0, totalTaxRate: 0.06 },
  { state: "MA", stateTaxRate: 0.0625, localTaxRate: 0.0, totalTaxRate: 0.0625 },
  { state: "MI", stateTaxRate: 0.06, localTaxRate: 0.0, totalTaxRate: 0.06 },
  { state: "MN", stateTaxRate: 0.0688, localTaxRate: 0.0062, totalTaxRate: 0.075 },
  { state: "MS", stateTaxRate: 0.07, localTaxRate: 0.0007, totalTaxRate: 0.0707 },
  { state: "MO", stateTaxRate: 0.04225, localTaxRate: 0.0415, totalTaxRate: 0.08375 },
  { state: "MT", stateTaxRate: 0.0, localTaxRate: 0.0, totalTaxRate: 0.0 },
  { state: "NE", stateTaxRate: 0.055, localTaxRate: 0.0157, totalTaxRate: 0.0707 },
  { state: "NV", stateTaxRate: 0.0685, localTaxRate: 0.0138, totalTaxRate: 0.0823 },
  { state: "NH", stateTaxRate: 0.0, localTaxRate: 0.0, totalTaxRate: 0.0 },
  { state: "NJ", stateTaxRate: 0.0663, localTaxRate: 0.0, totalTaxRate: 0.0663 },
  { state: "NM", stateTaxRate: 0.0513, localTaxRate: 0.0292, totalTaxRate: 0.0805 },
  { state: "NY", stateTaxRate: 0.08, localTaxRate: 0.0453, totalTaxRate: 0.1253 },
  { state: "NC", stateTaxRate: 0.0475, localTaxRate: 0.0223, totalTaxRate: 0.0698 },
  { state: "ND", stateTaxRate: 0.05, localTaxRate: 0.0195, totalTaxRate: 0.0695 },
  { state: "OH", stateTaxRate: 0.0575, localTaxRate: 0.0148, totalTaxRate: 0.0723 },
  { state: "OK", stateTaxRate: 0.045, localTaxRate: 0.0447, totalTaxRate: 0.0897 },
  { state: "OR", stateTaxRate: 0.0, localTaxRate: 0.0, totalTaxRate: 0.0 },
  { state: "PA", stateTaxRate: 0.06, localTaxRate: 0.0034, totalTaxRate: 0.0634 },
  { state: "RI", stateTaxRate: 0.07, localTaxRate: 0.0, totalTaxRate: 0.07 },
  { state: "SC", stateTaxRate: 0.06, localTaxRate: 0.0157, totalTaxRate: 0.0757 },
  { state: "SD", stateTaxRate: 0.045, localTaxRate: 0.0196, totalTaxRate: 0.0646 },
  { state: "TN", stateTaxRate: 0.07, localTaxRate: 0.0275, totalTaxRate: 0.0975 },
  { state: "TX", stateTaxRate: 0.0625, localTaxRate: 0.0195, totalTaxRate: 0.082 },
  { state: "UT", stateTaxRate: 0.0485, localTaxRate: 0.0219, totalTaxRate: 0.0704 },
  { state: "VT", stateTaxRate: 0.06, localTaxRate: 0.0018, totalTaxRate: 0.0618 },
  { state: "VA", stateTaxRate: 0.043, localTaxRate: 0.0128, totalTaxRate: 0.0558 },
  { state: "WA", stateTaxRate: 0.065, localTaxRate: 0.0288, totalTaxRate: 0.0938 },
  { state: "WV", stateTaxRate: 0.06, localTaxRate: 0.0065, totalTaxRate: 0.0665 },
  { state: "WI", stateTaxRate: 0.05, localTaxRate: 0.0044, totalTaxRate: 0.0544 },
  { state: "WY", stateTaxRate: 0.04, localTaxRate: 0.0157, totalTaxRate: 0.0557 },
];

export async function seedTaxRates() {
  try {
    console.log("Seeding tax rates...");
    
    // Check if tax rates already exist
    const existingRates = await db.select().from(taxRates).limit(1);
    if (existingRates.length > 0) {
      console.log("Tax rates already exist, skipping seed");
      return;
    }

    // Insert US state tax rates
    const taxRateData = usTaxRates.map(rate => ({
      id: nanoid(),
      country: "US",
      state: rate.state,
      county: null,
      city: null,
      zipCode: null,
      stateTaxRate: rate.stateTaxRate.toFixed(4),
      localTaxRate: rate.localTaxRate.toFixed(4),
      totalTaxRate: rate.totalTaxRate.toFixed(4),
      isActive: true,
      effectiveDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(taxRates).values(taxRateData);

    console.log(`Seeded ${taxRateData.length} tax rates for US states`);

    // Add some specific city/county rates for major markets
    const specificRates = [
      // California cities
      { state: "CA", city: "Los Angeles", county: "Los Angeles", totalTaxRate: 0.1025 },
      { state: "CA", city: "San Francisco", county: "San Francisco", totalTaxRate: 0.0875 },
      { state: "CA", city: "San Diego", county: "San Diego", totalTaxRate: 0.0775 },
      
      // New York cities
      { state: "NY", city: "New York", county: "New York", totalTaxRate: 0.08 },
      { state: "NY", city: "Buffalo", county: "Erie", totalTaxRate: 0.08 },
      
      // Texas cities
      { state: "TX", city: "Houston", county: "Harris", totalTaxRate: 0.0825 },
      { state: "TX", city: "Dallas", county: "Dallas", totalTaxRate: 0.0825 },
      { state: "TX", city: "Austin", county: "Travis", totalTaxRate: 0.0825 },
      
      // Florida cities
      { state: "FL", city: "Miami", county: "Miami-Dade", totalTaxRate: 0.07 },
      { state: "FL", city: "Orlando", county: "Orange", totalTaxRate: 0.065 },
      
      // Illinois
      { state: "IL", city: "Chicago", county: "Cook", totalTaxRate: 0.1025 },
    ];

    const specificRateData = specificRates.map(rate => ({
      id: nanoid(),
      country: "US",
      state: rate.state,
      county: rate.county,
      city: rate.city,
      zipCode: null,
      stateTaxRate: usTaxRates.find(r => r.state === rate.state)?.stateTaxRate.toFixed(4) || "0.0000",
      localTaxRate: (rate.totalTaxRate - (usTaxRates.find(r => r.state === rate.state)?.stateTaxRate || 0)).toFixed(4),
      totalTaxRate: rate.totalTaxRate.toFixed(4),
      isActive: true,
      effectiveDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(taxRates).values(specificRateData);
    console.log(`Seeded ${specificRateData.length} specific city/county tax rates`);

  } catch (error) {
    console.error("Error seeding tax rates:", error);
  }
}

// Seed sample tax transactions for testing
export async function seedSampleTaxTransactions() {
  try {
    console.log("Seeding sample tax transactions...");
    
    // Check if tax transactions already exist
    const existingTransactions = await db.select().from(taxTransactions).limit(1);
    if (existingTransactions.length > 0) {
      console.log("Tax transactions already exist, skipping seed");
      return;
    }

    // Get a seller from the users table
    const sellers = await db.select().from(users).where(eq(users.role, "seller")).limit(1);
    if (sellers.length === 0) {
      console.log("No sellers found, skipping tax transaction seed");
      return;
    }

    const sellerId = sellers[0].id;
    const buyerId = "buyer_sample_123"; // Mock buyer ID

    // Create sample transactions for 2024
    const sampleTransactions = [
      // Q1 2024 transactions
      { orderId: "ORD-2024-001", saleAmount: 125.00, buyerState: "CA", buyerCity: "Los Angeles", month: 1, quarter: 1 },
      { orderId: "ORD-2024-002", saleAmount: 89.99, buyerState: "CA", buyerCity: "San Francisco", month: 1, quarter: 1 },
      { orderId: "ORD-2024-003", saleAmount: 250.00, buyerState: "NY", buyerCity: "New York", month: 2, quarter: 1 },
      { orderId: "ORD-2024-004", saleAmount: 75.50, buyerState: "CA", buyerCity: "Los Angeles", month: 2, quarter: 1 },
      { orderId: "ORD-2024-005", saleAmount: 199.99, buyerState: "TX", buyerCity: "Houston", month: 3, quarter: 1 },
      
      // Q2 2024 transactions
      { orderId: "ORD-2024-006", saleAmount: 340.00, buyerState: "CA", buyerCity: "Los Angeles", month: 4, quarter: 2 },
      { orderId: "ORD-2024-007", saleAmount: 145.75, buyerState: "FL", buyerCity: "Miami", month: 4, quarter: 2 },
      { orderId: "ORD-2024-008", saleAmount: 67.99, buyerState: "CA", buyerCity: "San Diego", month: 5, quarter: 2 },
      { orderId: "ORD-2024-009", saleAmount: 289.50, buyerState: "NY", buyerCity: "New York", month: 5, quarter: 2 },
      { orderId: "ORD-2024-010", saleAmount: 95.00, buyerState: "CA", buyerCity: "Los Angeles", month: 6, quarter: 2 },
      
      // Q3 2024 transactions
      { orderId: "ORD-2024-011", saleAmount: 178.25, buyerState: "CA", buyerCity: "Los Angeles", month: 7, quarter: 3 },
      { orderId: "ORD-2024-012", saleAmount: 99.99, buyerState: "IL", buyerCity: "Chicago", month: 8, quarter: 3 },
      { orderId: "ORD-2024-013", saleAmount: 445.00, buyerState: "CA", buyerCity: "San Francisco", month: 9, quarter: 3 },
      
      // Q4 2024 transactions
      { orderId: "ORD-2024-014", saleAmount: 225.75, buyerState: "CA", buyerCity: "Los Angeles", month: 10, quarter: 4 },
      { orderId: "ORD-2024-015", saleAmount: 155.99, buyerState: "TX", buyerCity: "Dallas", month: 11, quarter: 4 },
      { orderId: "ORD-2024-016", saleAmount: 389.99, buyerState: "CA", buyerCity: "Los Angeles", month: 12, quarter: 4 },
    ];

    const transactionData = sampleTransactions.map(t => {
      // Calculate tax based on state and city
      let taxRate = 0;
      if (t.buyerState === "CA") {
        if (t.buyerCity === "Los Angeles") taxRate = 0.1025;
        else if (t.buyerCity === "San Francisco") taxRate = 0.0875;
        else if (t.buyerCity === "San Diego") taxRate = 0.0775;
        else taxRate = 0.075; // Default CA rate
      } else if (t.buyerState === "NY") {
        taxRate = t.buyerCity === "New York" ? 0.08 : 0.08;
      } else if (t.buyerState === "TX") {
        taxRate = 0.0825;
      } else if (t.buyerState === "FL") {
        taxRate = 0.07;
      } else if (t.buyerState === "IL") {
        taxRate = t.buyerCity === "Chicago" ? 0.1025 : 0.0625;
      }

      const taxAmount = t.saleAmount * taxRate;
      const transactionDate = new Date(2024, t.month - 1, Math.floor(Math.random() * 28) + 1);

      return {
        id: nanoid(),
        orderId: t.orderId,
        sellerId,
        buyerId,
        saleAmount: t.saleAmount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        taxRate: taxRate.toFixed(4),
        buyerState: t.buyerState,
        buyerCity: t.buyerCity,
        buyerZipCode: null,
        sellerState: "CA", // Assuming seller is in CA
        transactionDate,
        taxYear: 2024,
        taxQuarter: t.quarter,
        createdAt: new Date(),
      };
    });

    await db.insert(taxTransactions).values(transactionData);
    console.log(`Seeded ${transactionData.length} sample tax transactions for testing`);

  } catch (error) {
    console.error("Error seeding sample tax transactions:", error);
  }
}