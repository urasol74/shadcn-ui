export function getProductImageCandidates(product: any) {
  const candidates: string[] = [];
  try {
    const art = String(product.article || product.id || '');
    const base = art.replace(/\.[^.\s]+$/, '');
    const supabaseStorageUrl = 'https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image';
    
    if (Array.isArray(product.images) && product.images.length) {
      product.images.forEach((im: string) => {
        if (im.startsWith('http')) {
          candidates.push(im);
        } else {
          candidates.push(`${supabaseStorageUrl}/img-site/${im}`);
        }
      });
    }
    
    if (product.photo) {
      if (product.photo.startsWith('http')) {
        candidates.push(product.photo);
      } else {
        candidates.push(`${supabaseStorageUrl}/img-site/${product.photo}`);
      }
    }
    
    ['webp', 'jpg', 'jpeg', 'png'].forEach(ext => {
      candidates.push(`${supabaseStorageUrl}/img-site/${base}.${ext}`);
    });
  } catch (e) {}
  
  candidates.push('https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/placeholder.jpg');
  return candidates;
}

export default getProductImageCandidates;