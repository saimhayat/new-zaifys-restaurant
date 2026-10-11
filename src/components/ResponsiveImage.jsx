import { useEffect, useState } from "react";
import { IMAGE_FALLBACK, photoProps, resolveImageSrc } from "../utils/images";

/** Retry a failed responsive candidate, then show a local, non-looping fallback. */
export default function ResponsiveImage({ src, sizes, width, height, onError, decoding = "async", ...props }) {
  const source = resolveImageSrc(src);
  const [failure, setFailure] = useState(null);
  useEffect(() => { setFailure(null); }, [source]);
  const stage = failure?.source === source ? failure.stage : 0;
  const original = photoProps(source, sizes);
  const image = photoProps(stage === 2 ? IMAGE_FALLBACK : source, sizes);
  return <img {...props} {...image} width={width ?? original.width} height={height ?? original.height}
    srcSet={stage === 0 ? image.srcSet : undefined} sizes={stage === 0 ? image.sizes : undefined}
    decoding={decoding} data-image-fallback={stage === 2 ? "true" : undefined}
    onError={event => {
      if (stage < 2) setFailure({ source, stage: stage === 0 && image.srcSet ? 1 : 2 });
      onError?.(event);
    }} />;
}
