export interface SopDocument {
  id: number;
  title: string;
  content?: string;
  format: 'PDF' | 'TXT';
  file_size: number;
  uploaded_by: number;
  uploaded_at: string;
}

export interface BulkUploadResponse {
  message: string;
  success: SopDocument[];
  failed: { name: string; error: string }[];
}