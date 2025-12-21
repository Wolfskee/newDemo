"use client";

import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import ServicesSection from "@/components/ServicesSection";
import GoogleMap from "@/components/GoogleMap";
import { Button } from "@heroui/react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProductsSection />
      <ServicesSection />
      <GoogleMap />
    </main>
  );
}
