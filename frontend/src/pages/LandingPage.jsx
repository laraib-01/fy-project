import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, Spacer } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="hero-gradient py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground-900">
                Streamline School-Parent Communication with EduConnect
              </h1>
              <p className="text-xl text-foreground-600 max-w-lg">
                Replace informal tools with a structured platform for sharing
                student performance, attendance, and school events.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  as={Link}
                  to="/register"
                  color="primary"
                  size="lg"
                  className="font-medium"
                >
                  Get Started
                </Button>
                <Button
                  as={Link}
                  to="/pricing"
                  variant="flat"
                  size="lg"
                  className="font-medium"
                >
                  View Pricing
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <img
                src="https://img.heroui.chat/image/dashboard?w=600&h=400&u=educonnect"
                alt="EduConnect Dashboard Preview"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 md:px-6 lg:px-8 bg-content1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground-900">
              Features Designed for Schools
            </h2>
            <p className="mt-4 text-lg text-foreground-600 max-w-2xl mx-auto">
              EduConnect provides everything schools need to maintain effective
              communication between teachers and parents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card transition-all duration-300"
              >
                <CardBody className="p-6">
                  <div className="bg-primary-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <Icon
                      icon={feature.icon}
                      className="text-primary text-2xl"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-600">{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground-900">
              How EduConnect Works
            </h2>
            <p className="mt-4 text-lg text-foreground-600 max-w-2xl mx-auto">
              Our platform is designed to be intuitive and easy to use for
              schools, teachers, and parents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-xl font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-foreground-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="about" className="py-20 px-4 md:px-6 lg:px-8 bg-content2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground-900">
              What Schools Say About Us
            </h2>
            <p className="mt-4 text-lg text-foreground-600 max-w-2xl mx-auto">
              Schools across the country are transforming their communication
              with EduConnect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-content1">
                <CardBody className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-foreground-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground-700 italic">
                    "{testimonial.quote}"
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 md:px-6 lg:px-8 bg-primary-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground-900 mb-4">
            Ready to Transform School Communication?
          </h2>
          <p className="text-lg text-foreground-700 mb-8 max-w-2xl mx-auto">
            Join hundreds of schools that have improved parent-teacher
            communication with EduConnect's subscription-based platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              as={Link}
              to="/register"
              color="primary"
              size="lg"
              className="font-medium"
            >
              Start Free Trial
            </Button>
            <Button
              as={Link}
              to="/pricing"
              variant="flat"
              size="lg"
              className="font-medium"
            >
              View Pricing Plans
            </Button>
          </div>
        </div>
      </div>

      <Spacer y={8} />
      <Footer />
    </div>
  );
};

// Data
const features = [
  {
    title: "Role-Based Dashboards",
    description:
      "Separate interfaces for teachers and parents with tailored functionality for each user type.",
    icon: "lucide:layout-dashboard",
  },
  {
    title: "Student Performance Tracking",
    description:
      "Share grades, assessments, and progress reports with parents in real-time.",
    icon: "lucide:bar-chart-2",
  },
  {
    title: "Attendance Management",
    description:
      "Record and notify parents about student attendance and absences automatically.",
    icon: "lucide:calendar-check",
  },
  {
    title: "Event Calendar",
    description:
      "Share school events, holidays, and important dates with the entire school community.",
    icon: "lucide:calendar",
  },
  {
    title: "Announcements & Notices",
    description:
      "Broadcast important information to specific classes or the entire school.",
    icon: "lucide:megaphone",
  },
  {
    title: "Subscription Management",
    description:
      "Flexible monthly and annual subscription options for schools of all sizes.",
    icon: "lucide:credit-card",
  },
];

const steps = [
  {
    title: "School Registration",
    description:
      "Schools register and select a subscription plan that fits their needs and budget.",
  },
  {
    title: "User Setup",
    description:
      "Administrators add teachers and parents to the system with appropriate role-based access.",
  },
  {
    title: "Daily Communication",
    description:
      "Teachers share updates, parents stay informed, and everyone benefits from improved communication.",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Principal, Westview Elementary",
    quote:
      "EduConnect has transformed how our teachers communicate with parents. The structured approach has increased parent engagement by over 60%.",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
  },
  {
    name: "Michael Rodriguez",
    role: "IT Director, Lincoln High School",
    quote:
      "The subscription model is cost-effective and the platform is incredibly easy to deploy. Our teachers needed minimal training to get started.",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=2",
  },
  {
    name: "Priya Patel",
    role: "Teacher, Oakridge Academy",
    quote:
      "I save hours each week that I used to spend on WhatsApp messages. Parents appreciate the organized information and timely updates.",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=3",
  },
];
