"use client";

import { Card, CardBody, Button } from "@nextui-org/react";

interface NotFoundCardProps {
  message: string;
  backLabel: string;
  onBack: () => void;
}

export default function NotFoundCard({ message, backLabel, onBack }: NotFoundCardProps) {
  return (
    <Card>
      <CardBody className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {message}
        </p>
        <Button
          className="mt-4"
          color="default"
          variant="flat"
          onPress={onBack}
        >
          {backLabel}
        </Button>
      </CardBody>
    </Card>
  );
}
