import { Card, CardHeader, Skeleton } from "@heroui/react";

export default function ServicesLoadingSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, index) => (
                        <Card key={index} className="space-y-5 p-4" radius="lg">
                            <CardHeader className="p-0">
                                <Skeleton className="rounded-lg">
                                    <div className="h-60 rounded-lg bg-default-300"></div>
                                </Skeleton>
                            </CardHeader>
                            <div className="space-y-3">
                                <Skeleton className="w-3/5 rounded-lg">
                                    <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                                </Skeleton>
                                <Skeleton className="w-4/5 rounded-lg">
                                    <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                                </Skeleton>
                                <Skeleton className="w-2/5 rounded-lg">
                                    <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
                                </Skeleton>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
