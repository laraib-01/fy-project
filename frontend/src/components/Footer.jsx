import React from "react";
import { Link } from "react-router-dom";
import { Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

export const Footer = () => {
  return (
    <footer className="bg-content1 border-t border-divider">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Icon icon="lucide:book-open" className="text-primary text-2xl" />
              <span className="font-bold text-xl">EduConnect</span>
            </Link>
            <p className="text-foreground-600 mb-4">
              Streamlining communication between schools, teachers, and parents.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-foreground-500 hover:text-primary transition-colors"
              >
                <Icon icon="lucide:facebook" className="text-xl" />
              </a>
              <a
                href="#"
                className="text-foreground-500 hover:text-primary transition-colors"
              >
                <Icon icon="lucide:twitter" className="text-xl" />
              </a>
              <a
                href="#"
                className="text-foreground-500 hover:text-primary transition-colors"
              >
                <Icon icon="lucide:instagram" className="text-xl" />
              </a>
              <a
                href="#"
                className="text-foreground-500 hover:text-primary transition-colors"
              >
                <Icon icon="lucide:linkedin" className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="text-foreground-600 hover:text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-foreground-600 hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/testimonials"
                  className="text-foreground-600 hover:text-primary"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-foreground-600 hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-foreground-600 hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-foreground-600 hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-foreground-600 hover:text-primary"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-foreground-600 hover:text-primary"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-foreground-600 hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-foreground-600 hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="text-foreground-600 hover:text-primary"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  to="/gdpr"
                  className="text-foreground-600 hover:text-primary"
                >
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Divider className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-foreground-500 text-sm">
            &copy; {new Date().getFullYear()} EduConnect. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/terms"
              className="text-foreground-500 hover:text-primary text-sm"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-foreground-500 hover:text-primary text-sm"
            >
              Privacy
            </Link>
            <Link
              to="/cookies"
              className="text-foreground-500 hover:text-primary text-sm"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
