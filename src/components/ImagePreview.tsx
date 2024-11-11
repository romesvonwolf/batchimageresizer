import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative group">
      <img
        src={preview}
        alt={file.name}
        className="w-full aspect-square object-cover rounded-lg ring-1 ring-gray-700"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 p-1.5 bg-gray-900/80 hover:bg-red-900/80 rounded-full text-white 
                   opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-900/80 backdrop-blur-sm rounded-b-lg">
        <p className="text-xs text-gray-300 truncate">
          {file.name}
        </p>
      </div>
    </div>
  );
}