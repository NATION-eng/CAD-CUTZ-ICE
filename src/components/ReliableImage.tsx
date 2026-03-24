import React, { useState } from "react";

type ReliableImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  sources: string[];
};

const ReliableImage: React.FC<ReliableImageProps> = ({ sources, alt, ...props }) => {
  const [index, setIndex] = useState(0);

  const handleError = () => {
    setIndex((current) => (current < sources.length - 1 ? current + 1 : current));
  };

  return <img {...props} src={sources[index]} alt={alt} onError={handleError} />;
};

export default ReliableImage;
