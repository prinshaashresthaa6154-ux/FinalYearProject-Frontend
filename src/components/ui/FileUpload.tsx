import type { InputHTMLAttributes } from "react";

type FileUploadProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label?: string; error?: string };

export default function FileUpload({ label = "Upload file", error, id, ...props }: FileUploadProps) { return <label className="block space-y-1.5"><span className="text-sm font-semibold text-black">{label}</span><input {...props} id={id} type="file" className={`block min-h-11 w-full rounded-lg border border-dashed bg-white px-3 py-2 text-sm text-black file:mr-3 file:rounded-md file:border-0 file:bg-[#1D78AF]/10 file:px-3 file:py-1.5 file:font-semibold file:text-[#155D89] hover:file:bg-[#1D78AF]/15 ${error ? "border-[#AF1D1D]" : "border-black/20"}`} />{error && <span className="text-xs font-medium text-[#AF1D1D]">{error}</span>}</label>; }
