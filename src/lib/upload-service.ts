
'use client';

// This function talks to our backend API to handle file uploads.
export async function uploadImage(file: File, path: string): Promise<string> {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    
    const formData = new FormData();
    formData.append('file', file);
    // The 'path' argument is kept for potential future use, 
    // e.g., if the backend API needs it to categorize uploads.
    formData.append('path', path); 

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            // Use the error message from the backend if available
            throw new Error(result.message || "File upload failed due to a server error.");
        }

        return result.url;
    } catch (error) {
        // Log the actual error for debugging and re-throw a user-friendly message
        console.error("Upload service error:", error);
        if (error instanceof Error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during file upload.");
    }
}
