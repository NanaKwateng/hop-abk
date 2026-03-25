// components/users/testimonials/testimonials-view.tsx
"use client";

import { useState, useTransition } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    FileText,
    Plus,
    Trash2,
    Download,
    FileDown,
    Calendar,
    Tag,
} from "lucide-react";
import { deleteTestimonial } from "@/actions/testimonials";
import { toast } from "sonner";
import { AddTestimonialSheet } from "./add-testimonial-sheet";
import { exportTestimonialsPDF } from "./export-pdf";
import { exportTestimonialsWord } from "./export-word";
import type { Testimonial } from "@/lib/types/testimonials";

interface TestimonialsViewProps {
    memberId: string;
    memberName: string;
    initialTestimonials: Testimonial[];
}

export function TestimonialsView({
    memberId,
    memberName,
    initialTestimonials,
}: TestimonialsViewProps) {
    const [testimonials, setTestimonials] =
        useState<Testimonial[]>(initialTestimonials);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleAdded(newItem: Testimonial) {
        setTestimonials((prev) => [newItem, ...prev]);
    }

    async function handleDelete() {
        if (!deleteId) return;

        startTransition(async () => {
            try {
                await deleteTestimonial(deleteId, memberId);
                setTestimonials((prev) =>
                    prev.filter((t) => t.id !== deleteId)
                );
                toast.success("Testimonial deleted");
            } catch (error: any) {
                toast.error("Failed to delete", {
                    description: error.message,
                });
            } finally {
                setDeleteId(null);
            }
        });
    }

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    }

    const categoryColors: Record<string, string> = {
        testimonial: "bg-blue-500/10 text-blue-600",
        duty: "bg-purple-500/10 text-purple-600",
        achievement: "bg-green-500/10 text-green-600",
        other: "bg-gray-500/10 text-gray-600",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Testimonials & Records
                            </CardTitle>
                            <CardDescription>
                                Special duties, testimonials, and achievements
                                for {memberName}.
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            {testimonials.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            exportTestimonialsPDF(
                                                memberName,
                                                testimonials
                                            )
                                        }
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            exportTestimonialsWord(
                                                memberName,
                                                testimonials
                                            )
                                        }
                                    >
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Word
                                    </Button>
                                </>
                            )}

                            <AddTestimonialSheet
                                memberId={memberId}
                                onAdded={handleAdded}
                            />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Testimonial list */}
            {testimonials.length > 0 ? (
                <div className="space-y-4">
                    {testimonials.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold">
                                                {item.title}
                                            </h3>
                                            {item.category && (
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        categoryColors[
                                                        item.category
                                                        ] ?? categoryColors.other
                                                    }
                                                >
                                                    <Tag className="mr-1 h-3 w-3" />
                                                    {item.category}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                            {item.content}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            {item.eventDate && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(item.eventDate)}
                                                </span>
                                            )}
                                            {item.createdAt && (
                                                <span>
                                                    Added{" "}
                                                    {formatDate(item.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive shrink-0"
                                        onClick={() => setDeleteId(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
                        <FileText className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                            No testimonials or records yet.
                        </p>
                        <AddTestimonialSheet
                            memberId={memberId}
                            onAdded={handleAdded}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Delete dialog */}
            <AlertDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete this testimonial?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this record. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}