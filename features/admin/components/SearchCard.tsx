"use client";

import { Card, CardBody } from "@heroui/react";
import { Input } from "@heroui/react";

interface SearchCardProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchCard({ placeholder, value, onChange, className = "mb-6" }: SearchCardProps) {
  return (
    <Card className={className}>
      <CardBody>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          startContent={<span className="text-gray-400">🔍</span>}
          fullWidth
        />
      </CardBody>
    </Card>
  );
}
