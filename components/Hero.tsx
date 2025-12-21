"use client";

import { Button } from "@heroui/react";
import NextLink from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome to Our Company
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8">
          Discover our premium products and exceptional services designed to
          meet your needs
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            as={NextLink}
            href="/products"
            color="primary"
            size="lg"
            variant="solid"
          >
            Explore Products
          </Button>
          <Button
            as={NextLink}
            href="/services"
            color="secondary"
            size="lg"
            variant="bordered"
          >
            View Services
          </Button>
        </div>
      </div>
    </section>
  );
}
