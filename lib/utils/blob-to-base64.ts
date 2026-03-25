// src/lib/utils/blob-to-base64.ts

/**
 * Converts a blob URL (from cropper) to a base64 data URL string.
 * This is needed because blob URLs can't be sent to server actions —
 * they only exist in the browser's memory.
 */
export async function blobUrlToBase64(blobUrl: string): Promise<string> {
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert blob to base64"));
            }
        };
        reader.onerror = () => reject(new Error("FileReader error"));
        reader.readAsDataURL(blob);
    });
}