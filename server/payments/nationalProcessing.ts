import crypto from 'crypto';
// NMI Gateway integration for National Processing

// NMI Gateway integration for National Processing merchant account
export class NMIGateway {
  private gatewayUrl: string;
  private merchantId: string;
  private apiLoginId: string;
  private transactionKey: string;
  private hashSecret: string;

  constructor() {
    // NMI Gateway URL - typically https://secure.nmi.com/api/transact.php
    this.gatewayUrl = process.env.NMI_GATEWAY_URL || 'https://secure.nmi.com/api/transact.php';
    this.merchantId = process.env.NMI_USERNAME || 'woodyspaper';
    this.apiLoginId = process.env.NMI_USERNAME || 'woodyspaper';
    this.transactionKey = process.env.NMI_PASSWORD || 'Woodyspaper2@';
    this.hashSecret = process.env.NMI_SECURITY_KEY || '3Z6F5eQ4n55hNaP472q3MRP8n3Ek8EJM';
  }

  // Process one-time payment
  async processPayment(paymentData: {
    amount: number;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    billingAddress: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
    orderId: string;
    description: string;
  }) {
    // NMI-specific transaction format
    const transactionData = {
      type: 'sale',
      amount: paymentData.amount.toFixed(2),
      ccnumber: paymentData.cardNumber,
      ccexp: `${paymentData.expiryMonth.padStart(2, '0')}${paymentData.expiryYear.slice(-2)}`,
      cvv: paymentData.cvv,
      firstname: paymentData.billingAddress.firstName,
      lastname: paymentData.billingAddress.lastName,
      address1: paymentData.billingAddress.address,
      city: paymentData.billingAddress.city,
      state: paymentData.billingAddress.state,
      zip: paymentData.billingAddress.zip,
      orderid: paymentData.orderId,
      orderdescription: paymentData.description,
      username: this.apiLoginId,
      password: this.transactionKey,
    };

    try {
      const response = await this.makeRequest(transactionData);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new Error('Payment processing failed');
    }
  }

  // Create subscription for recurring billing
  async createSubscription(subscriptionData: {
    amount: number;
    frequency: 'monthly' | 'yearly';
    customerId: string;
    planName: string;
    cardToken?: string;
    paymentMethod: {
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
    };
    billingAddress: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      email: string;
    };
  }) {
    const recurringData = {
      type: 'add_subscription',
      plan_id: this.generatePlanId(subscriptionData.planName),
      plan_amount: subscriptionData.amount.toFixed(2),
      plan_payments: '0', // Indefinite
      plan_frequency: subscriptionData.frequency === 'monthly' ? '1' : '12',
      plan_frequency_unit: 'month',
      start_date: new Date().toISOString().split('T')[0],
      ccnumber: subscriptionData.paymentMethod.cardNumber,
      ccexp: `${subscriptionData.paymentMethod.expiryMonth}${subscriptionData.paymentMethod.expiryYear}`,
      firstname: subscriptionData.billingAddress.firstName,
      lastname: subscriptionData.billingAddress.lastName,
      address1: subscriptionData.billingAddress.address,
      city: subscriptionData.billingAddress.city,
      state: subscriptionData.billingAddress.state,
      zip: subscriptionData.billingAddress.zip,
      email: subscriptionData.billingAddress.email,
      customer_id: subscriptionData.customerId,
      username: this.apiLoginId,
      password: this.transactionKey,
    };

    try {
      const response = await this.makeRequest(recurringData);
      return this.parseSubscriptionResponse(response);
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw new Error('Subscription creation failed');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    const cancelData = {
      type: 'delete_subscription',
      subscription_id: subscriptionId,
      username: this.apiLoginId,
      password: this.transactionKey,
    };

    try {
      const response = await this.makeRequest(cancelData);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw new Error('Subscription cancellation failed');
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, updates: {
    amount?: number;
    planName?: string;
  }) {
    const updateData = {
      type: 'update_subscription',
      subscription_id: subscriptionId,
      ...(updates.amount && { plan_amount: updates.amount.toFixed(2) }),
      ...(updates.planName && { plan_id: this.generatePlanId(updates.planName) }),
      username: this.apiLoginId,
      password: this.transactionKey,
    };

    try {
      const response = await this.makeRequest(updateData);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Subscription update error:', error);
      throw new Error('Subscription update failed');
    }
  }

  // Process seller payout (for commission payments)
  async processPayout(payoutData: {
    sellerId: string;
    amount: number;
    bankAccount: {
      routingNumber: string;
      accountNumber: string;
      accountType: 'checking' | 'savings';
    };
    description: string;
  }) {
    // This would typically use ACH or bank transfer API
    const achData = {
      type: 'ach_debit', // or 'ach_credit' for payouts
      amount: payoutData.amount.toFixed(2),
      account_holder_type: 'individual',
      account_type: payoutData.bankAccount.accountType,
      routing_number: payoutData.bankAccount.routingNumber,
      account_number: payoutData.bankAccount.accountNumber,
      orderid: `payout_${payoutData.sellerId}_${Date.now()}`,
      orderdescription: payoutData.description,
      username: this.apiLoginId,
      password: this.transactionKey,
    };

    try {
      const response = await this.makeRequest(achData);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Payout processing error:', error);
      throw new Error('Payout processing failed');
    }
  }

  // Verify transaction/webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.hashSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Private helper methods
  private async makeRequest(data: Record<string, any>) {
    const formData = new URLSearchParams();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key].toString());
      }
    });

    const response = await global.fetch(this.gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  }

  private parseResponse(response: string) {
    // Parse the gateway response format (varies by gateway)
    const params = new URLSearchParams(response);
    
    return {
      success: params.get('response') === '1',
      transactionId: params.get('transactionid'),
      authCode: params.get('authcode'),
      avsResponse: params.get('avsresponse'),
      cvvResponse: params.get('cvvresponse'),
      responseText: params.get('responsetext'),
      responseCode: params.get('response_code'),
    };
  }

  private parseSubscriptionResponse(response: string) {
    const params = new URLSearchParams(response);
    
    return {
      success: params.get('response') === '1',
      subscriptionId: params.get('subscription_id'),
      customerId: params.get('customer_id'),
      responseText: params.get('responsetext'),
      nextBillingDate: params.get('next_charge_date'),
    };
  }

  private generatePlanId(planName: string): string {
    return `durcheap_${planName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }
}

export const nmiGateway = new NMIGateway();