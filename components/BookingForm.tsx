"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  DatePicker,
} from "@nextui-org/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api-config";

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const services = [
  "Consulting Services",
  "Technical Support",
  "Custom Solutions",
  "Training & Education",
];

interface BookingFormProps {
  onBookingSuccess?: () => void;
}

export default function BookingForm({ onBookingSuccess }: BookingFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: null as CalendarDate | null,
    time: "",
    service: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setErrorMessage("");

    // Validate form
    if (!formData.name || !formData.email || !formData.date || !formData.time || !formData.service) {
      setErrorMessage("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      // Format date for API
      const dateString = formData.date
        ? `${formData.date.year}-${String(formData.date.month).padStart(2, "0")}-${String(formData.date.day).padStart(2, "0")}`
        : "";

      const bookingData = {
        name: formData.name,
        email: formData.email,
        date: dateString,
        time: formData.time,
        service: formData.service,
        description: formData.description || "",
      };

      const response = await fetch(apiUrl("api/booking"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit booking");
      }

      // Success
      setSubmitMessage(data.message || "Booking request submitted successfully! We'll contact you soon.");
      setFormData({
        name: "",
        email: user?.email || "",
        date: null,
        time: "",
        service: "",
        description: "",
      });
      
      // Call success callback if provided
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit booking request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
        <Card>
          <CardHeader className="pb-4">
            <h3 className="text-2xl font-semibold">Book a Service</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  isRequired
                  fullWidth
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  isRequired
                  fullWidth
                  isReadOnly={!!user?.email}
                  description={user?.email ? "Email from your account" : undefined}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="Select Date"
                  value={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  isRequired
                  minValue={parseDate(new Date().toISOString().split("T")[0])}
                  className="w-full"
                />
                <Select
                  label="Select Time"
                  placeholder="Choose a time slot"
                  selectedKeys={formData.time ? [formData.time] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, time: selected });
                  }}
                  isRequired
                  fullWidth
                >
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Select
                label="Select Service"
                placeholder="Choose a service"
                selectedKeys={formData.service ? [formData.service] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({ ...formData, service: selected });
                }}
                isRequired
                fullWidth
              >
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </Select>

              <Textarea
                label="Description"
                placeholder="Tell us more about your requirements..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                minRows={4}
                fullWidth
              />

              {errorMessage && (
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                  <p className="text-danger-700 dark:text-danger-400">
                    {errorMessage}
                  </p>
                </div>
              )}

              {submitMessage && (
                <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                  <p className="text-success-700 dark:text-success-400">
                    {submitMessage}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                className="font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Booking Request"}
              </Button>
            </form>
          </CardBody>
        </Card>
  );
}
