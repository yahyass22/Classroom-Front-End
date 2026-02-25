/// <reference types="vite/client" />

interface CloudinaryUploadWidget {
    createUploadWidget: (
        options: {
            cloudName: string;
            uploadPreset: string;
            multiple?: boolean;
            folder?: string;
            maxFileSize?: number;
            clientAllowedFormats?: string[];
        },
        callback: (error: Error | null, result: { event: string; info: any }) => void
    ) => {
        open: () => void;
        destroy: () => void;
    };
}

interface Window {
    cloudinary?: CloudinaryUploadWidget;
}
