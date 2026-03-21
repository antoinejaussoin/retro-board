import React from 'react';

export type StaticImageData = {
  src: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
};

export type ImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'width' | 'height'
> & {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  quality?: number;
  unoptimized?: boolean;
};

function resolveSrc(source: string | StaticImageData) {
  return typeof source === 'string' ? source : source.src;
}

export default function Image({
  src,
  alt,
  fill,
  width,
  height,
  style,
  ...props
}: ImageProps) {
  const resolvedSrc = resolveSrc(src);
  const resolvedWidth = width ?? (typeof src === 'object' ? src.width : undefined);
  const resolvedHeight =
    height ?? (typeof src === 'object' ? src.height : undefined);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : resolvedWidth}
      height={fill ? undefined : resolvedHeight}
      style={
        fill
          ? {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              ...style,
            }
          : style
      }
      {...props}
    />
  );
}