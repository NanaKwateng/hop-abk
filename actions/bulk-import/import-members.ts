"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withActionRetry } from "@/lib/utils/action-resilience";
import { importRowSchema } from "@/lib/validations/bulk-import";
import type {
    ImportRow,
    ImportSummary,
    BulkImportOptions,
    ImportError,
    ImportWarning
} from "@/lib/types/bulk-import";
import type { MemberFormData } from "@/lib/types";

interface ImportResult {
    summary: ImportSummary;
    importedIds: string[];
    failedRows: number[];
}

export async function importMembers(
    rows: ImportRow[],
    options: BulkImportOptions
): Promise<ImportResult> {
    return withActionRetry(async () => {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const validRows = rows.filter((row) => row.isValid);

        if (validRows.length === 0) {
            throw new Error("No valid rows to import");
        }

        const importedIds: string[] = [];
        const failedRows: number[] = [];
        const errors: ImportError[] = [];
        const warnings: ImportWarning[] = [];
        const duplicates: any[] = [];

        // Process each valid row
        for (const row of validRows) {
            try {
                // Check for duplicates
                const { data: existing } = await supabase
                    .from("members")
                    .select("id, first_name, last_name, membership_id, email")
                    .or(
                        `membership_id.eq.${row.data.membershipId || ""},email.eq.${row.data.email || ""}`
                    )
                    .maybeSingle();

                if (existing) {
                    duplicates.push({
                        rowNumber: row.rowNumber,
                        membershipId: row.data.membershipId || undefined,
                        email: row.data.email || undefined,
                        existingMember: {
                            id: existing.id,
                            firstName: existing.first_name,
                            lastName: existing.last_name,
                            membershipId: existing.membership_id,
                        },
                    });

                    if (options.duplicateHandling === "skip") {
                        continue;
                    }
                }

                // Prepare member data
                const validatedData = importRowSchema.parse(row.data);

                const memberData: MemberFormData = {
                    firstName: validatedData.firstName,
                    lastName: validatedData.lastName,
                    gender: validatedData.gender as any,
                    phone: validatedData.phone || undefined,
                    email: validatedData.email || undefined,
                    membershipId: validatedData.membershipId || undefined,
                    placeOfStay: validatedData.placeOfStay || undefined,
                    houseNumber: validatedData.houseNumber || undefined,
                    memberPosition: validatedData.memberPosition as any,
                    memberGroup: validatedData.memberGroup as any,
                    occupationType: validatedData.occupationType as any,
                    nickname: validatedData.nickname || undefined,
                };

                if (existing && options.duplicateHandling === "update") {
                    // Update existing member
                    const { error: updateError } = await supabase
                        .from("members")
                        .update(memberData)
                        .eq("id", existing.id);

                    if (updateError) {
                        throw new Error(`Failed to update member: ${updateError.message}`);
                    }
                    importedIds.push(existing.id);
                } else {
                    // Insert new member
                    const { data: newMember, error: insertError } = await supabase
                        .from("members")
                        .insert({
                            ...memberData,
                            created_by: user.id,
                            created_at: new Date().toISOString(),
                        })
                        .select("id")
                        .single();

                    if (insertError) {
                        throw new Error(`Failed to create member: ${insertError.message}`);
                    }
                    if (newMember) {
                        importedIds.push(newMember.id);
                    }
                }
            } catch (error) {
                failedRows.push(row.rowNumber);
                errors.push({
                    column: "general",
                    message: error instanceof Error ? error.message : "Unknown error",
                    rowNumber: row.rowNumber,
                });
            }
        }

        // Revalidate paths
        revalidatePath("/admin/users");

        const summary: ImportSummary = {
            totalRows: rows.length,
            validRows: validRows.length,
            invalidRows: rows.length - validRows.length,
            importedRows: importedIds.length,
            failedRows: failedRows.length,
            errors,
            warnings,
            duplicates,
        };

        return {
            summary,
            importedIds,
            failedRows,
        };
    });
}