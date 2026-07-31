import api from "@/lib/axios";

export interface UploadedFile {
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

const uploadService = {
  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return api.post<{ data: UploadedFile[] }>("/project-comments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default uploadService;
