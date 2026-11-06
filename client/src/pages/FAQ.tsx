import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Store, 
  Calendar, 
  Navigation, 
  UserCheck, 
  Settings, 
  Package, 
  Upload, 
  MapPin, 
  CreditCard,
  Search,
  ShoppingCart,
  User,
  FileText,
  Camera,
  Clock,
  DollarSign,
  Users,
  Phone,
  Mail
} from "lucide-react";

export default function FAQ() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">Complete step-by-step guides for using Durcheap</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a href="#seller-guide" className="block text-sm text-blue-600 hover:text-blue-800" data-testid="nav-seller-guide">
                    <Store className="h-4 w-4 inline mr-2" />
                    Selling Products
                  </a>
                  <a href="#event-guide" className="block text-sm text-blue-600 hover:text-blue-800" data-testid="nav-event-guide">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Creating Events
                  </a>
                  <a href="#navigation-guide" className="block text-sm text-blue-600 hover:text-blue-800" data-testid="nav-navigation-guide">
                    <Navigation className="h-4 w-4 inline mr-2" />
                    Site Navigation
                  </a>
                  <a href="#account-guide" className="block text-sm text-blue-600 hover:text-blue-800" data-testid="nav-account-guide">
                    <UserCheck className="h-4 w-4 inline mr-2" />
                    Account Setup
                  </a>
                  <a href="#advanced-guide" className="block text-sm text-blue-600 hover:text-blue-800" data-testid="nav-advanced-guide">
                    <Settings className="h-4 w-4 inline mr-2" />
                    Advanced Features
                  </a>
                  <a href="#crypto-guide" className="block text-sm text-blue-600 hover:text-blue-800" data-testid="nav-crypto-guide">
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Cryptocurrency Payments
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Seller Guide */}
            <section id="seller-guide">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Store className="h-6 w-6 mr-3 text-amazon-orange" />
                    How to Add and Manage Products as a Seller
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="becoming-seller">
                      <AccordionTrigger className="text-left" data-testid="accordion-becoming-seller">
                        <Package className="h-4 w-4 mr-2" />
                        Step 1: Becoming a Seller
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Sign in to your Durcheap account</li>
                          <li>Click on your profile menu in the top-right corner</li>
                          <li>Select "Account Settings" from the dropdown</li>
                          <li>Navigate to the "Seller Information" tab</li>
                          <li>Click "Become a Seller" button</li>
                          <li>Complete your business information:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Business name or your name as individual seller</li>
                              <li>Business address for shipping and tax purposes</li>
                              <li>Phone number for customer service</li>
                              <li>Tax ID or SSN for tax reporting</li>
                            </ul>
                          </li>
                          <li>Verify your identity with required documentation</li>
                          <li>Set up your payment method for receiving payments</li>
                          <li>Review and accept the Seller Agreement</li>
                          <li>Wait for account approval (typically 1-2 business days)</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="adding-products">
                      <AccordionTrigger className="text-left" data-testid="accordion-adding-products">
                        <Upload className="h-4 w-4 mr-2" />
                        Step 2: Adding Your First Product
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Go to your Seller Dashboard (Profile menu → "Seller Dashboard")</li>
                          <li>Click "Add New Product" button</li>
                          <li>Fill in product details:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li><strong>Product Title:</strong> Clear, descriptive name (60 characters max)</li>
                              <li><strong>Description:</strong> Detailed product information, features, and benefits</li>
                              <li><strong>Category:</strong> Select the most appropriate category and subcategory</li>
                              <li><strong>Price:</strong> Enter your selling price in USD</li>
                              <li><strong>Original Price:</strong> Optional - for showing discounts</li>
                              <li><strong>Stock Quantity:</strong> How many units you have available</li>
                              <li><strong>SKU:</strong> Your internal product code (optional but recommended)</li>
                            </ul>
                          </li>
                          <li>Upload product images:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Upload at least 3 high-quality images</li>
                              <li>First image will be the main product photo</li>
                              <li>Images should be at least 1000x1000 pixels</li>
                              <li>Show different angles and use cases</li>
                            </ul>
                          </li>
                          <li>Set product specifications:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Weight and dimensions for shipping calculations</li>
                              <li>Material, color, size options if applicable</li>
                              <li>Warranty information</li>
                              <li>Care instructions</li>
                            </ul>
                          </li>
                          <li>Configure shipping settings:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Choose shipping methods you offer</li>
                              <li>Set handling time (1-5 business days)</li>
                              <li>Add shipping costs or offer free shipping</li>
                            </ul>
                          </li>
                          <li>Review your listing preview</li>
                          <li>Click "Publish Product" to make it live</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="managing-inventory">
                      <AccordionTrigger className="text-left" data-testid="accordion-managing-inventory">
                        <FileText className="h-4 w-4 mr-2" />
                        Step 3: Managing Your Inventory
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Updating Stock Levels:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Go to Seller Dashboard → "Manage Products"</li>
                              <li>Find your product and click "Edit"</li>
                              <li>Update the "Stock Quantity" field</li>
                              <li>Click "Save Changes"</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Bulk Import/Export:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>In Seller Dashboard, click "Bulk Actions"</li>
                              <li>Download the CSV template</li>
                              <li>Fill in your products data in the template</li>
                              <li>Upload the completed CSV file</li>
                              <li>Review the preview and click "Import Products"</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Managing Orders:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Check "Orders" section daily for new orders</li>
                              <li>Print shipping labels from your dashboard</li>
                              <li>Update tracking information when shipped</li>
                              <li>Respond to customer messages within 24 hours</li>
                            </ol>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Event Creation Guide */}
            <section id="event-guide">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Calendar className="h-6 w-6 mr-3 text-amazon-orange" />
                    How to Create and Manage Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="creating-event">
                      <AccordionTrigger className="text-left" data-testid="accordion-creating-event">
                        <Calendar className="h-4 w-4 mr-2" />
                        Step 1: Creating Your First Event
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Navigate to the Events page (Main menu → "Events")</li>
                          <li>Click "Create Event" button in the top-right</li>
                          <li>Fill in basic event information:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li><strong>Event Title:</strong> Clear, engaging name for your event</li>
                              <li><strong>Description:</strong> Detailed information about what attendees can expect</li>
                              <li><strong>Category:</strong> Select appropriate category (Business, Entertainment, Education, etc.)</li>
                              <li><strong>Event Type:</strong> In-person, Virtual, or Hybrid</li>
                            </ul>
                          </li>
                          <li>Set date and time:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Choose start date and time</li>
                              <li>Set end date and time</li>
                              <li>Specify timezone</li>
                              <li>Note if this is a recurring event</li>
                            </ul>
                          </li>
                          <li>Add location details:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Enter venue name</li>
                              <li>Full street address</li>
                              <li>City, state, and zip code</li>
                              <li>Special instructions for finding the venue</li>
                            </ul>
                          </li>
                          <li>Set pricing and capacity:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Choose "Free" or set ticket price</li>
                              <li>Set maximum capacity</li>
                              <li>Enable/disable registration requirements</li>
                            </ul>
                          </li>
                          <li>Upload event image (recommended 1200x630 pixels)</li>
                          <li>Add website or ticket URL if applicable</li>
                          <li>Review your event preview</li>
                          <li>Click "Publish Event" to make it live</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="promoting-event">
                      <AccordionTrigger className="text-left" data-testid="accordion-promoting-event">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Step 2: Promoting Your Event
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Organic Promotion (Free):</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Your event appears in local search results automatically</li>
                              <li>Share the event link on social media</li>
                              <li>Add event details to your business website</li>
                              <li>Email your customer list</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Paid Promotion Options:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li><strong>City Wide ($19.99):</strong> Reach 10K-50K in your city</li>
                              <li><strong>Metro Area ($39.99):</strong> 100K-500K across metro area</li>
                              <li><strong>State Wide ($79.99):</strong> 1M-10M statewide reach</li>
                              <li><strong>Nation Wide ($149.99):</strong> 50M+ nationwide</li>
                              <li><strong>International ($299.99):</strong> Global reach of 500M+</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">To Purchase Promotion:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Go to your Events Dashboard</li>
                              <li>Find your event and click "Promote"</li>
                              <li>Select your desired promotion tier</li>
                              <li>Complete payment to activate promotion</li>
                              <li>Track performance in your analytics dashboard</li>
                            </ol>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="managing-registrations">
                      <AccordionTrigger className="text-left" data-testid="accordion-managing-registrations">
                        <Users className="h-4 w-4 mr-2" />
                        Step 3: Managing Event Registrations
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Access your Events Dashboard from your profile menu</li>
                          <li>Click on your event to view details</li>
                          <li>Review registration data:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Total number of registrants</li>
                              <li>Registration timeline and trends</li>
                              <li>Attendee contact information</li>
                            </ul>
                          </li>
                          <li>Export attendee list:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Click "Export Attendees" button</li>
                              <li>Download CSV file with all registrant data</li>
                              <li>Use for check-in or follow-up communications</li>
                            </ul>
                          </li>
                          <li>Send updates to attendees:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Use "Message Attendees" feature</li>
                              <li>Send reminders, updates, or special offers</li>
                              <li>Track message delivery and engagement</li>
                            </ul>
                          </li>
                          <li>Monitor event performance analytics</li>
                          <li>Collect feedback after the event concludes</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Navigation Guide */}
            <section id="navigation-guide">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Navigation className="h-6 w-6 mr-3 text-amazon-orange" />
                    Complete Site Navigation Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="main-navigation">
                      <AccordionTrigger className="text-left" data-testid="accordion-main-navigation">
                        <Navigation className="h-4 w-4 mr-2" />
                        Main Navigation Areas
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Header Navigation:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li><strong>Logo/Home:</strong> Click to return to homepage</li>
                              <li><strong>Search Bar:</strong> Search products, services, or events</li>
                              <li><strong>Voice Search:</strong> Click microphone icon for voice search</li>
                              <li><strong>Location:</strong> Shows current location, click to change</li>
                              <li><strong>"All" Menu:</strong> Browse all categories and subcategories</li>
                              <li><strong>Events Link:</strong> Access local events and create new ones</li>
                              <li><strong>Account Menu:</strong> Profile, orders, settings, seller dashboard</li>
                              <li><strong>Cart Icon:</strong> View items and checkout</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Search Functionality:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Type product names, brands, or keywords</li>
                              <li>Use category dropdown to filter results</li>
                              <li>Click search icon or press Enter to search</li>
                              <li>Use filters on results page to narrow down options</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="account-areas">
                      <AccordionTrigger className="text-left" data-testid="accordion-account-areas">
                        <User className="h-4 w-4 mr-2" />
                        Account & Profile Areas
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Profile Menu Options:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li><strong>Your Account:</strong> View and edit profile information</li>
                              <li><strong>Your Orders:</strong> Track current and past orders</li>
                              <li><strong>Your Reviews:</strong> Manage reviews you've written</li>
                              <li><strong>Wishlist:</strong> View saved items</li>
                              <li><strong>Address Book:</strong> Manage shipping addresses</li>
                              <li><strong>Payment Methods:</strong> Add/edit credit cards and payment options</li>
                              <li><strong>Seller Dashboard:</strong> Available for sellers only</li>
                              <li><strong>Account Settings:</strong> Privacy, notifications, preferences</li>
                              <li><strong>Sign Out:</strong> Log out of your account</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Shopping Cart Functions:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>View all added items</li>
                              <li>Adjust quantities or remove items</li>
                              <li>Save items for later</li>
                              <li>Apply promo codes or coupons</li>
                              <li>Proceed to secure checkout</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="mobile-navigation">
                      <AccordionTrigger className="text-left" data-testid="accordion-mobile-navigation">
                        <Navigation className="h-4 w-4 mr-2" />
                        Mobile Navigation
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Mobile Menu Access:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Tap the hamburger menu (three lines) in top-left</li>
                              <li>Access all main navigation options</li>
                              <li>Use search bar at the top</li>
                              <li>Swipe gestures for browsing products</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Mobile-Specific Features:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Touch-optimized buttons and links</li>
                              <li>Swipe through product images</li>
                              <li>GPS location detection</li>
                              <li>Camera integration for visual search</li>
                              <li>Push notifications for orders and deals</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Account Setup Guide */}
            <section id="account-guide">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <UserCheck className="h-6 w-6 mr-3 text-amazon-orange" />
                    Account Setup and Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="creating-account">
                      <AccordionTrigger className="text-left" data-testid="accordion-creating-account">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Creating Your Account
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Click "Sign In" in the top-right corner</li>
                          <li>Click "Create Account" on the sign-in page</li>
                          <li>Choose your account type:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li><strong>Buyer Account:</strong> For shopping and purchasing</li>
                              <li><strong>Seller Account:</strong> To sell products and services</li>
                              <li><strong>Both:</strong> Full marketplace access</li>
                            </ul>
                          </li>
                          <li>Fill in required information:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>First and last name</li>
                              <li>Valid email address</li>
                              <li>Strong password (8+ characters, mixed case, numbers)</li>
                              <li>Phone number for verification</li>
                            </ul>
                          </li>
                          <li>Verify your email address via confirmation link</li>
                          <li>Complete your profile with additional information</li>
                          <li>Set up two-factor authentication (recommended)</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="profile-setup">
                      <AccordionTrigger className="text-left" data-testid="accordion-profile-setup">
                        <Camera className="h-4 w-4 mr-2" />
                        Completing Your Profile
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Go to Account Settings → Profile Information</li>
                          <li>Upload a profile picture:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Click "Upload Photo"</li>
                              <li>Choose a clear, professional image</li>
                              <li>Crop to fit the circular frame</li>
                              <li>Save changes</li>
                            </ul>
                          </li>
                          <li>Add personal details:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Date of birth (for age verification)</li>
                              <li>Gender (optional)</li>
                              <li>Preferred language</li>
                              <li>Time zone</li>
                            </ul>
                          </li>
                          <li>Set up your address book:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Add your primary address</li>
                              <li>Include work or alternate addresses</li>
                              <li>Set a default shipping address</li>
                            </ul>
                          </li>
                          <li>Configure privacy settings:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Choose what information is public</li>
                              <li>Set review visibility preferences</li>
                              <li>Manage email notifications</li>
                            </ul>
                          </li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="security-setup">
                      <AccordionTrigger className="text-left" data-testid="accordion-security-setup">
                        <Settings className="h-4 w-4 mr-2" />
                        Security and Privacy Settings
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Two-Factor Authentication:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Go to Account Settings → Security</li>
                              <li>Click "Enable Two-Factor Authentication"</li>
                              <li>Choose your preferred method:
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  <li>SMS text messages</li>
                                  <li>Email codes</li>
                                  <li>Authenticator app (Google Authenticator, Authy)</li>
                                  <li>Backup codes for emergency access</li>
                                </ul>
                              </li>
                              <li>Follow setup instructions for your chosen method</li>
                              <li>Test the setup to ensure it works</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Password Management:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Use a strong, unique password</li>
                              <li>Change password regularly (every 3-6 months)</li>
                              <li>Never share your password</li>
                              <li>Use the "Change Password" feature if compromised</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Privacy Controls:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Review who can see your profile information</li>
                              <li>Control review and rating visibility</li>
                              <li>Manage email and notification preferences</li>
                              <li>Set location sharing permissions</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Advanced Features Guide */}
            <section id="advanced-guide">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Settings className="h-6 w-6 mr-3 text-amazon-orange" />
                    Advanced Features and Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="location-services">
                      <AccordionTrigger className="text-left" data-testid="accordion-location-services">
                        <MapPin className="h-4 w-4 mr-2" />
                        Location Services and Preferences
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Setting Your Location:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Click on the location display in the header</li>
                              <li>Choose from three options:
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  <li><strong>Account Address:</strong> Use your default shipping address</li>
                                  <li><strong>GPS Coordinates:</strong> Use device location (most accurate)</li>
                                  <li><strong>Manual Entry:</strong> Type in city/zip code</li>
                                </ul>
                              </li>
                              <li>Your choice is saved automatically for future visits</li>
                              <li>Change anytime by clicking the location display</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Location Benefits:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>See local products and services first</li>
                              <li>Discover nearby events and activities</li>
                              <li>Get accurate shipping estimates</li>
                              <li>Find "Shop Local" opportunities</li>
                              <li>Access location-specific deals</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="advanced-search">
                      <AccordionTrigger className="text-left" data-testid="accordion-advanced-search">
                        <Search className="h-4 w-4 mr-2" />
                        Advanced Search and Filtering
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Search Techniques:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li><strong>Keyword Search:</strong> Product names, brands, or descriptions</li>
                              <li><strong>Voice Search:</strong> Click microphone and speak your query</li>
                              <li><strong>Visual Search:</strong> Upload an image to find similar products</li>
                              <li><strong>Category Search:</strong> Use dropdown to search within categories</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Advanced Filters:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li><strong>Price Range:</strong> Set minimum and maximum prices</li>
                              <li><strong>Location:</strong> Distance from your location</li>
                              <li><strong>Condition:</strong> New, used, refurbished</li>
                              <li><strong>Seller Rating:</strong> Minimum seller rating</li>
                              <li><strong>Shipping:</strong> Free shipping, expedited delivery</li>
                              <li><strong>Brand:</strong> Filter by specific brands</li>
                              <li><strong>Features:</strong> Product-specific attributes</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Saved Searches:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Create a search with your desired filters</li>
                              <li>Click "Save This Search" on results page</li>
                              <li>Get notified when new items match your criteria</li>
                              <li>Manage saved searches in Account Settings</li>
                            </ol>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="payment-features">
                      <AccordionTrigger className="text-left" data-testid="accordion-payment-features">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment Methods and Features
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Accepted Payment Methods:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Major credit and debit cards (Visa, MasterCard, American Express)</li>
                              <li>PayPal and PayPal Credit</li>
                              <li>Digital wallets (Apple Pay, Google Pay)</li>
                              <li>Buy now, pay later options</li>
                              <li>Cryptocurrency payments (Bitcoin, Ethereum, and others)</li>
                              <li>Bank transfers for large purchases</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Setting Up Payment Methods:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Go to Account Settings → Payment Methods</li>
                              <li>Click "Add Payment Method"</li>
                              <li>Choose your payment type</li>
                              <li>Enter required information securely</li>
                              <li>Verify the payment method if required</li>
                              <li>Set a default payment method for faster checkout</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Cryptocurrency Payments:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>17 supported cryptocurrencies available</li>
                              <li>3.7% total fees (service + network + compliance)</li>
                              <li>Real-time conversion rates</li>
                              <li>Secure wallet integration</li>
                              <li>Transaction tracking and receipts</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rewards-program">
                      <AccordionTrigger className="text-left" data-testid="accordion-rewards-program">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Rewards and Loyalty Programs
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold mb-2">Durcheap Ultimate Rewards:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Earn points on every purchase</li>
                              <li>Bonus points for reviews and referrals</li>
                              <li>Exclusive member-only deals</li>
                              <li>Free expedited shipping</li>
                              <li>Early access to sales and events</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Referral Program:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Go to Account Settings → Referrals</li>
                              <li>Get your unique referral link</li>
                              <li>Share with friends and family</li>
                              <li>Both you and your referral get bonuses</li>
                              <li>Track your referral earnings</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Redeeming Rewards:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Points automatically convert to account credit</li>
                              <li>Apply rewards at checkout</li>
                              <li>Redeem for exclusive merchandise</li>
                              <li>Use for event ticket discounts</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Cryptocurrency Payment Guide */}
            <section id="crypto-guide">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <CreditCard className="h-6 w-6 mr-3 text-amazon-orange" />
                    How Do I Pay with Cryptocurrencies?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="crypto-overview">
                      <AccordionTrigger className="text-left" data-testid="accordion-crypto-overview">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Step 1: Understanding Cryptocurrency Payments
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-700">
                            Durcheap accepts 17 different cryptocurrencies for secure and fast payments. Our system supports major cryptocurrencies including Bitcoin, Ethereum, and stablecoins with transparent pricing.
                          </p>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2">Fee Structure:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li><strong>Service Fee:</strong> 1.5% of transaction amount</li>
                              <li><strong>Network/Exchange Fee:</strong> 1.7% for blockchain processing</li>
                              <li><strong>Compliance Fee:</strong> 0.5% for regulatory requirements</li>
                              <li><strong>Total Fee:</strong> 3.7% of your purchase amount</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2">Supported Cryptocurrencies:</h4>
                            <ul className="grid grid-cols-2 gap-1 list-disc list-inside text-xs">
                              <li>Bitcoin (BTC)</li>
                              <li>Ethereum (ETH)</li>
                              <li>XRP</li>
                              <li>USDC (Stablecoin)</li>
                              <li>USDT (Stablecoin)</li>
                              <li>Litecoin (LTC)</li>
                              <li>Bitcoin Cash (BCH)</li>
                              <li>Polygon (MATIC)</li>
                              <li>Chainlink (LINK)</li>
                              <li>And 8 more major coins</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="setting-up-crypto">
                      <AccordionTrigger className="text-left" data-testid="accordion-setting-up-crypto">
                        <Settings className="h-4 w-4 mr-2" />
                        Step 2: Setting Up Your Crypto Wallet
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-3 text-sm">
                          <li><strong>Choose a Compatible Wallet:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                              <li>Popular options: MetaMask, Coinbase Wallet, Trust Wallet</li>
                              <li>Hardware wallets: Ledger, Trezor (most secure)</li>
                              <li>Exchange wallets: Coinbase, Binance, Kraken</li>
                            </ul>
                          </li>
                          
                          <li><strong>Fund Your Wallet:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                              <li>Buy cryptocurrency from an exchange (Coinbase, Binance, Kraken)</li>
                              <li>Transfer crypto from another wallet</li>
                              <li>Ensure you have enough to cover purchase + 3.7% fees + network fees</li>
                            </ul>
                          </li>
                          
                          <li><strong>Verify Network Compatibility:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                              <li>Check that your wallet supports the crypto you want to use</li>
                              <li>Ensure you're on the correct blockchain network</li>
                              <li>Test with a small amount first if unsure</li>
                            </ul>
                          </li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="making-crypto-payment">
                      <AccordionTrigger className="text-left" data-testid="accordion-making-crypto-payment">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Step 3: Making a Cryptocurrency Payment
                      </AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal list-inside space-y-3 text-sm">
                          <li><strong>Add Items to Cart:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Browse products and add desired items to your shopping cart</li>
                              <li>Review quantities and pricing before checkout</li>
                            </ul>
                          </li>
                          
                          <li><strong>Proceed to Checkout:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Click "Checkout" from your cart page</li>
                              <li>Enter shipping address and contact information</li>
                            </ul>
                          </li>
                          
                          <li><strong>Select Cryptocurrency Payment:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Choose "Pay with Cryptocurrency" option</li>
                              <li>Select your preferred cryptocurrency from the list</li>
                              <li>Review the total amount including 3.7% processing fees</li>
                            </ul>
                          </li>
                          
                          <li><strong>Complete the Payment:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                              <li>You'll see a QR code and wallet address</li>
                              <li>Open your crypto wallet app</li>
                              <li>Scan the QR code OR copy the wallet address</li>
                              <li>Enter the exact amount shown (including decimals)</li>
                              <li>Confirm and send the payment</li>
                            </ul>
                          </li>
                          
                          <li><strong>Wait for Confirmation:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Transaction typically confirms within 10-60 minutes</li>
                              <li>You'll receive email notification when confirmed</li>
                              <li>Order will be processed once payment is verified</li>
                            </ul>
                          </li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="crypto-troubleshooting">
                      <AccordionTrigger className="text-left" data-testid="accordion-crypto-troubleshooting">
                        <Phone className="h-4 w-4 mr-2" />
                        Step 4: Troubleshooting Common Issues
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Payment Not Confirmed:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Check if you sent the exact amount requested (including decimals)</li>
                              <li>Verify you used the correct wallet address</li>
                              <li>Network congestion may cause delays (wait up to 2 hours)</li>
                              <li>Check your wallet for transaction status</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Sent Wrong Amount:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Contact customer support immediately with transaction ID</li>
                              <li>Overpayments can be refunded to your original wallet</li>
                              <li>Underpayments may require additional payment to complete order</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Technical Issues:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Ensure your wallet has sufficient balance for network fees</li>
                              <li>Try refreshing the checkout page if QR code doesn't display</li>
                              <li>Contact support if payment option doesn't appear at checkout</li>
                            </ul>
                          </div>
                          
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <p className="text-sm"><strong>Need Help?</strong> Contact our crypto payment support at <a href="mailto:crypto@durcheap.com" className="text-blue-600 hover:underline">crypto@durcheap.com</a> or call 1-800-DURCHEAP (1-800-387-2432) and mention "cryptocurrency payment" for immediate assistance.</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

          </div>
        </div>

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our customer service team is here to help 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-amazon-orange" />
                <div>
                  <p className="font-semibold">Phone: 954-937-5374</p>
                  <p className="text-sm text-gray-500">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amazon-orange" />
                <div>
                  <p className="font-semibold">Email: buyit@durcheap.com</p>
                  <p className="text-sm text-gray-500">Response within 24 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}