import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Zap,
  Plus,
  ArrowRight,
  Clock,
  Gift
} from "lucide-react";

interface PurchasedProduct {
  id: string;
  name: string;
  type: 'single_event' | 'event_subscription' | 'event_marketing';
  remainingCredits: number;
  expiresAt?: string;
  purchaseDate: string;
}

export default function PostPurchaseEventSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const { data: purchasedProducts } = useQuery({
    queryKey: ['/api/user/purchased-products'],
    enabled: !!user,
  });

  // Mock purchased products for demonstration
  const mockPurchasedProducts: PurchasedProduct[] = [
    {
      id: 'purchase1',
      name: 'Single Event Sponsored',
      type: 'single_event',
      remainingCredits: 3,
      purchaseDate: '2025-01-20T10:00:00Z'
    },
    {
      id: 'purchase2', 
      name: 'Metro Area Monthly Subscription',
      type: 'event_subscription',
      remainingCredits: 8,
      expiresAt: '2025-02-20T10:00:00Z',
      purchaseDate: '2025-01-20T10:00:00Z'
    }
  ];

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Event Management',
      description: 'Learn how to create and manage your event advertisements',
      icon: <Gift className="h-6 w-6" />,
      action: 'Get Started',
      completed: completedSteps.includes('welcome')
    },
    {
      id: 'create-first-event',
      title: 'Create Your First Event',
      description: 'Use your purchased advertising credits to create an event post',
      icon: <Plus className="h-6 w-6" />,
      action: 'Create Event',
      completed: completedSteps.includes('create-first-event')
    },
    {
      id: 'optimize-listing',
      title: 'Optimize Your Listing',
      description: 'Add photos, detailed descriptions, and contact information',
      icon: <Zap className="h-6 w-6" />,
      action: 'Optimize Event',
      completed: completedSteps.includes('optimize-listing')
    },
    {
      id: 'track-performance',
      title: 'Track Performance',
      description: 'Monitor views, clicks, and RSVPs through analytics dashboard',
      icon: <CheckCircle className="h-6 w-6" />,
      action: 'View Analytics',
      completed: completedSteps.includes('track-performance')
    }
  ];

  const handleStepAction = (stepId: string) => {
    if (stepId === 'welcome') {
      setCompletedSteps([...completedSteps, stepId]);
      toast({
        title: "Welcome!",
        description: "You're ready to start creating events.",
      });
    } else if (stepId === 'create-first-event') {
      setLocation('/event-management?tab=create');
    } else if (stepId === 'optimize-listing') {
      setLocation('/event-management');
    } else if (stepId === 'track-performance') {
      setLocation('/event-management?tab=analytics');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to access event setup</h1>
            <Button onClick={() => window.location.href = '/auth'}>
              Log In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full inline-flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5" />
              Purchase Successful!
            </div>
            <h1 className="text-3xl font-bold text-amazon-dark mb-2">Set Up Your Event Advertising</h1>
            <p className="text-gray-600">
              Congratulations! You've purchased event advertising credits. Let's help you create your first event post.
            </p>
          </div>

          {/* Purchased Products */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Advertising Credits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockPurchasedProducts.map((product) => (
                <Card key={product.id} className="border-l-4 border-l-amazon-orange">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge className="bg-green-500 text-white">
                        {product.remainingCredits} credits
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Purchased: {new Date(product.purchaseDate).toLocaleDateString()}
                      </div>
                      {product.expiresAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Expires: {new Date(product.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Setup Steps */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-amazon-orange text-white'
                        }`}>
                          {step.completed ? <CheckCircle className="h-6 w-6" /> : step.icon}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          onClick={() => handleStepAction(step.id)}
                          className={step.completed ? 'bg-green-500 hover:bg-green-600' : 'bg-amazon-orange hover:bg-orange-600'}
                          disabled={step.completed}
                        >
                          {step.completed ? 'Completed' : step.action}
                          {!step.completed && <ArrowRight className="h-4 w-4 ml-2" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/event-management?tab=create')}
                  className="h-20 flex flex-col gap-2"
                >
                  <Plus className="h-6 w-6" />
                  Create New Event
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/event-management')}
                  className="h-20 flex flex-col gap-2"
                >
                  <Calendar className="h-6 w-6" />
                  Manage Events
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/event-management?tab=analytics')}
                  className="h-20 flex flex-col gap-2"
                >
                  <Users className="h-6 w-6" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Ready to create your first event? Use your advertising credits to get maximum visibility.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setLocation('/event-management?tab=create')}
                className="bg-amazon-orange hover:bg-orange-600"
              >
                Create First Event
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/event-advertising')}
              >
                Buy More Credits
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}