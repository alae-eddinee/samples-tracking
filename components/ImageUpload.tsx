"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";

interface ImageUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
}

export default function ImageUpload({ currentUrl, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl ?? "");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset!);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPreview(data.secure_url);
      onUpload(data.secure_url);
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) upload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="space-y-3">
      {preview && (
        <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-gray-200 group">
          <Image src={preview} alt="Sample" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => { setPreview(""); onUpload(""); }}
            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}`}
      >
        <UploadCloud size={24} className={dragging ? "text-blue-500" : "text-gray-400"} />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {uploading ? "Uploading…" : preview ? "Drop or click to replace" : "Drop image here or click to browse"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
