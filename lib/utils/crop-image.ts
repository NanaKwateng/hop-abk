// src/lib/utils/crop-image.ts

export interface CroppedArea {
    x: number
    y: number
    width: number
    height: number
}

export function getCroppedImage(
    imageSrc: string,
    pixelCrop: CroppedArea
): Promise<string> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = "anonymous"

        image.onload = () => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            if (!ctx) {
                reject(new Error("Could not get canvas context"))
                return
            }

            canvas.width = pixelCrop.width
            canvas.height = pixelCrop.height

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            )

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Canvas is empty"))
                        return
                    }
                    const url = URL.createObjectURL(blob)
                    resolve(url)
                },
                "image/jpeg",
                0.9
            )
        }

        image.onerror = () => reject(new Error("Failed to load image"))
        image.src = imageSrc
    })
}