export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

export const processImage = (file: File, maxResolution: number, rotation: number = 0): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get canvas context'));

      let width = img.width;
      let height = img.height;

      if (width > maxResolution || height > maxResolution) {
        if (width > height) {
          height = Math.round((height * maxResolution) / width);
          width = maxResolution;
        } else {
          width = Math.round((width * maxResolution) / height);
          height = maxResolution;
        }
      }

      if (rotation === 90 || rotation === 270) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);

      const mimeType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.8);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType });
    };
    
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const applyCropAndRotate = (
  file: File, 
  res: {xmin: number, ymin: number, xmax: number, ymax: number}, 
  rot: number, 
  maxResolution: number
): Promise<{base64: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => { 
      img.src = e.target?.result as string; 
    };
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get canvas context'));

      const x = (res.xmin / 1000) * img.width;
      const y = (res.ymin / 1000) * img.height;
      const w = ((res.xmax - res.xmin) / 1000) * img.width;
      const h = ((res.ymax - res.ymin) / 1000) * img.height;

      let finalW = w;
      let finalH = h;

      if (finalW > maxResolution || finalH > maxResolution) {
        if (finalW > finalH) {
          finalH = Math.round((finalH * maxResolution) / finalW);
          finalW = maxResolution;
        } else {
          finalW = Math.round((finalW * maxResolution) / finalH);
          finalH = maxResolution;
        }
      }

      if (rot === 90 || rot === 270) {
        canvas.width = finalH;
        canvas.height = finalW;
      } else {
        canvas.width = finalW;
        canvas.height = finalH;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rot * Math.PI) / 180);
      
      ctx.drawImage(img, x, y, w, h, -finalW / 2, -finalH / 2, finalW, finalH);

      const mimeType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.8);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType });
    };
    
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const rotateImageFile = (file: File, degrees: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => { 
      img.src = e.target?.result as string; 
    };
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get canvas context'));

      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name, { type: file.type || 'image/jpeg' }));
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      }, file.type || 'image/jpeg', 0.95);
    };
    
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};