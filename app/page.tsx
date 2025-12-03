import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import ServicesSection from "@/components/ServicesSection";
import BookingForm from "@/components/BookingForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProductsSection />
      <ServicesSection />
      <BookingForm />
    </main>
  );
}
