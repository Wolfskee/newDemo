"use client";

import { usePathname } from "next/navigation";
import { Link } from "@heroui/react";
import NextLink from "next/link";

export default function Footer() {
  const pathname = usePathname();

  // Don't show footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Our Company</h3>
            <p className="text-gray-400 mb-4">
              Providing premium products and exceptional services to meet your needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  as={NextLink}
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  as={NextLink}
                  href="/products"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  as={NextLink}
                  href="/services"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-start">
                <span className="mr-2">📍</span>
                <span>123 Business Street, Suite 100, City, State 12345, USA</span>
              </p>
              <p className="flex items-center">
                <span className="mr-2">📞</span>
                <a
                  href="tel:+1234567890"
                  className="hover:text-white transition-colors"
                >
                  +1 (234) 567-8900
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} CodeAnchor Team. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
