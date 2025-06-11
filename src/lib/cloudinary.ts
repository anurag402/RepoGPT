import axios from 'axios';

type UploadResponse = {
  secure_url: string;
  public_id: string;
  [key: string]: any;
};
/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 *
 * @param file - The File to upload
 * @param setProgress - Optional progress callback (0-100)
 * @returns secure_url of the uploaded asset
 */
export async function uploadToCloudinary(
  file: File,
  setProgress?: (progress: number) => void
): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!preset) throw new Error('Missing CLOUDINARY_UPLOAD_PRESET');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const response = await axios.post<UploadResponse>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (setProgress && e.total) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    },
  });

  return response.data.secure_url;
}