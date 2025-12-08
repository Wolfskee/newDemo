import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import ServicesSection from "@/components/ServicesSection";
import GoogleMap from "@/components/GoogleMap";

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
