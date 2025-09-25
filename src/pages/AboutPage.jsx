import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Users, Shield, Ticket, Clock, HelpCircle, Mail, MessageSquare, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const AboutPage = () => {
  const features = [
    {
      icon: <Ticket className="h-6 w-6 text-primary" />,
      title: "Secure Ticket Resale",
      description: "Buy and sell tickets with confidence using our verified resale platform."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "100% Buyer Protection",
      description: "Your purchase is protected with our secure payment system and verification process."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Last-Minute Deals",
      description: "Find great deals on tickets for sold-out events from trusted sellers."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Community Driven",
      description: "Join a community of event-goers who love great experiences at fair prices."
    }
  ];

  const faqs = [
    {
      question: "How does ticket resale work?",
      answer: "Sellers list their tickets on our platform, and buyers can purchase them directly. All tickets are verified for authenticity before the sale is completed."
    },
    {
      question: "Is it safe to buy resale tickets?",
      answer: "Yes! We verify all tickets and offer buyer protection to ensure you get valid tickets or your money back."
    },
    {
      question: "How do I sell my tickets?",
      answer: "Simply create a listing with your ticket details, set your price, and wait for a buyer. We handle the secure transaction process."
    },
    {
      question: "What if my event is canceled?",
      answer: "If an event is canceled, you'll receive a full refund according to our terms of service."
    }
  ];

  const team = [
    {
      name: "John Doe",
      role: "CEO & Founder",
      bio: "Passionate about creating seamless event experiences for everyone.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Jane Smith",
      role: "CTO",
      bio: "Technology enthusiast building secure and scalable platforms.",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Alex Johnson",
      role: "Head of Customer Success",
      bio: "Dedicated to ensuring our users have the best experience possible.",
      image: "https://randomuser.me/api/portraits/men/75.jpg"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our Platform</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're revolutionizing the way people buy and sell event tickets with a secure, transparent, and user-friendly platform.
        </p>
      </section>

      {/* Features */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="mb-20">
        <div className="bg-muted/50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="prose max-w-none">
            <p className="mb-4">
              Founded in 2023, our platform was born out of a simple idea: event tickets should be accessible to everyone at fair prices. 
              We noticed that too many great events were either sold out or had tickets being resold at outrageous prices, and we wanted to change that.
            </p>
            <p className="mb-4">
              Our mission is to create a transparent marketplace where fans can buy and sell tickets with confidence, knowing they're getting 
              a fair deal from trusted sellers. We've built our platform with security, transparency, and user experience at its core.
            </p>
            <p>
              Today, we're proud to serve thousands of event-goers across the country, helping them experience the events they love without 
              breaking the bank or worrying about ticket authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="text-center overflow-hidden">
              <div className="h-64 bg-gray-200 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <Tabs defaultValue="general" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="buying">Buying Tickets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="buying" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">How do I know the tickets are valid?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">All tickets listed on our platform go through a verification process to ensure their validity. We work with event organizers and use advanced verification techniques to confirm each ticket's authenticity before it's listed for sale.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We accept all major credit and debit cards, as well as popular digital payment methods. All transactions are processed securely through our payment partners.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Can I get a refund if I can't attend?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Refund policies vary by event and seller. You can check the specific refund policy for each ticket listing before making a purchase. If you need to cancel, you may be able to resell your tickets on our platform.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Contact & Support */}
      <section className="bg-muted/50 p-8 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our customer support team is here to help you with any questions or issues you might have.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Live Chat
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Us
            </Button>
            <Button variant="outline" className="gap-2">
              <Phone className="h-4 w-4" />
              Call Support
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Our support team is available 24/7 to assist you with any questions or concerns.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of event-goers who trust our platform for their ticket needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/explore">Browse Events</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/contact">Contact Sales</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
