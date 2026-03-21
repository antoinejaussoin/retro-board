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
  placeholder?: 'blur' | 'empty';
  priority?: boolean;
  blurDataURL?: string;
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
  placeholder: _placeholder,
  priority: _priority,
  blurDataURL: _blurDataURL,
  quality: _quality,
  unoptimized: _unoptimized,
  ...props
}: ImageProps) {
  const resolvedSrc = resolveSrc(src);
  const dimensions = resolveDimensions(src, width, height);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : dimensions.width}
      height={fill ? undefined : dimensions.height}
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

function resolveDimensions(
  source: string | StaticImageData,
  width?: number,
  height?: number,
) {
  if (typeof source !== 'object') {
    return { width, height };
  }

  const intrinsicWidth = source.width;
  const intrinsicHeight = source.height;

  if (width && height) {
    return { width, height };
  }

  if (width && intrinsicWidth && intrinsicHeight) {
    return {
      width,
      height: Math.round((width / intrinsicWidth) * intrinsicHeight),
    };
  }

  if (height && intrinsicWidth && intrinsicHeight) {
    return {
      width: Math.round((height / intrinsicHeight) * intrinsicWidth),
      height,
    };
  }

  return {
    width: width ?? intrinsicWidth,
    height: height ?? intrinsicHeight,
  };
}