"use client";

import { Card, CardBody } from "@heroui/react";

export default function GoogleMap() {
  // University of Manitoba address
  const address = "University of Manitoba";
  const encodedAddress = encodeURIComponent(address);
  
  // Get Google Maps API key from environment variable
  // Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Google Maps Embed API URL
  // If no API key is provided, use a direct Google Maps link
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`
    : `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Find Us
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Visit us at University of Manitoba
        </p>
        <Card>
          <CardBody className="p-0">
            <div className="w-full h-[500px] rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapUrl}
                className="w-full h-full"
                title="Google Map - University of Manitoba"
              />
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                <strong className="text-gray-900 dark:text-white">Address:</strong> {address}
              </p>
              {!apiKey && (
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
                  Note: Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local for better map experience
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
