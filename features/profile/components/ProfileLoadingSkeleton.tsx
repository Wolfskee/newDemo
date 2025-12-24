import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react";

export default function ProfileLoadingSkeleton() {
    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Skeleton className="rounded-lg mb-8">
                    <div className="h-10 w-48 rounded-lg bg-default-300"></div>
                </Skeleton>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="md:col-span-1">
                        <CardBody className="items-center pt-8 pb-6">
                            <Skeleton className="rounded-full mb-4">
                                <div className="w-24 h-24 rounded-full bg-default-300"></div>
                            </Skeleton>
                            <Skeleton className="w-32 h-6 rounded-lg mb-2">
                                <div className="h-6 w-32 rounded-lg bg-default-200"></div>
                            </Skeleton>
                            <Skeleton className="w-20 h-4 rounded-lg">
                                <div className="h-4 w-20 rounded-lg bg-default-200"></div>
                            </Skeleton>
                        </CardBody>
                    </Card>
                    
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <Skeleton className="w-48 h-8 rounded-lg">
                                <div className="h-8 w-48 rounded-lg bg-default-300"></div>
                            </Skeleton>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Skeleton className="w-full h-16 rounded-lg">
                                <div className="h-16 w-full rounded-lg bg-default-200"></div>
                            </Skeleton>
                            <Skeleton className="w-full h-16 rounded-lg">
                                <div className="h-16 w-full rounded-lg bg-default-200"></div>
                            </Skeleton>
                            <Skeleton className="w-full h-10 rounded-lg mt-4">
                                <div className="h-10 w-full rounded-lg bg-default-300"></div>
                            </Skeleton>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
