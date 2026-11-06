# NMI Gateway Setup Guide for Durcheap

## Integration Status
✅ **Framework Complete**: NMI gateway integration code is ready
🔄 **Awaiting Credentials**: Need your NMI account details to activate live payments

## Required Environment Variables

Add these to your environment configuration:

```bash
# NMI Gateway Configuration
NMI_GATEWAY_URL=https://secure.nmi.com/api/transact.php
NMI_USERNAME=your_nmi_username
NMI_PASSWORD=your_nmi_password
NMI_SECURITY_KEY=your_nmi_security_key
```

## How to Get Your NMI Credentials

### Step 1: Access Your NMI Account
1. Log into your NMI merchant account dashboard
2. Navigate to **Settings** → **Security Keys** or **API Settings**

### Step 2: Locate Your Credentials
- **Username**: Your NMI gateway username (usually your merchant login)
- **Password**: Your NMI gateway password (may be different from login password)
- **Security Key**: Used for transaction verification and webhooks

### Step 3: Enable Required Features
Ensure these features are enabled in your NMI account:
- ✅ **Recurring Billing**: For subscription processing
- ✅ **API Access**: For direct transaction processing
- ✅ **Webhooks**: For real-time payment notifications
- ✅ **ACH Processing**: For seller commission payouts (if available)

## Integration Features Ready to Activate

### ✅ Payment Processing
- One-time payments for product purchases
- Subscription billing for Pro ($29/month) and Enterprise ($99/month) plans
- Local+ membership billing ($4.99/month)

### ✅ Subscription Management
- Automatic recurring billing
- Plan upgrades/downgrades with proration
- Subscription cancellation and refunds
- Failed payment retry logic

### ✅ Commission Payouts
- Automated seller commission payments
- ACH bank transfers for payouts
- Transaction fee collection
- Revenue split calculations

### ✅ Security & Compliance
- PCI DSS compliance through NMI
- Encrypted payment data transmission
- Webhook signature verification
- Fraud detection integration

## API Endpoints Ready for Your Account

### Payment Processing
- `POST /api/payments/process` - Process one-time payments
- `POST /api/payments/refund` - Process refunds

### Subscription Management  
- `POST /api/subscriptions/create` - Create recurring subscriptions
- `POST /api/subscriptions/update` - Update subscription plans
- `POST /api/subscriptions/cancel` - Cancel subscriptions

### Commission Payouts
- `POST /api/payouts/process` - Process seller payouts
- `GET /api/payouts/status` - Check payout status

### Webhooks
- `POST /api/webhooks/payments` - Receive NMI notifications

## Revenue Model Integration

Your complete monetization strategy is ready:

### Commission Structure (5-15% by category)
- Electronics: 8%
- Fashion: 12% 
- Home & Garden: 10%
- Pro Tools: 5%
- Contractor Services: 6%

### Subscription Plans
- **Basic**: Free (3% transaction fee)
- **Pro**: $29/month (reduced fees, advanced tools)
- **Enterprise**: $99/month (lowest fees, priority support)
- **Local+**: $4.99/month (local business features)

### Additional Revenue
- Payment processing fees: 2.9% + $0.30 per transaction
- Shipping service commissions
- Promoted listing fees
- Professional verification fees

## Testing Strategy

### Phase 1: Sandbox Testing
1. Use NMI's test environment
2. Process test transactions
3. Verify subscription creation/cancellation
4. Test webhook notifications

### Phase 2: Production Deployment
1. Switch to live NMI credentials
2. Process small test transaction
3. Monitor transaction processing
4. Enable full payment features

## Next Steps

1. **Provide NMI Credentials**: Share your username, password, and security key
2. **Configure Environment**: I'll set up the secure environment variables
3. **Test Integration**: Process test transactions to verify functionality
4. **Go Live**: Enable live payment processing for your marketplace

Once you provide your NMI credentials, your complete e-commerce payment system will be fully operational within minutes!