'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';
import { toast } from 'react-hot-toast';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 1, // Default to 1:1 square aspect ratio
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (): Promise<string> => {
    if (!croppedAreaPixels) throw new Error('No cropped area');

    const image = await createImage(image);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    // Set canvas size to output dimensions (1:1 aspect ratio)
    const outputSize = 800; // Standard size for product images
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert canvas to blob with compression
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }

          // Check file size (200KB limit)
          if (blob.size > 200 * 1024) {
            // Try to compress more
            canvas.toBlob(
              (compressedBlob) => {
                if (!compressedBlob) {
                  reject(new Error('Compression failed'));
                  return;
                }
                
                if (compressedBlob.size > 200 * 1024) {
                  reject(new Error('Image too large. Please use a smaller image.'));
                  return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(compressedBlob);
                reader.onloadend = () => {
                  resolve(reader.result as string);
                };
              },
              'image/jpeg',
              0.7 // Lower quality for smaller size
            );
          } else {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
          }
        },
        'image/jpeg',
        0.85 // Initial quality setting
      );
    });
  };

  const handleCropSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg();
      onCropComplete(croppedImage);
      toast.success('Image cropped successfully!');
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      <div className="flex-1 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaChange}
          showGrid={true}
          style={{
            containerStyle: {
              backgroundColor: '#000',
            },
          }}
        />
      </div>

      <div className="bg-white p-4 border-t">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom
            </label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>• Drag to position the image</p>
              <p>• Use zoom slider to adjust size</p>
              <p>• Image will be cropped to 1:1 square ratio</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                disabled={isProcessing}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Save Cropped Image'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;