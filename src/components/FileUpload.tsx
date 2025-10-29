import { useRef, useState } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface FileUploadProps {
  accept: string;
  maxSize: number;
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null;
  preview?: string | null;
  label: string;
  error?: string;
  className?: string;
}

export const FileUpload = ({
  accept,
  maxSize,
  onFileSelect,
  currentFile,
  preview,
  label,
  error,
  className,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return;
    }

    const acceptedTypes = accept.split(',').map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      alert('Invalid file type');
      return;
    }

    onFileSelect(file);
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive ? 'border-teal-600 bg-teal-50' : 'border-slate-300 hover:border-teal-400',
          error && 'border-red-500'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {currentFile || preview ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preview && accept.includes('image') ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                <FileIcon className="h-12 w-12 text-slate-400" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {currentFile?.name || 'Uploaded file'}
                </p>
                <p className="text-xs text-slate-500">
                  {currentFile?.size
                    ? `${(currentFile.size / 1024).toFixed(0)}KB`
                    : 'File uploaded'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="mb-2"
              >
                Choose File
              </Button>
              <p className="text-xs text-slate-500">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {accept.includes('image') ? 'PNG, JPG' : 'PNG, JPG, PDF'} (max{' '}
              {(maxSize / (1024 * 1024)).toFixed(0)}MB)
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
