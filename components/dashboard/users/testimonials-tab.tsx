"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"
import type { MemberTestimonial } from "@/lib/types"
import { createTestimonial } from "@/actions/testimonials"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TestimonialsTabProps {
    memberId: string
    testimonials: MemberTestimonial[]
}

export function TestimonialsTab({
    memberId,
    testimonials,
}: TestimonialsTabProps) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("")
    const [isPending, startTransition] = useTransition()

    function handleAdd() {
        if (!title.trim() || !content.trim()) {
            toast.error("Title and content are required.")
            return
        }

        startTransition(async () => {
            try {
                await createTestimonial(memberId, {

                    title,
                    content,
                    category: category as any,
                })

                toast.success("Testimonial added successfully")
                setTitle("")
                setContent("")
                setCategory("")
            } catch (error: any) {
                toast.error(error.message || "Failed to add testimonial")
            }
        })
    }

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="space-y-4">
                    <h3 className="text-base font-semibold">Add Testimonial / Duty Note</h3>

                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <Input
                        placeholder="Category (e.g. Testimony, Duty, Special Role)"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />

                    <Textarea
                        placeholder="Write the testimonial, responsibility, or note here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[140px]"
                    />

                    <Button onClick={handleAdd} disabled={isPending}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Testimonial
                    </Button>
                </div>
            </Card>

            <div className="space-y-4">
                {testimonials.length === 0 ? (
                    <Card className="p-6 text-sm text-muted-foreground">
                        No testimonials or member notes have been added yet.
                    </Card>
                ) : (
                    testimonials.map((item) => (
                        <Card key={item.id} className="p-4">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleString()
                                                : ""}
                                        </p>
                                    </div>

                                    {item.category && <Badge variant="outline">{item.category}</Badge>}
                                </div>

                                <p className="text-sm text-muted-foreground leading-6">
                                    {item.content}
                                </p>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}