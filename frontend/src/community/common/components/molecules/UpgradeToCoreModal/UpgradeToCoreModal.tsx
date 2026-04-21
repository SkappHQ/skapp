import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import Image from "next/image";
import React from "react";

import BasicModal from "~community/common/components/organisms/BasicModal/BasicModal";

interface UpgradeToCoreModalProps {
  id: string;
  isOpen: boolean;
  closeIconButton: {
    onClick: () => void;
  };
  title: {
    children: React.ReactNode;
  };
  description: {
    children: React.ReactNode;
  };
  button?: {
    children: React.ReactNode;
    onClick: () => void;
  };
  image: {
    src: string;
    alt: string;
  };
  imageContent?: React.ReactNode;
  onClose: () => void;
}

const UpgradeToCoreModal: React.FC<UpgradeToCoreModalProps> = ({
  isOpen,
  closeIconButton,
  title,
  description,
  button,
  image,
  imageContent,
  onClose
}) => {
  return (
    <BasicModal
      open={isOpen}
      onClose={onClose}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "670px",
          maxHeight: "50vh",
          backgroundColor: "white",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: 24
        }}
      >
        {/* Image Section */}
        <Box
          sx={{
            width: "280px",
            height: "350px",
            overflow: "hidden"
          }}
        >
          {imageContent ?? (
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
          )}
        </Box>

        {/* Content Section */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 3,
            gap: 2,
            maxWidth: "390px"
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 1
            }}
          >
            <Typography
              variant="h1"
              component="h2"
              sx={{ fontWeight: 600, flex: 1 }}
            >
              {title.children}
            </Typography>
            <IconButton
              onClick={closeIconButton.onClick}
              size="small"
              sx={{ mt: -0.5 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Description */}
          <Box sx={{ flex: 1 }}>{description.children}</Box>

          {/* Action Button */}
          {button && (
            <ButtonV2 variant="primary" onClick={button.onClick}>
              {button.children}
            </ButtonV2>
          )}
        </Box>
      </Box>
    </BasicModal>
  );
};

export default UpgradeToCoreModal;
