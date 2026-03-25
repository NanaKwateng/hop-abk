// components/docs/mobile-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setOpen(false)}
                >
                    <Command className="h-4 w-4" />
                    <span className="font-bold">shadcn/ui</span>
                </Link>
                <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                    <div className="flex flex-col space-y-3">
                        {/* Top links */}
                        <Link
                            href="/docs/introduction"
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground"
                        >
                            Documentation
                        </Link>
                        <Link
                            href="/docs/button"
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground"
                        >
                            Components
                        </Link>
                        <Link
                            href="/docs/theming"
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground"
                        >
                            Themes
                        </Link>
                    </div>
                    <div className="flex flex-col space-y-2 pt-6">
                        {navigation.map((category) => (
                            <div key={category.title} className="flex flex-col space-y-3 pt-6">
                                <h4 className="font-medium">{category.title}</h4>
                                {category.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "text-muted-foreground",
                                            pathname === item.href && "text-foreground font-medium"
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}