export const compressImageFile = (file: File, maxWidth = 1000, quality = 0.82): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      const rawUrl = event.target?.result as string;
      if (!rawUrl) {
        resolve('');
        return;
      }
      img.src = rawUrl;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(rawUrl);
          }
        } catch {
          resolve(rawUrl);
        }
      };
      img.onerror = () => resolve(rawUrl);
    };
    reader.onerror = () => resolve('');
  });
};

export const uploadMediaFile = async (file: File, maxWidth = 1000, quality = 0.82): Promise<string> => {
  try {
    const compressedDataUrl = await compressImageFile(file, maxWidth, quality);
    if (!compressedDataUrl) return '';

    // Attempt to persist to server /api/upload
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedDataUrl, name: file.name })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch {
      // Fallback to compressed base64 data url
    }

    return compressedDataUrl;
  } catch (err) {
    console.error('Failed to upload media file:', err);
    return '';
  }
};
