import { ModifiedFileType } from "~community/people/types/AddNewResourceTypes";

/**
 * This function takes a file object and generates a 128x128px square thumbnail for it,
 * scaling the smaller dimension to 128px and cropping the larger dimension from the center.
 * The thumbnail is returned as an array of ModifiedFileType objects.
 * @param file the file object to generate the thumbnail for
 * @returns a promise that resolves to an array of ModifiedFileType objects
 */
const generateThumbnail = (
  file: ModifiedFileType
): Promise<ModifiedFileType[]> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = file.preview;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const targetSize = 128;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let destWidth = targetSize;
      let destHeight = targetSize;

      if (img.width > img.height) {
        sourceWidth = img.height;
        sourceX = (img.width - img.height) / 2;
      } else if (img.height > img.width) {
        sourceHeight = img.width;
        sourceY = (img.height - img.width) / 2;
      }

      canvas.width = targetSize;
      canvas.height = targetSize;

      ctx?.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        destWidth,
        destHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailFile = new File([blob], file.name, {
            type: file.type
          });

          const thumbnailWithPreview = Object.assign(thumbnailFile, {
            preview: URL.createObjectURL(thumbnailFile),
            path: file.path
          });

          resolve([thumbnailWithPreview]);
        } else {
          reject(new Error("Failed to create thumbnail blob."));
        }
      }, file.type);
    };
    img.onerror = reject;
  });
};

export default generateThumbnail;
