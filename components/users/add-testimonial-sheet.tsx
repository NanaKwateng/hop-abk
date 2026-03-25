// components/users/testimonials/add-testimonial-sheet.tsx
"use client";

import { useState, useTransition } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createTestimonial } from "@/actions/testimonials";
import { toast } from "sonner";
import type { Testimonial, TestimonialCategory } from "@/lib/types/testimonials";

interface AddTestimonialSheetProps {
    memberId: string;
    onAdded: (testimonial: Testimonial) => void;
}

export function AddTestimonialSheet({
    memberId,
    onAdded,
}: AddTestimonialSheetProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<TestimonialCategory>("testimonial");
    const [eventDate, setEventDate] = useState("");
    const [isPending, startTransition] = useTransition();

    function resetForm() {
        setTitle("");
        setContent("");
        setCategory("testimonial");
        setEventDate("");
    }

    function handleSubmit() {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!content.trim()) {
            toast.error("Content is required");
            return;
        }

        startTransition(async () => {
            try {
                const result = await createTestimonial(memberId, {
                    title: title.trim(),
                    content: content.trim(),
                    category,
                    eventDate: eventDate || undefined,
                });

                onAdded(result);
                resetForm();
                setOpen(false);
                toast.success("Testimonial added");
            } catch (error: any) {
                toast.error("Failed to add testimonial", {
                    description: error.message,
                });
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Testimonial
                </Button>
            </SheetTrigger>

            <SheetContent className="overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Add Testimonial</SheetTitle>
                    <SheetDescription>
                        Record a testimonial, special duty, or achievement for
                        this member.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Led Sunday School Program"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={category}
                            onValueChange={(v) =>
                                setCategory(v as TestimonialCategory)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="testimonial">
                                    Testimonial
                                </SelectItem>
                                <SelectItem value="duty">
                                    Special Duty
                                </SelectItem>
                                <SelectItem value="achievement">
                                    Achievement
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eventDate">
                            Date (Optional)
                        </Label>
                        <Input
                            id="eventDate"
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Details</Label>
                        <Textarea
                            id="content"
                            placeholder="Describe the testimonial, duty, or achievement in detail..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[150px] resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                "Save Testimonial"
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}