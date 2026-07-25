// lib/utils/camera-utils.ts

/**
 * Check if the device has a camera
 */
export async function hasCamera(): Promise<boolean> {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some((device) => device.kind === "videoinput");
    } catch {
        return false;
    }
}

/**
 * Get camera permission status
 */
export async function getCameraPermission(): Promise<"granted" | "denied" | "prompt"> {
    try {
        // Check if we already have permission
        const permissionStatus = await navigator.permissions.query({
            name: "camera" as PermissionName,
        });
        return permissionStatus.state as "granted" | "denied" | "prompt";
    } catch {
        // Some browsers don't support permissions API
        return "prompt";
    }
}

/**
 * Check if camera is supported on this device
 */
export function isCameraSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Get list of available cameras
 */
export async function getCameras(): Promise<MediaDeviceInfo[]> {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((device) => device.kind === "videoinput");
    } catch {
        return [];
    }
}

/**
 * Get best available camera
 */
export async function getBestCamera(
    facingMode: "user" | "environment" = "environment"
): Promise<MediaDeviceInfo | null> {
    const cameras = await getCameras();
    if (cameras.length === 0) return null;
    return cameras[0] || null;
}

/**
 * Check if we're on a mobile device
 */
export function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}