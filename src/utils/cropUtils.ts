import { PixelCrop } from 'react-image-crop';

export async function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop | null): Promise<File> {
  // If no crop region was drawn, return the full image (which might have been rotated)
  if (!pixelCrop || pixelCrop.width === 0 || pixelCrop.height === 0) {
    const res = await fetch(imageSrc);
    const blob = await res.blob();
    return new File([blob], 'edited.jpg', { type: 'image/jpeg' });
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context available');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], 'edited.jpg', { type: 'image/jpeg' }));
      } else {
        reject(new Error('Canvas is empty after crop'));
      }
    }, 'image/jpeg', 0.9);
  });
}