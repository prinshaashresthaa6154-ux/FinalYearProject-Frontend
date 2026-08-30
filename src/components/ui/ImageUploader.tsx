import { useEffect, useState } from "react";
import FileUpload from "./FileUpload";

type ImageUploaderProps = { label?: string; accept?: string; onChange: (file: File | null) => void; error?: string };

export default function ImageUploader({ label = "Upload image", accept = "image/*", onChange, error }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>();
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  return <div className="space-y-3"><FileUpload label={label} accept={accept} error={error} onChange={(event) => { const file = event.target.files?.[0] ?? null; setPreview(file ? URL.createObjectURL(file) : undefined); onChange(file); }} />{preview && <img src={preview} alt="Selected preview" className="h-32 w-32 rounded-lg object-cover" />}</div>;
}
