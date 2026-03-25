// actions/testimonials.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
    TestimonialRow,
    Testimonial,
    CreateTestimonialInput,
} from "@/lib/types/testimonials";

async function getAuth() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    return { supabase, user };
}

function rowToTestimonial(row: TestimonialRow): Testimonial {
    return {
        id: row.id,
        memberId: row.member_id,
        title: row.title,
        content: row.content,
        category: row.category,
        eventDate: row.event_date,
        createdAt: row.created_at,
    };
}

// ── FETCH ALL for a member ──

export async function fetchMemberTestimonials(
    memberId: string
): Promise<Testimonial[]> {
    const { supabase } = await getAuth();

    const { data, error } = await supabase
        .from("member_testimonials")
        .select("*")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("FETCH TESTIMONIALS ERROR:", error);
        throw new Error(error.message);
    }

    return ((data ?? []) as TestimonialRow[]).map(rowToTestimonial);
}

// ── CREATE ──

export async function createTestimonial(
    memberId: string,
    input: CreateTestimonialInput
): Promise<Testimonial> {
    const { supabase, user } = await getAuth();

    const { data, error } = await supabase
        .from("member_testimonials")
        .insert({
            member_id: memberId,
            title: input.title,
            content: input.content,
            category: input.category ?? "testimonial",
            event_date: input.eventDate ?? null,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error("CREATE TESTIMONIAL ERROR:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/admin/users/${memberId}`);
    return rowToTestimonial(data as TestimonialRow);
}

// ── DELETE ──

export async function deleteTestimonial(
    testimonialId: string,
    memberId: string
): Promise<void> {
    const { supabase } = await getAuth();

    const { error } = await supabase
        .from("member_testimonials")
        .delete()
        .eq("id", testimonialId);

    if (error) {
        console.error("DELETE TESTIMONIAL ERROR:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/admin/users/${memberId}`);
}