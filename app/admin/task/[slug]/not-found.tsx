// app/admin/task/[slug]/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-[80vh] p-6">
            <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center gap-6 pt-10 pb-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Task Not Found</h1>
                        <p className="text-sm text-muted-foreground">
                            The task you're looking for doesn't exist or has been deleted.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/admin/task">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Tasks
                            </Link>
                        </Button>
                        <Button asChild className="flex-1">
                            <Link href="/admin">
                                <Home className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}