import { Button } from "@heroui/react";

interface ServicesErrorProps {
    message: string;
    onRetry?: () => void;
}

export default function ServicesError({ message, onRetry }: ServicesErrorProps) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 flex flex-col items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Products</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">{message}</p>
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
