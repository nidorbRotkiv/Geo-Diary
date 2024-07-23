import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Button from "@/app/components/Map/Form/Button";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { Session } from "next-auth";

interface ImageUploaderProps {
  initialImages: File[];
  imageUrls: string[];
  onImagesChange: (newImages: File[]) => void;
  onImageUrlsChange: (newImageUrls: string[]) => void;
  editAllowed: boolean;
  session: Session;
  markerOwnerEmail: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImages,
  imageUrls,
  onImagesChange,
  onImageUrlsChange,
  editAllowed,
  session,
  markerOwnerEmail,
}) => {
  const [images, setImages] = useState<File[]>(initialImages);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialImages);
    const newPreviews = initialImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [initialImages]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleAddImage = useCallback(
    (newImage: File) => {
      const newImages = [...images, newImage];
      setImages(newImages);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, idx) => idx !== index);
      setImages(newImages);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const handleRemoveImageUrl = useCallback(
    (index: number) => {
      const newImageUrls = imageUrls.filter((_, idx) => idx !== index);
      onImageUrlsChange(newImageUrls);
    },
    [imageUrls, onImageUrlsChange]
  );

  const singleImage = images.length + imageUrls.length === 1;
  const lessThanThreeImages = images.length + imageUrls.length < 3;

  return (
    <>
      <div
        className={`grid ${singleImage ? `grid-cols-1` : `grid-cols-2`} gap-2 max-w-60`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {editAllowed &&
          imagePreviews.map((src, index) => (
            <div
              key={index}
              className={`relative image-container ${lessThanThreeImages ? `h-40` : `h-24`}`}
            >
              <Image
                src={src}
                alt={`Preview image: ${index}`}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
              <button
                className="absolute top-0 right-0 pr-1.5 border-none cursor-pointer"
                onClick={() => handleRemoveImage(index)}
              >
                <FontAwesomeIcon icon={faCircleXmark} size="lg" />
              </button>
            </div>
          ))}
        {imageUrls.map((url, index) => (
          <div
            key={url}
            className={`relative image-container ${lessThanThreeImages ? `h-40` : `h-24`}`}
          >
            <Image
              src={url}
              alt={`Uploaded image: ${index}`}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
            {session?.user?.email === markerOwnerEmail && (
              <button
                className="absolute top-0 right-0 pr-1.5 border-none cursor-pointer"
                onClick={() => handleRemoveImageUrl(index)}
              >
                <FontAwesomeIcon icon={faCircleXmark} fade={isHovered} size="lg" />
              </button>
            )}
          </div>
        ))}
      </div>
      {editAllowed && (
        <>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleAddImage(e.target.files[0]);
                e.target.value = ""; // Reset file input after file selection
              }
            }}
          />
          <Button
            onClick={() => {
              if (!session) {
                toast.error("You must be logged in to upload images...");
              } else if (images.length + imageUrls.length >= 4) {
                toast.error("You can only upload 4 images per marker...");
              } else {
                fileInputRef.current!.click();
              }
            }}
            extraClasses="w-full bg-orange-600 dark:bg-dark-button mt-1.5"
          >
            Add new image
          </Button>
        </>
      )}
    </>
  );
};

export default ImageUploader;
