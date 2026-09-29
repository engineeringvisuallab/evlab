import React, { useState, useEffect } from 'react';
import { Camera, Upload, Check } from 'lucide-react';

interface VerifiedProfilePhotoProps {
  storageKey: string;
  defaultPath: string;
  altText: string;
  className?: string;
  badgeLabel?: string;
}

export function VerifiedProfilePhoto({
  storageKey,
  defaultPath,
  altText,
  className = "w-full h-full object-cover",
  badgeLabel
}: VerifiedProfilePhotoProps) {
  const [photoSrc, setPhotoSrc] = useState<string>(() => {
    return localStorage.getItem(storageKey) || defaultPath;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          localStorage.setItem(storageKey, base64);
          setPhotoSrc(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full group overflow-hidden bg-slate-900">
      <img
        src={photoSrc}
        alt={altText}
        className={className}
        onError={() => {
          // If public file is not placed yet, use a clean fallback
          if (!localStorage.getItem(storageKey)) {
            // Keep defaultPath or fallback
          }
        }}
      />

      {badgeLabel && (
        <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-sm text-[9px] font-mono text-cyan-300 text-center py-1 border-t border-cyan-500/20">
          {badgeLabel}
        </div>
      )}

      {/* Floating 1-Click Exact Photo Setter */}
      <label
        title="Click to select your WhatsApp original photo"
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
      >
        <Upload className="w-3.5 h-3.5" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
}
