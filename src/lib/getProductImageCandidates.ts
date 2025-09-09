export function getProductImageCandidates(product: any) {
  const candidates: string[] = [];
  try {
    const art = String(product.article || product.id || '');
    const base = art.replace(/\.[^.\s]+$/, '');
    if (Array.isArray(product.images) && product.images.length) product.images.forEach((im: string) => candidates.push(im.startsWith('/') ? im : `/static/pic/${im}`));
    if (product.photo) candidates.push(product.photo.startsWith('/') ? product.photo : `/static/pic/${product.photo}`);
    ['jpg', 'jpeg', 'png', 'webp'].forEach(ext => candidates.push(`/static/pic/${base}.${ext}`));
  } catch (e) {}
  candidates.push('/static/pic/placeholder.jpg');
  return candidates;
}

export default getProductImageCandidates;
