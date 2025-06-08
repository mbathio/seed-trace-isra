// frontend/src/components/ui/file-upload.tsx
import * as React from "react";
import { Upload, X, File } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en MB
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize = 5,
  className,
  disabled,
  children,
}) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter((file) => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux (max ${maxSize}MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      const fileList = new DataTransfer();
      validFiles.forEach((file) => fileList.items.add(file));
      onFileSelect(fileList.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    const fileList = new DataTransfer();
    newFiles.forEach((file) => fileList.items.add(file));
    onFileSelect(fileList.files);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          disabled && "opacity-50 cursor-not-allowed"
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
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          {children || (
            <>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => inputRef.current?.click()}
                >
                  Choisir des fichiers
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  ou glissez-déposez vos fichiers ici
                </p>
                {maxSize && (
                  <p className="text-xs text-muted-foreground">
                    Taille max: {maxSize}MB
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fichiers sélectionnés:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded"
            >
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
