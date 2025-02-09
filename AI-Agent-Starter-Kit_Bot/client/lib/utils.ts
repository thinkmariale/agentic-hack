import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function loadFileIntoBlob(base64Data: File): Promise<Blob> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const blob = new Blob([reader.result], { type: base64Data.type });
          //console.log('blob', blob.size);
          resolve(blob);
        } else {
          reject(new Error('Failed to read file data'));
        }
      };
      reader.onerror = event => {
        reject(
          new Error(
            'Failed to read file: ' +
              (event.target ? event.target.error : 'Unknown error')
          )
        );
      };
      reader.readAsArrayBuffer(base64Data);
    });
  } catch (error) {
    console.error('Error loading file:', error);
    return new Blob();
  }
}

export const getContentFormat = (contentType: string): string => {
  if (contentType.includes("image")) {
    if (contentType.includes("png")) return "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg"))
      return "jpg";
  }
  if (contentType.includes("audio")) {
    if (contentType.includes("mp3") || contentType.includes("mpeg"))
      return "mp3";
    if (contentType.includes("wav")) return "wav";
  }
  if (contentType.includes("video") && contentType.includes("mp4"))
    return "mp4";

  throw new Error(`Unsupported content type: ${contentType}`);
};