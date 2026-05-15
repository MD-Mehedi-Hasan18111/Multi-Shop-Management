"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  isLogo?: boolean;
}

export function ImageUpload({ value, onChange, isLogo }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (isLogo) {
      const reader = new FileReader();
      reader.onload = () => setTempImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      uploadFile(file);
    }
  }, [isLogo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: !isLogo,
  });

  const uploadFile = async (file: File | Blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (isLogo) {
        onChange(data.secure_url);
        setTempImage(null);
      } else {
        const currentValues = Array.isArray(value) ? value : [];
        onChange([...currentValues, data.secure_url]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!tempImage || !croppedAreaPixels) return;

    // Create a cropped image blob
    const canvas = document.createElement("canvas");
    const image = new window.Image();
    image.src = tempImage;

    await new Promise((resolve) => (image.onload = resolve));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, x, y } = croppedAreaPixels as any;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (blob) uploadFile(blob);
    }, "image/jpeg");
  };

  const removeImage = (url: string) => {
    if (isLogo) {
      onChange("");
    } else {
      const currentValues = Array.isArray(value) ? value : [];
      onChange(currentValues.filter((v) => v !== url));
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"
        }`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Drop image here" : `Drag & drop ${isLogo ? "logo" : "banners"} here`}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {isLogo && value && typeof value === "string" && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
            <Image src={value} alt="Logo" fill className="object-cover" />
            <button
              onClick={() => removeImage(value)}
              className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {!isLogo && Array.isArray(value) && value.map((url) => (
          <div key={url} className="relative w-40 h-24 rounded-lg overflow-hidden border">
            <Image src={url} alt="Banner" fill className="object-cover" />
            <button
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Cropper Dialog */}
      <Dialog open={!!tempImage} onOpenChange={() => setTempImage(null)}>
        <DialogContent className="max-w-2xl h-[500px]">
          <DialogHeader>
            <DialogTitle>Crop Logo</DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 h-full w-full bg-black">
            {tempImage && (
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTempImage(null)}>Cancel</Button>
            <Button onClick={handleCropSave} disabled={loading}>
              {loading ? "Uploading..." : "Save & Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
