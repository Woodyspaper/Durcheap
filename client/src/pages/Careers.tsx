import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Briefcase, Heart, Trophy } from "lucide-react";

export default function Careers() {
  const jobOpenings = [
    {
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "Seattle, WA",
      type: "Full-time",
      description: "Build scalable systems that serve millions of customers worldwide."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Drive product strategy and execution for our marketplace platform."
    },
    {
      title: "UX Designer",
      department: "Design",
      location: "New York, NY",
      type: "Full-time",
      description: "Create intuitive and delightful user experiences for our customers."
    },
    {
      title: "Data Scientist",
      department: "Analytics",
      location: "Austin, TX",
      type: "Full-time",
      description: "Use data to drive insights and improve customer experience."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description: "Help our sellers succeed and grow their businesses on our platform."
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance plus wellness programs"
    },
    {
      icon: Trophy,
      title: "Growth & Development",
      description: "Learning stipend, mentorship programs, and career advancement opportunities"
    },
    {
      icon: Users,
      title: "Work-Life Balance",
      description: "Flexible work arrangements, unlimited PTO, and family-friendly policies"
    },
    {
      icon: Briefcase,
      title: "Financial Benefits",
      description: "Competitive salary, equity, 401(k) matching, and performance bonuses"
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amazon-dark mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build the future of commerce with us. We're looking for talented, passionate people who want to make a global impact.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amazon-dark mb-6 text-center">Why Work at Durcheap?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <IconComponent className="h-8 w-8 text-amazon-orange mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Job Openings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amazon-dark mb-6">Open Positions</h2>
          <div className="space-y-4">
            {jobOpenings.map((job, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-amazon-dark mb-2">{job.title}</h3>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {job.department}
                        </Badge>
                        <Badge variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      className="bg-amazon-orange hover:bg-amazon-orange/90 ml-4"
                      onClick={() => window.open(`mailto:careers@durcheap.com?subject=Application for ${job.title}&body=Dear Hiring Team,%0D%0A%0D%0AI am interested in applying for the ${job.title} position in ${job.department}.%0D%0A%0D%0APlease find my application details below:%0D%0A%0D%0ABest regards`, '_blank')}
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Our Hiring Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                <h4 className="font-semibold mb-2">Apply Online</h4>
                <p className="text-sm text-gray-600">Submit your application and resume through our careers portal</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                <h4 className="font-semibold mb-2">Phone Screen</h4>
                <p className="text-sm text-gray-600">Initial conversation with our recruiting team about the role</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                <h4 className="font-semibold mb-2">Interviews</h4>
                <p className="text-sm text-gray-600">Meet with team members and showcase your skills</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amazon-orange text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">4</div>
                <h4 className="font-semibold mb-2">Offer</h4>
                <p className="text-sm text-gray-600">Join our team and start making an impact</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-amazon-dark mb-4">Ready to Make an Impact?</h2>
            <p className="text-gray-600 mb-6">
              Don't see the perfect role? Send us your resume and tell us how you'd like to contribute to Durcheap's mission.
            </p>
            <Button 
              className="bg-amazon-orange hover:bg-amazon-orange/90"
              onClick={() => window.open('mailto:careers@durcheap.com?subject=Resume Submission&body=Dear Hiring Team,%0D%0A%0D%0AI am interested in joining the Durcheap team and would like to submit my resume for consideration.%0D%0A%0D%0APlease find my resume attached or I can provide it upon request.%0D%0A%0D%0ABest regards', '_blank')}
            >
              Send Us Your Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}