// lib/types/testimonials.ts

export interface TestimonialRow {
    id: string;
    member_id: string;
    title: string;
    content: string;
    category: string | null;
    event_date: string | null;
    created_by: string | null;
    created_at: string | null;
}

export interface Testimonial {
    id: string;
    memberId: string;
    title: string;
    content: string;
    category: string | null;
    eventDate: string | null;
    createdAt: string | null;
}

export type TestimonialCategory =
    | "testimonial"
    | "duty"
    | "achievement"
    | "other";

export interface CreateTestimonialInput {
    title: string;
    content: string;
    category: TestimonialCategory;
    eventDate?: string;
}