import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onDrop: (files: File[]) => void;
}

export function DropZone({ onDrop }: DropZoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      onDrop(files);
    },
    [onDrop]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith('image/')
      );
      onDrop(files);
    },
    [onDrop]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors bg-gray-900/30"
    >
      <input
        type="file"
        id="fileInput"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer flex flex-col items-center gap-4"
      >
        <div className="p-4 bg-purple-900/50 rounded-full">
          <Upload className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-300">
            Drop your images here, or{' '}
            <span className="text-purple-400">browse</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
      </label>
    </div>
  );
}