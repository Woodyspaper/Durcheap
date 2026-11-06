import { db } from "./db";
import { shippingRates, shippingLabels, shippingAddresses, localDeliveryZones, type InsertShippingRate, type InsertShippingLabel, type InsertShippingAddress } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// Shipping rate calculation service
export class ShippingService {
  // Calculate shipping rates from external APIs
  async calculateShippingRates(packageData: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    fromZip: string;
    toZip: string;
    serviceType?: string;
  }) {
    // In production, this would integrate with USPS, UPS, FedEx APIs
    const mockRates = [
      {
        carrier: "USPS",
        serviceType: "Ground Advantage",
        price: this.calculateUSPSRate(packageData),
        deliveryDays: "3-5",
        trackingIncluded: true
      },
      {
        carrier: "USPS", 
        serviceType: "Priority Mail",
        price: this.calculateUSPSRate(packageData) * 1.5,
        deliveryDays: "1-3",
        trackingIncluded: true
      },
      {
        carrier: "UPS",
        serviceType: "Ground",
        price: this.calculateUPSRate(packageData),
        deliveryDays: "3-5",
        trackingIncluded: true
      },
      {
        carrier: "FedEx",
        serviceType: "Ground",
        price: this.calculateFedExRate(packageData),
        deliveryDays: "3-5", 
        trackingIncluded: true
      }
    ];

    // Add local delivery if available
    const localRates = await this.getLocalDeliveryRates(packageData.fromZip, packageData.toZip);
    return [...mockRates, ...localRates];
  }

  // Create shipping label
  async createShippingLabel(labelData: {
    orderId: string;
    sellerId: string;
    buyerId: string;
    carrier: string;
    serviceType: string;
    fromAddress: any;
    toAddress: any;
    weight: number;
    dimensions: any;
    shippingCost: number;
  }) {
    const labelId = nanoid();
    const trackingNumber = this.generateTrackingNumber(labelData.carrier);
    
    const label = await db.insert(shippingLabels).values({
      id: labelId,
      orderId: labelData.orderId,
      sellerId: labelData.sellerId,
      buyerId: labelData.buyerId,
      carrier: labelData.carrier,
      serviceType: labelData.serviceType,
      trackingNumber,
      labelUrl: `/api/shipping/labels/${labelId}/download`,
      shippingCost: labelData.shippingCost.toString(),
      weight: labelData.weight.toString(),
      dimensions: JSON.stringify(labelData.dimensions),
      fromAddress: JSON.stringify(labelData.fromAddress),
      toAddress: JSON.stringify(labelData.toAddress),
      status: "created"
    }).returning();

    return label[0];
  }

  // Get shipping addresses for user
  async getShippingAddresses(userId: string) {
    return await db.select().from(shippingAddresses).where(eq(shippingAddresses.userId, userId));
  }

  // Save shipping address
  async saveShippingAddress(addressData: InsertShippingAddress) {
    const addressId = nanoid();
    return await db.insert(shippingAddresses).values({
      ...addressData,
      id: addressId
    }).returning();
  }

  // Get local delivery options
  async getLocalDeliveryRates(fromZip: string, toZip: string) {
    const zones = await db.select().from(localDeliveryZones).where(eq(localDeliveryZones.isActive, true));
    
    const availableZones = zones.filter(zone => 
      zone.zipCodes?.includes(toZip) || zone.zipCodes?.includes(fromZip)
    );

    return availableZones.map(zone => ({
      carrier: "Local Delivery",
      serviceType: zone.sameDayAvailable ? "Same Day" : "Local Standard",
      price: zone.sameDayAvailable ? parseFloat(zone.sameDayFee || "7.99") : parseFloat(zone.deliveryFee || "4.99"),
      deliveryDays: zone.sameDayAvailable ? "Same day" : `1-${zone.maxDeliveryDays}`,
      trackingIncluded: true,
      freeShippingMinimum: zone.freeDeliveryMinimum ? parseFloat(zone.freeDeliveryMinimum) : null
    }));
  }

  // Calculate shipping costs (mock implementations)
  private calculateUSPSRate(packageData: any): number {
    const { weight, dimensions } = packageData;
    const baseRate = 5.50;
    const weightRate = weight * 0.85;
    const sizeRate = (dimensions.length * dimensions.width * dimensions.height) / 1728 * 0.50;
    return Math.round((baseRate + weightRate + sizeRate) * 100) / 100;
  }

  private calculateUPSRate(packageData: any): number {
    return this.calculateUSPSRate(packageData) * 1.3;
  }

  private calculateFedExRate(packageData: any): number {
    return this.calculateUSPSRate(packageData) * 1.25;
  }

  private generateTrackingNumber(carrier: string): string {
    const prefix = {
      "USPS": "9400",
      "UPS": "1Z",
      "FedEx": "7712",
      "Local Delivery": "LD"
    }[carrier] || "TRK";
    
    return `${prefix}${nanoid(10).toUpperCase()}`;
  }

  // Track package status
  async trackPackage(trackingNumber: string) {
    const label = await db.select().from(shippingLabels).where(eq(shippingLabels.trackingNumber, trackingNumber));
    
    if (!label[0]) {
      throw new Error("Tracking number not found");
    }

    // In production, this would call carrier APIs for real tracking
    return {
      trackingNumber,
      status: label[0].status,
      carrier: label[0].carrier,
      estimatedDelivery: this.getEstimatedDelivery(label[0]),
      trackingEvents: this.getMockTrackingEvents(label[0])
    };
  }

  private getEstimatedDelivery(label: any) {
    const created = new Date(label.createdAt);
    const deliveryDays = label.serviceType.includes("Same Day") ? 0 : 
                        label.serviceType.includes("Overnight") ? 1 :
                        label.serviceType.includes("Express") ? 2 : 4;
    
    const estimated = new Date(created);
    estimated.setDate(estimated.getDate() + deliveryDays);
    return estimated.toISOString().split('T')[0];
  }

  private getMockTrackingEvents(label: any) {
    const events = [
      { status: "Label Created", timestamp: label.createdAt, location: "Origin Facility" }
    ];

    if (label.shippedAt) {
      events.push({ status: "Picked Up", timestamp: label.shippedAt, location: "Origin Facility" });
      events.push({ status: "In Transit", timestamp: label.shippedAt, location: "Sorting Facility" });
    }

    if (label.deliveredAt) {
      events.push({ status: "Delivered", timestamp: label.deliveredAt, location: "Destination" });
    }

    return events;
  }
}

export const shippingService = new ShippingService();