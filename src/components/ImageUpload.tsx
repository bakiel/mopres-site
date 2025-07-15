'use client';

import React, { useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';

interface ImageUploadProps {
  onImageUploaded: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeKB?: number;
  existingImages?: string[];
  folder?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export default function ImageUpload({
  onImageUploaded,
  maxFiles = 5,
  maxSizeKB = 200,
  existingImages = [],
  folder = 'products'
}: ImageUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/i)) {
      return 'Only JPEG and PNG files are allowed';
    }

    // Check file size (200KB limit)
    if (file.size > maxSizeKB * 1024) {
      return `File size must be less than ${maxSizeKB}KB`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const supabase = createSupabaseBrowserClient();
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop()?.toLowerCase();
    const filename = `${timestamp}_${randomId}.${extension}`;
    const filepath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filepath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filepath);

    return publicUrl;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check if we'd exceed max files
    if (images.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Initialize upload progress
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      try {
        const url = await uploadFile(file);
        
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, progress: 100, status: 'success', url }
            : upload
        ));

        return url;
      } catch (error) {
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : upload
        ));
        
        throw error;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImageUploaded(newImages);
      
      // Clear successful uploads after delay
      setTimeout(() => {
        setUploads(prev => prev.filter(upload => upload.status === 'error'));
      }, 3000);
    } catch (error) {
      console.error('Some uploads failed:', error);
    }
  }, [images, maxFiles, maxSizeKB, onImageUploaded, folder]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  }, [handleFiles]);

  const removeImage = async (urlToRemove: string) => {
    const updatedImages = images.filter(url => url !== urlToRemove);
    setImages(updatedImages);
    onImageUploaded(updatedImages);

    // Optional: Delete from Supabase Storage
    try {
      const supabase = createSupabaseBrowserClient();
      const filepath = urlToRemove.split('/').pop();
      if (filepath) {
        await supabase.storage
          .from('images')
          .remove([`${folder}/${filepath}`]);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-amber-500 bg-amber-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          
          <div className="text-sm text-gray-600">
            <label className="cursor-pointer">
              <span className="font-medium text-amber-600 hover:text-amber-500">Click to upload</span>
              <span> or drag and drop</span>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileInput}
              />
            </label>
          </div>
          
          <p className="text-xs text-gray-500">
            PNG, JPEG up to {maxSizeKB}KB each (max {maxFiles} images)
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploading...</h4>
          {uploads.map((upload, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{upload.file.name}</span>
                  <span className="text-xs text-gray-500">{formatFileSize(upload.file.size)}</span>
                </div>
                
                {upload.status === 'uploading' && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                
                {upload.status === 'success' && (
                  <div className="text-xs text-green-600 font-medium">✓ Uploaded successfully</div>
                )}
                
                {upload.status === 'error' && (
                  <div className="text-xs text-red-600">{upload.error}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Product Images ({images.length}/{maxFiles})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}