import { Item } from "@/types";
import { Card, CardHeader, Image, CardBody, Button } from "@heroui/react";

interface ProductCardProps {
	product: Item;
	handleAddToCart: (product: Item, buttonElement: HTMLElement) => void;
}

export default function ProductCard({ product, handleAddToCart }: ProductCardProps) {

	return (
		<Card key={product.id} className="hover:shadow-xl transition-shadow">
			<CardHeader className="p-0 flex justify-center items-center bg-default-100 min-h-[300px]">
				<Image
					src={product.imageUrl}
					alt={product.name}
					className="max-w-full max-h-[300px] object-contain"
				/>
			</CardHeader>
			<CardBody className="p-6">
				<h2 className="text-2xl font-semibold mb-3">{product.name}</h2>
				{product.category && (
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
						{product.category}
					</p>
				)}
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					{product.description}
				</p>
				<div className="flex justify-between items-center mt-4">
					<span className="text-3xl font-bold text-primary">
						${product.price.toFixed(2)}
					</span>
					<Button
						color="primary"
						onPress={() => handleAddToCart(product, document.activeElement as HTMLElement)}
					>
						Add to Cart
					</Button>
				</div>
			</CardBody>
		</Card>
	)
}