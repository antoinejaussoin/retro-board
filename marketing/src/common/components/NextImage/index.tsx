import Image, { ImageProps } from 'next/image';

export default function NextImage({ ...props }: ImageProps) {
  return <Image {...props} />;
}
