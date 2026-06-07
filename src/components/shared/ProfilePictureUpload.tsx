/**
 * ProfilePictureUpload Component
 * 
 * Allows users to upload and manage their profile pictures
 * Supports image validation, compression, and preview
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  validateImageFile,
  compressImage,
  generateAvatarFromInitials,
} from '../../utils/image';

interface ProfilePictureUploadProps {
  currentImage: string | undefined;
  userName: string;
  onImageChange: (base64: string) => void;
  className?: string;
}

export default function ProfilePictureUpload({
  currentImage,
  userName,
  onImageChange,
  className = '',
}: ProfilePictureUploadProps) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage prop changes
  useEffect(() => {
    if (currentImage === '') {
      setPreview(undefined);
    } else if (currentImage && currentImage !== preview) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const defaultAvatar = generateAvatarFromInitials(userName);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || t('common.invalidFile'));
        setIsLoading(false);
        return;
      }

      // Compress image
      const compressed = await compressImage(file);
      setPreview(compressed);
      onImageChange(compressed);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('common.failedToProcessImage')
      );
      setPreview(currentImage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(undefined);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || currentImage || defaultAvatar;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Image Preview */}
      <div className="relative">
        <img
          src={displayImage}
          alt={userName}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col gap-2 w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="btn-secondary w-full"
        >
          {preview || currentImage ? t('common.changePhoto') : t('common.uploadPhoto')}
        </button>

        {preview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemoveImage();
            }}
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg transition-colors"
          >
            {t('common.removePhoto')}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        {t('common.photoFormats')}
      </p>
    </div>
  );
}
