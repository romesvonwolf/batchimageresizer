import React, { useState, useCallback } from 'react';
import { ImageDown, Upload, Download } from 'lucide-react';
import JSZip from 'jszip';
import { DropZone } from './components/DropZone';
import { ImagePreview } from './components/ImagePreview';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState<number>(800);
  const [format, setFormat] = useState<'png' | 'jpeg'>('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    const zip = new JSZip();
    
    try {
      const processedImages = await Promise.all(
        files.map(async (file) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          
          return new Promise<{ name: string; blob: Blob }>((resolve) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;
              
              const aspectRatio = img.width / img.height;
              const height = Math.round(width / aspectRatio);
              
              canvas.width = width;
              canvas.height = height;
              
              ctx.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const extension = format === 'jpeg' ? 'jpg' : 'png';
                    const fileName = file.name.replace(/\.[^/.]+$/, '') + '_resized.' + extension;
                    resolve({ name: fileName, blob });
                  }
                },
                `image/${format}`,
                format === 'jpeg' ? 0.95 : undefined
              );
              
              URL.revokeObjectURL(objectUrl);
            };
            img.src = objectUrl;
          });
        })
      );

      processedImages.forEach(({ name, blob }) => {
        zip.file(name, blob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'resized-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
            <ImageDown className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Image Resizer</h1>
          <p className="text-gray-600">Drag and drop your images, set your preferences, and download them all at once</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <DropZone onDrop={handleDrop} />
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (pixels)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <ImagePreview
                  key={index}
                  file={file}
                  onRemove={() => removeFile(index)}
                />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={processImages}
          disabled={files.length === 0 || isProcessing}
          className={`w-full py-3 px-6 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-all
            ${files.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : isProcessing
              ? 'bg-indigo-400 cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          {isProcessing ? (
            <>
              <Upload className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Convert and Download
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;