import { Button } from "@heroui/react";

interface ProductsErrorProps {
    message: string;
    onRetry?: () => void;
}

export default function ProductsError({ message, onRetry }: ProductsErrorProps) {
    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 flex flex-col items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Products</h2>
                <p className="text-gray-400 mb-6 max-w-md">{message}</p>
                {onRetry && (
                    <Button
                        color="primary"
                        variant="flat"
                        onPress={onRetry}
                    >
                        Try Again
                    </Button>
                )}
            </div>
        </div>
    );
}
