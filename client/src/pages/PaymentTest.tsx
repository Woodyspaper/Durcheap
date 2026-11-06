import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function PaymentTest() {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '29.00',
    planType: 'pro',
    cardNumber: '4111111111111111',
    expiryMonth: '12',
    expiryYear: '2025',
    cvv: '123',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    email: 'test@example.com'
  });
  
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const testPayment = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/payments/process', {
        amount: parseFloat(paymentData.amount),
        paymentMethod: {
          cardNumber: paymentData.cardNumber,
          expiryMonth: paymentData.expiryMonth,
          expiryYear: paymentData.expiryYear,
          cvv: paymentData.cvv
        },
        billingAddress: {
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          address: paymentData.address,
          city: paymentData.city,
          state: paymentData.state,
          zip: paymentData.zip
        },
        orderId: `TEST_ORDER_${Date.now()}`,
        description: 'Test payment through NMI Gateway'
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: `Transaction ID: ${result.transactionId}`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment test error:', error);
      toast({
        title: "Payment Error",
        description: 'Failed to process test payment',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSubscription = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/subscriptions/create', {
        planType: paymentData.planType,
        paymentMethod: {
          cardNumber: paymentData.cardNumber,
          expiryMonth: paymentData.expiryMonth,
          expiryYear: paymentData.expiryYear,
          cvv: paymentData.cvv
        },
        billingAddress: {
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          address: paymentData.address,
          city: paymentData.city,
          state: paymentData.state,
          zip: paymentData.zip,
          email: paymentData.email
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Subscription Created!",
          description: `Subscription ID: ${result.subscription.subscriptionId}`,
        });
      } else {
        toast({
          title: "Subscription Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Subscription test error:', error);
      toast({
        title: "Subscription Error",
        description: 'Failed to create test subscription',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>NMI Payment Gateway Test</CardTitle>
            <CardDescription>
              Test your National Processing + NMI integration with live credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="29.00"
                />
              </div>
              <div>
                <Label htmlFor="planType">Plan Type</Label>
                <Select value={paymentData.planType} onValueChange={(value) => handleInputChange('planType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro">Pro ($29/month)</SelectItem>
                    <SelectItem value="enterprise">Enterprise ($99/month)</SelectItem>
                    <SelectItem value="local_plus">Local+ ($4.99/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    placeholder="4111111111111111"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Input
                    id="expiryMonth"
                    value={paymentData.expiryMonth}
                    onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                    placeholder="12"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Input
                    id="expiryYear"
                    value={paymentData.expiryYear}
                    onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                    placeholder="2025"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Billing Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={paymentData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={paymentData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={paymentData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Test St"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={paymentData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Miami"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={paymentData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="FL"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={paymentData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    placeholder="33101"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={paymentData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={testPayment} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Test One-Time Payment'}
              </Button>
              <Button 
                onClick={testSubscription} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Test Subscription'}
              </Button>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <p><strong>NMI Gateway Status:</strong> Ready with your credentials</p>
              <p><strong>Username:</strong> woodyspaper</p>
              <p><strong>Gateway URL:</strong> https://secure.nmi.com/api/transact.php</p>
              <p className="mt-2 text-xs text-gray-500">
                Use test card 4111111111111111 for testing. Real transactions will be processed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}