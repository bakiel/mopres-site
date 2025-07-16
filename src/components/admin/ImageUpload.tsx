'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import ImageCropper from './ImageCropper';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageData: string) => void;
  label?: string;
  maxSizeKB?: number;
  acceptedFormats?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  label = 'Product Image',
  maxSizeKB = 200,
  acceptedFormats = ['image/jpeg', 'image/png'],
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    // Validate file size
    if (file.size > maxSizeKB * 1024) {
      toast.error(`Image size must be less than ${maxSizeKB}KB`);
      return;
    }

    // Read file and show cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTempImage(result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    setPreviewImage(croppedImage);
    onImageChange(croppedImage);
    setShowCropper(false);
    setTempImage(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageChange('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-start gap-4">
        <div className="relative">
          {previewImage ? (
            <div className="relative group">
              <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={previewImage}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Change image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-amber-500"
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">Add Image</span>
            </button>
          )}
        </div>

        <div className="flex-1 space-y-2 text-sm text-gray-600">
          <p className="font-medium text-gray-700">Image Requirements:</p>
          <ul className="space-y-1">
            <li>• Format: JPEG or PNG only</li>
            <li>• Size: Maximum {maxSizeKB}KB</li>
            <li>• Ratio: Will be cropped to 1:1 square</li>
            <li>• Recommended: 800x800px minimum</li>
          </ul>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default ImageUpload;