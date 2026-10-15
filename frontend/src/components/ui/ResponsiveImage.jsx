import variants from "../../data/image-variants.json";

/** Known static artwork gets responsive WebP; new CMS uploads keep their URL. */
export default function ResponsiveImage({ src, srcSet, sizes = "100vw", width, height, ...props }) {
  const image = variants[src];
  return <img {...props} src={image?.src || src} srcSet={image?.srcSet || srcSet}
    sizes={image || srcSet ? sizes : undefined}
    width={width ?? image?.width} height={height ?? image?.height} />;
}
