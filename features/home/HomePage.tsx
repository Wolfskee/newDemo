"use client";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import ServicesSection from "@/components/ServicesSection";
import GoogleMap from "@/components/GoogleMap";
import BookingCalendar from "@/components/BookingCalendar";
import { useHomePageLogic } from "./hooks/useHomePageLogic";

export default function HomePage() {
  const {
    allAppointments,
    fullyBookedDates,
    loading, // Not currently used directly in UI but available
    availableTimeSlotsByDate,
    timeSlots,
    handleDateClick
  } = useHomePageLogic();



  return (
    <main className="min-h-screen">
      <Hero />
      <ProductsSection />
      <ServicesSection />

      {/* Booking Calendar Section */}
      <div id="booking-calendar" className="py-12 px-4 bg-gray-50 dark:bg-gray-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Book an Appointment
          </h2>
          <BookingCalendar
            appointments={allAppointments}
            fullyBookedDates={fullyBookedDates}
            onDateClick={handleDateClick}
            showDetails={false}
            availableTimeSlotsByDate={availableTimeSlotsByDate}
            timeSlots={timeSlots}
          />
        </div>
      </div>

      <GoogleMap />
    </main>
  );
}
