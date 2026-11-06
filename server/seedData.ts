import { storage } from "./storage";
import { nanoid } from "nanoid";
import { seedEventData } from "./eventSeeds";

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Check if data already exists
    const existingCategories = await storage.getCategories();
    let categories;
    
    if (existingCategories.length > 0) {
      console.log("Categories exist, checking if products need reseeding...");
      
      // Check if accounting plugin products exist
      const products = await storage.getProducts({});
      const hasAccountingPlugins = products.products.some(p => 
        p.sku && ['DP-QB-SUB', 'DP-XR-SUB', 'DP-NS-SUB', 'DP-SI-SUB', 'DP-FB-SUB'].includes(p.sku)
      );
      
      if (hasAccountingPlugins) {
        console.log("Database already has data, skipping seed");
        return;
      } else {
        console.log("Reseeding products with accounting plugins...");
        // Use existing categories
        categories = existingCategories;
      }
    } else {
      // Create new categories
      categories = [
        {
          id: nanoid(),
          name: "Electronics",
          description: "Latest gadgets and electronic devices",
          imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop"
        },
        {
          id: nanoid(),
          name: "Fashion",
          description: "Trendy clothing and accessories",
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop"
        },
        {
          id: nanoid(),
          name: "Home & Garden",
          description: "Everything for your home and garden",
          imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop"
        },
        {
          id: nanoid(),
          name: "Books",
          description: "Books for every reader",
          imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop"
        },
        {
          id: nanoid(),
          name: "Sports & Outdoors", 
          description: "Gear for active lifestyles",
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop"
        },
        {
          id: nanoid(),
          name: "Professional Services",
          description: "Business tools and software subscriptions",
          imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop"
        }
      ];

      // Create categories in database
      for (const category of categories) {
        await storage.createCategory(category);
      }
    }

    // Create sample products
    const products = [
      // Electronics
      {
        id: nanoid(),
        name: "Wireless Bluetooth Headphones",
        description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
        price: "149.99",
        originalPrice: "199.99",
        categoryId: categories[0].id,
        sellerId: "seller1",
        brand: "AudioTech",
        sku: "AT-WH-001",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.5",
        totalReviews: 128
      },
      {
        id: nanoid(),
        name: "Smart Watch Series 5",
        description: "Advanced fitness tracking with heart rate monitor and GPS",
        price: "299.99",
        categoryId: categories[0].id,
        sellerId: "seller1",
        brand: "TechFit",
        sku: "TF-SW-005",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.3",
        totalReviews: 89
      },
      {
        id: nanoid(),
        name: "4K Wireless Security Camera",
        description: "Indoor/outdoor security camera with night vision and cloud storage",
        price: "149.99",
        categoryId: categories[0].id,
        sellerId: "seller2",
        brand: "SecureCam",
        sku: "SC-4K-001",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.2",
        totalReviews: 45
      },
      // Fashion
      {
        id: nanoid(),
        name: "Premium Cotton T-Shirt",
        description: "Soft, comfortable cotton t-shirt in various colors",
        price: "29.99",
        categoryId: categories[1].id,
        sellerId: "seller3",
        brand: "ComfortWear",
        sku: "CW-TS-001",
        stock: 100,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.6",
        totalReviews: 234
      },
      {
        id: nanoid(),
        name: "Designer Leather Handbag",
        description: "Elegant leather handbag perfect for any occasion",
        price: "159.99",
        originalPrice: "179.99",
        categoryId: categories[1].id,
        sellerId: "seller3",
        brand: "LuxBags",
        sku: "LB-HB-001",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.7",
        totalReviews: 67
      },
      // Home & Garden
      {
        id: nanoid(),
        name: "Ceramic Plant Pot Set",
        description: "Set of 3 modern ceramic plant pots with drainage holes",
        price: "39.99",
        categoryId: categories[2].id,
        sellerId: "seller4",
        brand: "GreenThumb",
        sku: "GT-PP-003",
        stock: 40,
        images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.4",
        totalReviews: 156
      },
      {
        id: nanoid(),
        name: "LED Desk Lamp",
        description: "Adjustable LED desk lamp with USB charging port",
        price: "69.99",
        categoryId: categories[2].id,
        sellerId: "seller4",
        brand: "BrightLight",
        sku: "BL-DL-001",
        stock: 35,
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.5",
        totalReviews: 92
      },
      // Books
      {
        id: nanoid(),
        name: "The Complete Guide to Web Development",
        description: "Comprehensive guide covering HTML, CSS, JavaScript and modern frameworks",
        price: "49.99",
        categoryId: categories[3].id,
        sellerId: "seller5",
        brand: "TechBooks",
        sku: "TB-WD-001",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.8",
        totalReviews: 312
      },
      // Sports & Outdoors
      {
        id: nanoid(),
        name: "Professional Yoga Mat",
        description: "Non-slip yoga mat with alignment guides and carrying strap",
        price: "34.99",
        categoryId: categories[4].id,
        sellerId: "seller6",
        brand: "ZenFit",
        sku: "ZF-YM-001",
        stock: 60,
        images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop"],
        specifications: {},
        isActive: true,
        averageRating: "4.3",
        totalReviews: 187
      },
      // Professional Services - Accounting Plugin Subscriptions
      {
        id: nanoid(),
        name: "QuickBooks Integration Plugin",
        description: "Connect your Durcheap sales data with QuickBooks Online. Automatically sync transactions, customers, and invoices. Monthly subscription includes full support and automatic updates.",
        price: "9.99",
        categoryId: categories.find(c => c.name === "Professional Services")?.id || categories[categories.length - 1]?.id,
        sellerId: "durcheap-official",
        brand: "Durcheap",
        sku: "DP-QB-SUB",
        stock: 999999,
        images: ["https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&h=500&fit=crop"],
        specifications: {
          type: "software_subscription",
          billing: "monthly",
          features: ["Transaction sync", "Customer sync", "Invoice export", "Real-time updates", "Technical support"],
          compatibility: "QuickBooks Online"
        },
        isActive: true,
        averageRating: "4.9",
        totalReviews: 234
      },
      {
        id: nanoid(),
        name: "Xero Integration Plugin",
        description: "Seamlessly integrate your Durcheap store with Xero accounting software. Export sales data, manage customers, and track financial performance effortlessly.",
        price: "9.99",
        categoryId: categories.find(c => c.name === "Professional Services")?.id || categories[categories.length - 1]?.id,
        sellerId: "durcheap-official",
        brand: "Durcheap",
        sku: "DP-XR-SUB",
        stock: 999999,
        images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop"],
        specifications: {
          type: "software_subscription",
          billing: "monthly",
          features: ["Automated data export", "Multi-currency support", "Bank reconciliation", "Financial reporting", "24/7 support"],
          compatibility: "Xero Cloud"
        },
        isActive: true,
        averageRating: "4.8",
        totalReviews: 156
      },
      {
        id: nanoid(),
        name: "NetSuite Integration Plugin",
        description: "Enterprise-grade integration with Oracle NetSuite ERP. Perfect for large sellers managing complex operations and financial workflows.",
        price: "9.99",
        categoryId: categories.find(c => c.name === "Professional Services")?.id || categories[categories.length - 1]?.id,
        sellerId: "durcheap-official",
        brand: "Durcheap",
        sku: "DP-NS-SUB",
        stock: 999999,
        images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=500&fit=crop"],
        specifications: {
          type: "software_subscription",
          billing: "monthly",
          features: ["ERP integration", "Advanced reporting", "Workflow automation", "Multi-subsidiary support", "Enterprise support"],
          compatibility: "NetSuite ERP"
        },
        isActive: true,
        averageRating: "4.7",
        totalReviews: 89
      },
      {
        id: nanoid(),
        name: "Sage Intacct Integration Plugin",
        description: "Professional accounting integration with Sage Intacct. Streamline your financial processes with advanced GL integration and reporting capabilities.",
        price: "9.99",
        categoryId: categories.find(c => c.name === "Professional Services")?.id || categories[categories.length - 1]?.id,
        sellerId: "durcheap-official",
        brand: "Durcheap",
        sku: "DP-SI-SUB",
        stock: 999999,
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"],
        specifications: {
          type: "software_subscription",
          billing: "monthly",
          features: ["GL integration", "Dimensional reporting", "Multi-entity support", "Custom workflows", "Professional support"],
          compatibility: "Sage Intacct"
        },
        isActive: true,
        averageRating: "4.6",
        totalReviews: 67
      },
      {
        id: nanoid(),
        name: "FreshBooks Integration Plugin",
        description: "Simple and intuitive integration with FreshBooks. Perfect for small to medium sellers who want easy invoicing and expense tracking.",
        price: "9.99",
        categoryId: categories.find(c => c.name === "Professional Services")?.id || categories[categories.length - 1]?.id,
        sellerId: "durcheap-official",
        brand: "Durcheap",
        sku: "DP-FB-SUB",
        stock: 999999,
        images: ["https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&h=500&fit=crop"],
        specifications: {
          type: "software_subscription",
          billing: "monthly",
          features: ["Easy invoicing", "Expense tracking", "Time tracking", "Payment integration", "Mobile support"],
          compatibility: "FreshBooks Cloud"
        },
        isActive: true,
        averageRating: "4.5",
        totalReviews: 123
      }
    ];

    // Create products in database, skip if SKU already exists
    for (const product of products) {
      try {
        await storage.createProduct(product);
      } catch (error: any) {
        if (error.code === '23505' && error.constraint === 'products_sku_unique') {
          console.log(`Product with SKU ${product.sku} already exists, skipping...`);
          continue;
        }
        throw error;
      }
    }

    // Seed event data
    await seedEventData();

    console.log("Database seeded successfully!");
    console.log(`Created ${categories.length} categories and ${products.length} products`);

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}