import type { ImageLoaderProps } from 'next/image';

const normalizeSrc = (src: string) => {
  return src.startsWith('/') ? src.slice(1) : src;
};

const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) => {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    return `${src}?${params.join('&')}`;
  }
  return `/cdn-cgi/image/${params.join(',')}/${normalizeSrc(src)}`;
};

export default cloudflareLoader;
