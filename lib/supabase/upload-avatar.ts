// src/lib/supabase/upload-avatar.ts

import { createClient } from "@/lib/supabase/server";

/**
 * Must match EXACTLY the bucket name you created in Supabase Dashboard.
 * Go to Supabase Dashboard → Storage to verify.
 */
const AVATAR_BUCKET = "member-avatars";

/**
 * Upload avatar image to Supabase Storage.
 * Accepts a base64 data URL string from the cropper.
 * Returns the public URL of the uploaded image.
 */
export async function uploadAvatar(
    base64DataUrl: string,
    existingUrl?: string | null
): Promise<string> {
    const supabase = await createClient();

    // ---- Clean up old avatar if replacing ----
    if (existingUrl) {
        try {
            const url = new URL(existingUrl);
            const pathParts = url.pathname.split(
                `/storage/v1/object/public/${AVATAR_BUCKET}/`
            );
            if (pathParts[1]) {
                await supabase.storage
                    .from(AVATAR_BUCKET)
                    .remove([decodeURIComponent(pathParts[1])]);
            }
        } catch {
            // Non-critical cleanup — continue with upload
        }
    }

    // ---- Parse base64 data URL ----
    const matches = base64DataUrl.match(
        /^data:image\/(jpeg|png|webp);base64,(.+)$/
    );

    if (!matches) {
        throw new Error(
            "Invalid image data. Expected a base64-encoded JPEG, PNG, or WebP image."
        );
    }

    const imageType = matches[1]; // "jpeg", "png", or "webp"
    const base64Data = matches[2];
    const extension = imageType === "jpeg" ? "jpg" : imageType;
    const contentType = `image/${imageType}`;

    // ---- Build unique file path ----
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const filePath = `members/${timestamp}-${randomId}.${extension}`;

    // ---- Convert base64 to Uint8Array ----
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // ---- Upload ----
    const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, bytes, {
            contentType,
            upsert: false,
        });

    if (uploadError) {
        console.error("AVATAR UPLOAD ERROR:", uploadError);

        // Provide helpful error messages for common issues
        if (uploadError.message.includes("Bucket not found")) {
            throw new Error(
                `Storage bucket "${AVATAR_BUCKET}" not found. ` +
                `Please create it in Supabase Dashboard → Storage → New Bucket. ` +
                `Name it exactly: "${AVATAR_BUCKET}" and make it public.`
            );
        }

        if (
            uploadError.message.includes("security") ||
            uploadError.message.includes("policy")
        ) {
            throw new Error(
                `Storage permission denied. Please add RLS policies to the "${AVATAR_BUCKET}" bucket ` +
                `that allow INSERT for authenticated users.`
            );
        }

        throw new Error(`Failed to upload avatar: ${uploadError.message}`);
    }

    // ---- Get public URL ----
    const {
        data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Delete an avatar from storage by its public URL.
 * Used during member deletion or avatar replacement.
 */
export async function deleteAvatarByUrl(avatarUrl: string): Promise<void> {
    const supabase = await createClient();

    try {
        const url = new URL(avatarUrl);
        const pathParts = url.pathname.split(
            `/storage/v1/object/public/${AVATAR_BUCKET}/`
        );
        if (pathParts[1]) {
            await supabase.storage
                .from(AVATAR_BUCKET)
                .remove([decodeURIComponent(pathParts[1])]);
        }
    } catch {
        console.warn("Failed to delete avatar:", avatarUrl);
    }
}






