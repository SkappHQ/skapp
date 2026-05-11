import { Box, IconButton, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { CrmCompanyType } from "~community/crm/types/CrmCompanyTypes";

interface Props {
  company: CrmCompanyType;
  onClose: () => void;
}

const CompanyDetailHeader: React.FC<Props> = ({ company, onClose }) => {
  const theme = useTheme();

  const infoItems = [
    {
      icon: IconName.WEB_ICON,
      value: company.website,
      isLink: true
    },
    {
      icon: IconName.PHONE_ICON,
      value: company.contactNumber,
      isLink: false
    },
    {
      icon: IconName.LOCATION_ICON,
      value: company.address,
      isLink: false
    },
    {
      icon: IconName.BUILDING_ICON,
      value: company.industry,
      isLink: false
    }
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}
      >
        <Typography variant="h1">{company.name}</Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem"
          }}
        >
          {infoItems.map(
            (item, index) =>
              item.value && (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}
                >
                  <Icon
                    name={item.icon}
                    width="1.25rem"
                    height="1.25rem"
                    fill={theme.palette.text.mouseGrey}
                  />
                  {item.isLink ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}
                    >
                      <Link
                        href={
                          item.value.startsWith("http")
                            ? item.value
                            : `https://${item.value}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        underline="always"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          color: theme.palette.primary.dark
                        }}
                      >
                        {item.value}
                        <Icon
                          name={IconName.NEW_WINDOW_ICON}
                          fill={theme.palette.primary.dark}
                        />
                      </Link>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                     
                    >
                      {item.value}
                    </Typography>
                  )}
                </Box>
              )
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <IconButton
          size="small"
          sx={{
            width: "2.25rem",
            height: "2.25rem",
            backgroundColor: "#e4e4e7",
            "&:hover": { backgroundColor: "#d4d4d8" }
          }}
        >
          <Icon
            name={IconName.THREE_DOTS_ICON}
            width="1rem"
            height="1rem"
            fill={theme.palette.text.mouseGrey}
          />
        </IconButton>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            width: "2.25rem",
            height: "2.25rem",
            backgroundColor: "#e4e4e7",
            "&:hover": { backgroundColor: "#d4d4d8" }
          }}
        >
          <Icon
            name={IconName.CLOSE_ICON}
            width="1.25rem"
            height="1.25rem"
            fill={theme.palette.text.mouseGrey}
          />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CompanyDetailHeader;
