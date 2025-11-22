import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
export default PlaceHolderImages;
