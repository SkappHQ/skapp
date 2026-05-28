import { LargeModal } from "@rootcodelabs/skapp-ui";
import Image from "next/image";
import React from "react";

interface UpgradeToCoreModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  button?: {
    children: React.ReactNode;
    onClick: () => void;
  };
  image?: {
    src: string;
    alt: string;
  };
  imageContent?: React.ReactNode;
}

const UpgradeToCoreModal: React.FC<UpgradeToCoreModalProps> = ({
  id,
  isOpen,
  onClose,
  title,
  content,
  button,
  image,
  imageContent
}) => {
  const imageElement =
    imageContent ??
    (image?.src ? (
      <Image
        src={image.src}
        alt={image.alt}
        width={280}
        height={350}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
    ) : undefined);

  return (
    <LargeModal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={title}
      className="h-[580px] w-[900px] max-h-[85vh] max-w-[65vw] overflow-hidden"
      content={content}
      image={imageElement}
      imagePosition="left"
      backdropVariant="dark"
      buttons={
        button
          ? {
              buttonRight: {
                children: button.children,
                onClick: button.onClick,
                variant: "primary"
              }
            }
          : undefined
      }
    />
  );
};

export default UpgradeToCoreModal;
