import { Service } from "@/types";
import { Card, CardHeader, Image, CardBody, Button } from "@heroui/react";

interface ServicesCardProps {
	service: Service;
	handleBookNow: (service: Service) => void;
}

export default function ServicesCard({ service, handleBookNow }: ServicesCardProps) {

	return (
		<Card key={service.id} className="hover:shadow-xl transition-shadow">
			<CardHeader className="p-0">
				<Image
					src={service.imageUrl}
					alt={service.name}
					width="100%"
					height={300}
					className="object-cover"
				/>
			</CardHeader>
			<CardBody className="p-6">
				<h2 className="text-2xl font-semibold mb-3">{service.name}</h2>
				{service.category && (
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
						{service.category}
					</p>
				)}
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					{service.description}
				</p>
				<div className="flex justify-between items-center mt-4">
					<span className="text-3xl font-bold text-primary">
						${service.price.toFixed(2)}
					</span>
					<Button
						color="primary"
						onPress={() => handleBookNow(service)}
					>
						Add to Cart
					</Button>
				</div>
			</CardBody>
		</Card>
	)
}