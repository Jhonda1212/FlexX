import Image from "next/image";

function isLocalAsset(src: string) {
  return src.startsWith("/");
}

function isRemoteHttpUrl(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function OptimizedBackdropImage({
  src,
  alt,
  priority = false,
  sizes,
  className = ""
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  if (isLocalAsset(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${className}`}
      />
    );
  }

  if (isRemoteHttpUrl(src)) {
    return (
      <div
        aria-hidden="true"
        className={`bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${src})` }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}
