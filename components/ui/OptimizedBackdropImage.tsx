import Image from "next/image";

function canUseNextImage(src: string) {
  if (src.startsWith("/")) return true;

  try {
    const url = new URL(src);
    return (
      (url.hostname === "127.0.0.1" && url.port === "54321") ||
      url.hostname === "localhost" ||
      url.hostname.endsWith(".supabase.co")
    );
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
  if (canUseNextImage(src)) {
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

  return (
    <div
      aria-hidden="true"
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}
