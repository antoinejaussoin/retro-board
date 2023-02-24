import Image, { ImageProps } from 'next/image';

export default function NextImage({ alt, ...props }: ImageProps) {
  return <Image alt={alt} {...props} />;
}
