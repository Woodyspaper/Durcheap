// Test script to verify 1YEARFREE coupon calculation
const testCartItems = [
  // Premium API Access - $49.99/month
  {
    product: {
      id: "api_access_premium",
      name: "Premium API Access",
      price: "49.99",
      categoryId: "subscription_plans"
    },
    quantity: 1
  },
  // Tax Automation Service - $7.99/month  
  {
    product: {
      id: "tax_automation_service", 
      name: "Tax Automation Service",
      price: "7.99",
      categoryId: "subscription_plans"
    },
    quantity: 1
  },
  // Premium Shipping Tools - $4.99/month
  {
    product: {
      id: "shipping_tools_premium",
      name: "Premium Shipping Tools", 
      price: "4.99",
      categoryId: "subscription_plans"
    },
    quantity: 1
  },
  // City Event Marketing - $24.99/month
  {
    product: {
      id: "event_marketing_city",
      name: "City Event Marketing",
      price: "24.99", 
      categoryId: "subscription_plans"
    },
    quantity: 1
  },
  // Enterprise Subscription Plan - $99.00/month
  {
    product: {
      id: "subscription_enterprise",
      name: "Enterprise Subscription Plan",
      price: "99.00",
      categoryId: "subscription_plans" 
    },
    quantity: 1
  }
];

// Calculate totals
const monthlyTotal = testCartItems.reduce((total, item) => {
  return total + (Number(item.product.price) * item.quantity);
}, 0);

// Calculate 12-month subscription value (what 1YEARFREE should discount)
const yearlySubscriptionValue = testCartItems.reduce((total, item) => {
  const monthlyPrice = Number(item.product.price);
  const yearlyValue = monthlyPrice * 12; // 12 months
  return total + (yearlyValue * item.quantity);
}, 0);

console.log("=== 1YEARFREE Coupon Test ===");
console.log("Monthly cart total:", `$${monthlyTotal.toFixed(2)}`);
console.log("12-month subscription value:", `$${yearlySubscriptionValue.toFixed(2)}`);
console.log("1YEARFREE discount:", `$${yearlySubscriptionValue.toFixed(2)}`);
console.log("Final cart total after coupon:", `$${Math.max(0, monthlyTotal - yearlySubscriptionValue).toFixed(2)}`);

console.log("\n=== Breakdown by Service ===");
testCartItems.forEach(item => {
  const monthlyPrice = Number(item.product.price);
  const yearlyValue = monthlyPrice * 12;
  console.log(`${item.product.name}: $${monthlyPrice}/month → $${yearlyValue}/year value`);
});

console.log(`\nTotal services: ${testCartItems.length}`);
console.log(`Combined monthly cost: $${monthlyTotal.toFixed(2)}`);
console.log(`Combined yearly value: $${yearlySubscriptionValue.toFixed(2)}`);
console.log(`Savings with 1YEARFREE: $${yearlySubscriptionValue.toFixed(2)} (12 months free)`);