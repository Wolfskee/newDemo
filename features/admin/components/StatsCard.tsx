"use client";

import { Card, CardBody } from "@heroui/react";

interface StatsCardProps {
  label: string;
  value: string;
  color: string;
}

export default function StatsCard({ label, value, color }: StatsCardProps) {
  return (
    <Card>
      <CardBody>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {label}
        </p>
        <p className={`text-3xl font-bold text-${color} mt-2`}>
          {value}
        </p>
      </CardBody>
    </Card>
  );
}
