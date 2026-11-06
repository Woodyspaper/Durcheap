import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  HelpCircle,
  Database,
  Server,
  Monitor,
  Users,
  CreditCard,
  Package,
  Settings,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Globe,
  Code,
  Bug,
  Wrench,
  BookOpen,
  Phone,
  Mail,
} from "lucide-react";

export default function AdminHelp() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Sign in to access admin help</h1>
              <p className="text-gray-600 mb-6">You need to be signed in as an administrator to access this page.</p>
              <Button onClick={() => window.location.href = "/auth"}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">You need administrator privileges to access this help section.</p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="whitespace-pre-wrap pr-12">{code}</pre>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amazon-dark">Administration Help Center</h1>
            <p className="text-gray-600">Comprehensive guide for site administration and troubleshooting</p>
          </div>
          <Badge className="bg-blue-600 text-white">
            <HelpCircle className="h-4 w-4 mr-1" />
            Help Documentation
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            <TabsTrigger value="contact">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-amazon-orange" />
                  System Architecture Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <Monitor className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold">Frontend</h3>
                    <p className="text-sm text-gray-600">React 18 + TypeScript, Tailwind CSS, Radix UI components</p>
                  </Card>
                  <Card className="p-4">
                    <Server className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-semibold">Backend</h3>
                    <p className="text-sm text-gray-600">Express.js + Node.js, RESTful API, Authentication</p>
                  </Card>
                  <Card className="p-4">
                    <Database className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-semibold">Database</h3>
                    <p className="text-sm text-gray-600">PostgreSQL + Drizzle ORM, Neon serverless</p>
                  </Card>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> All administrative actions are logged and require proper authentication.
                    Always test changes in development before applying to production.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Key Admin Responsibilities</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />User account management and role assignments</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Order processing and customer support</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Financial reporting and tax document generation</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />System monitoring and performance optimization</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Security and compliance oversight</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frontend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-6 w-6 mr-2 text-blue-600" />
                  Frontend Administration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="user-management">
                    <AccordionTrigger>User Account Management</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Manage user accounts, roles, and permissions through the admin panel.</p>
                      
                      <h4 className="font-semibold">User Roles:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><Badge className="bg-red-100 text-red-800">admin</Badge> - Full system access</li>
                        <li><Badge className="bg-blue-100 text-blue-800">seller</Badge> - Product management and sales</li>
                        <li><Badge className="bg-green-100 text-green-800">buyer</Badge> - Purchase and review products</li>
                      </ul>

                      <h4 className="font-semibold">Common Tasks:</h4>
                      <CodeBlock
                        id="user-tasks"
                        code={`// Update user role via Admin Panel
1. Navigate to Admin Panel > Users tab
2. Find user in the list
3. Click "Edit" button
4. Select new role from dropdown
5. Save changes

// Bulk user operations
- Export user data to CSV
- Send mass communications
- Apply role changes to multiple users`}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="order-management">
                    <AccordionTrigger>Order Management</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Process orders, update statuses, and handle customer service issues.</p>
                      
                      <h4 className="font-semibold">Order Status Flow:</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <Badge className="bg-gray-100 text-gray-800">pending</Badge>
                        <span>→</span>
                        <Badge className="bg-yellow-100 text-yellow-800">processing</Badge>
                        <span>→</span>
                        <Badge className="bg-blue-100 text-blue-800">shipped</Badge>
                        <span>→</span>
                        <Badge className="bg-green-100 text-green-800">delivered</Badge>
                      </div>

                      <CodeBlock
                        id="order-management"
                        code={`// Update order status
1. Go to Admin Panel > Orders tab
2. Find order by ID or customer
3. Select new status from dropdown
4. Add tracking number if shipped
5. Customer receives automatic notification

// Handle cancellations
- Check refund policy compliance
- Process refund through payment gateway
- Update inventory if needed
- Send confirmation to customer`}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="product-oversight">
                    <AccordionTrigger>Product & Seller Oversight</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Monitor product listings, review seller performance, and maintain quality standards.</p>
                      
                      <CodeBlock
                        id="product-oversight"
                        code={`// Product review process
1. Monitor new product submissions
2. Check for policy violations
3. Verify product information accuracy
4. Approve or request modifications

// Seller performance metrics
- Order fulfillment rate
- Customer satisfaction scores
- Response time to inquiries
- Policy compliance history`}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-6 w-6 mr-2 text-green-600" />
                  Backend System Administration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="api-management">
                    <AccordionTrigger>API Management</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Monitor and manage REST API endpoints, authentication, and performance.</p>
                      
                      <h4 className="font-semibold">Key API Endpoints:</h4>
                      <CodeBlock
                        id="api-endpoints"
                        code={`// Authentication
GET  /api/auth/user          - Get current user
POST /api/login             - Initiate login
GET  /api/logout            - User logout

// Admin endpoints
GET  /api/admin/stats       - System statistics
GET  /api/admin/users       - User management
GET  /api/admin/orders      - Order management
PUT  /api/admin/orders/:id/status - Update order

// Payment processing
POST /api/payment/intent    - Create payment
GET  /api/crypto/prices     - Live crypto rates
POST /api/crypto/convert    - Convert crypto to USD

// Product management
GET  /api/products          - Product catalog
POST /api/products          - Create product
PUT  /api/products/:id      - Update product
DELETE /api/products/:id    - Remove product`}
                      />

                      <h4 className="font-semibold">API Monitoring:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Check server logs for error patterns</li>
                        <li>Monitor response times and throughput</li>
                        <li>Verify authentication token validity</li>
                        <li>Track rate limiting and abuse patterns</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="environment-config">
                    <AccordionTrigger>Environment Configuration</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Manage environment variables and system configuration.</p>
                      
                      <h4 className="font-semibold">Required Environment Variables:</h4>
                      <CodeBlock
                        id="env-vars"
                        code={`// Database
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

// Authentication
SESSION_SECRET=random_secret_key
REPL_ID=your_replit_id
ISSUER_URL=https://replit.com/oidc

// Payment Processing
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
NMI_API_KEY=...

// External APIs
SENDGRID_API_KEY=...
OPENAI_API_KEY=... (if using AI features)`}
                      />

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Security:</strong> Never expose secret keys in frontend code. Use VITE_ prefix only for public keys.
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment-gateway">
                    <AccordionTrigger>Payment Gateway Management</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Configure and monitor payment processing systems including NMI and cryptocurrency.</p>
                      
                      <h4 className="font-semibold">Payment Methods:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <CreditCard className="h-6 w-6 text-blue-600 mb-2" />
                          <h5 className="font-semibold">NMI Gateway</h5>
                          <p className="text-sm text-gray-600">Credit/debit card processing</p>
                        </Card>
                        <Card className="p-4">
                          <Globe className="h-6 w-6 text-green-600 mb-2" />
                          <h5 className="font-semibold">Cryptocurrency</h5>
                          <p className="text-sm text-gray-600">USDC, USDT, DAI, BUSD</p>
                        </Card>
                      </div>

                      <CodeBlock
                        id="payment-monitoring"
                        code={`// Payment monitoring tasks
1. Check transaction success rates
2. Monitor failed payment patterns
3. Verify webhook delivery
4. Review chargeback notifications
5. Validate crypto price accuracy

// Crypto price API status
curl "http://localhost:5000/api/crypto/prices"
// Should return live rates for 4 stablecoins`}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-6 w-6 mr-2 text-purple-600" />
                  Database Administration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="schema-management">
                    <AccordionTrigger>Schema Management</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Manage database schema, migrations, and data integrity using Drizzle ORM.</p>
                      
                      <h4 className="font-semibold">Core Tables:</h4>
                      <CodeBlock
                        id="database-schema"
                        code={`// Main entities
users               - User accounts and authentication
products            - Product catalog
orders              - Purchase orders
order_items         - Order line items
reviews             - Product reviews
categories          - Product categories

// Financial
user_balances       - Account balances
transactions        - Financial transactions
tax_documents       - Generated tax reports
tax_rates           - Tax rate configuration

// System
sessions            - User sessions
coupons             - Discount codes
events              - Local events data`}
                      />

                      <h4 className="font-semibold">Schema Updates:</h4>
                      <CodeBlock
                        id="schema-updates"
                        code={`// Apply schema changes
npm run db:push

// Generate migration
npm run db:generate

// View current schema
npm run db:studio`}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-backup">
                    <AccordionTrigger>Backup & Recovery</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Implement data backup strategies and recovery procedures.</p>
                      
                      <CodeBlock
                        id="backup-commands"
                        code={`// PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

// Restore from backup
psql $DATABASE_URL < backup_file.sql

// Automated daily backups (recommended)
# Add to cron job:
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz`}
                      />

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Critical:</strong> Test backup restoration regularly. Backups are only useful if they can be restored successfully.
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="performance-monitoring">
                    <AccordionTrigger>Performance Monitoring</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>Monitor database performance, optimize queries, and manage connections.</p>
                      
                      <CodeBlock
                        id="performance-queries"
                        code={`-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Identify slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor index usage
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;`}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="troubleshooting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bug className="h-6 w-6 mr-2 text-red-600" />
                  Common Issues & Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="auth-issues">
                    <AccordionTrigger>Authentication Problems</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <h4 className="font-semibold text-red-600">❌ Users can't log in</h4>
                      <CodeBlock
                        id="auth-debug"
                        code={`// Check environment variables
echo $SESSION_SECRET
echo $REPL_ID

// Verify database connection
SELECT * FROM sessions LIMIT 5;

// Clear stale sessions
DELETE FROM sessions WHERE expire < NOW();

// Test authentication endpoint
curl -X GET "http://localhost:5000/api/auth/user"`}
                      />

                      <h4 className="font-semibold text-red-600">❌ Session expired errors</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Check session store configuration</li>
                        <li>Verify PostgreSQL session table exists</li>
                        <li>Ensure SESSION_SECRET is consistent</li>
                        <li>Review session TTL settings</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment-issues">
                    <AccordionTrigger>Payment Processing Issues</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <h4 className="font-semibold text-red-600">❌ Payment failures</h4>
                      <CodeBlock
                        id="payment-debug"
                        code={`// Check payment gateway status
curl -X POST "http://localhost:5000/api/payment/test" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1.00}'

// Verify environment variables
echo $STRIPE_SECRET_KEY
echo $VITE_STRIPE_PUBLIC_KEY

// Check crypto prices API
curl "http://localhost:5000/api/crypto/prices"

// Monitor payment logs
tail -f /var/log/payments.log`}
                      />

                      <h4 className="font-semibold text-red-600">❌ Cryptocurrency conversion errors</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Verify CoinGecko API is accessible</li>
                        <li>Check rate limiting on crypto API</li>
                        <li>Ensure stablecoin prices are near $1.00</li>
                        <li>Review conversion fee calculations</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="database-issues">
                    <AccordionTrigger>Database Connection Issues</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <h4 className="font-semibold text-red-600">❌ "value too long for type character varying"</h4>
                      <p className="text-sm text-gray-600">This is a known issue with user ID length constraints.</p>
                      <CodeBlock
                        id="varchar-fix"
                        code={`-- Increase varchar length for user IDs
ALTER TABLE user_balances ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(50);

-- Update schema in shared/schema.ts
// Change varchar("user_id", { length: 16 })
// To: varchar("user_id", { length: 50 })

-- Apply changes
npm run db:push`}
                      />

                      <h4 className="font-semibold text-red-600">❌ Connection timeouts</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Check DATABASE_URL configuration</li>
                        <li>Verify Neon database is active</li>
                        <li>Monitor connection pool usage</li>
                        <li>Review query performance</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="frontend-issues">
                    <AccordionTrigger>Frontend Loading Issues</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <h4 className="font-semibold text-red-600">❌ Components not loading</h4>
                      <CodeBlock
                        id="frontend-debug"
                        code={`// Check build process
npm run dev

// Clear browser cache
Ctrl + Shift + Delete (or Cmd + Shift + Delete)

// Check console for errors
F12 -> Console tab

// Verify API connectivity
fetch('/api/auth/user').then(r => console.log(r.status))

// Check environment variables
console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY)`}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-6 w-6 mr-2 text-green-600" />
                  Support Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <Mail className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-sm text-gray-600 mb-3">For technical issues and general inquiries</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium">General:</span>
                        <a href="mailto:buyit@durcheap.com" className="ml-2 text-blue-600 hover:underline">
                          buyit@durcheap.com
                        </a>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Technical:</span>
                        <a href="mailto:support@durcheap.com" className="ml-2 text-blue-600 hover:underline">
                          support@durcheap.com
                        </a>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <Phone className="h-8 w-8 text-green-600 mb-4" />
                    <h3 className="font-semibold mb-2">Phone Support</h3>
                    <p className="text-sm text-gray-600 mb-3">Emergency support and urgent issues</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium">Main:</span>
                        <a href="tel:+19549375374" className="ml-2 text-green-600 hover:underline">
                          (954) 937-5374
                        </a>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Hours:</span> EST Business Hours
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Escalation Procedures</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-medium text-yellow-800">Level 1: General Issues</h4>
                      <p className="text-sm text-gray-600">User management, order processing, basic troubleshooting</p>
                      <p className="text-xs text-gray-500">Response time: 2-4 hours</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4">
                      <h4 className="font-medium text-orange-800">Level 2: Technical Issues</h4>
                      <p className="text-sm text-gray-600">Database problems, API failures, payment issues</p>
                      <p className="text-xs text-gray-500">Response time: 1-2 hours</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h4 className="font-medium text-red-800">Level 3: Critical Issues</h4>
                      <p className="text-sm text-gray-600">System outages, security breaches, data loss</p>
                      <p className="text-xs text-gray-500">Response time: 15-30 minutes</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Documentation & Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Internal Documentation</h4>
                      <ul className="text-sm space-y-1">
                        <li><a href="/admin" className="text-blue-600 hover:underline flex items-center">
                          Admin Panel <ExternalLink className="h-3 w-3 ml-1" />
                        </a></li>
                        <li><a href="/admin/revenue" className="text-blue-600 hover:underline flex items-center">
                          Revenue Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                        </a></li>
                        <li><a href="/admin/accounting" className="text-blue-600 hover:underline flex items-center">
                          Accounting Tools <ExternalLink className="h-3 w-3 ml-1" />
                        </a></li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">External Resources</h4>
                      <ul className="text-sm space-y-1">
                        <li><a href="https://drizzle.team/docs" target="_blank" className="text-blue-600 hover:underline flex items-center">
                          Drizzle ORM Docs <ExternalLink className="h-3 w-3 ml-1" />
                        </a></li>
                        <li><a href="https://docs.stripe.com" target="_blank" className="text-blue-600 hover:underline flex items-center">
                          Stripe Documentation <ExternalLink className="h-3 w-3 ml-1" />
                        </a></li>
                        <li><a href="https://replit.com/docs" target="_blank" className="text-blue-600 hover:underline flex items-center">
                          Replit Documentation <ExternalLink className="h-3 w-3 ml-1" />
                        </a></li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}