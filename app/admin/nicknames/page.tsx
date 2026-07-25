// app/admin/nicknames/page.tsx

import { Suspense } from "react";
import { NicknameSearch } from "@/components/nicknames/nickname-search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NicknameList } from "@/components/nicknames/nickname-list";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Nicknames",
    description: "Search members by nickname and manage nicknames.",
};

export default function NicknamesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nicknames</h1>
                <p className="text-muted-foreground">
                    Search for members by their nickname, view their details, and manage nicknames.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Search Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Search by Nickname</CardTitle>
                        <CardDescription>
                            Type a nickname to find the member. Click on a result to go to their profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <NicknameSearch
                            placeholder="Search by nickname..."
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                {/* Quick Stats or Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>About Nicknames</CardTitle>
                        <CardDescription>
                            Nicknames are alternative names that members may be known by.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>• Each nickname must be unique across all members</p>
                        <p>• Nicknames can be 2-50 characters long</p>
                        <p>• Only letters, numbers, spaces, hyphens, and underscores are allowed</p>
                        <p>• Members can be searched by their nickname from anywhere in the app</p>
                    </CardContent>
                </Card>
            </div>

            {/* List all members with nicknames */}
            <div className="mt-6">
                <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading nicknames...</div>}>
                    <NicknameList />
                </Suspense>
            </div>
        </div>
    );
}