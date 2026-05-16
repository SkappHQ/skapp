import { Box, IconButton, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import KebabMenu from "~community/common/components/molecules/KebabMenu/KebabMenu";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

interface Props {
  company: CrmCompanyType;
  onClose: () => void;
}

const CompanyDetailHeader: React.FC<Props> = ({ company, onClose }) => {
  const theme = useTheme();
  const { setCompanyModalType } = useCrmStore();

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
          gap: "0.75rem",
          flex: 1,
          minWidth: 0
        }}
      >
        <Typography variant="h1">{company.name}</Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "757px",
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
                          name={IconName.BROWSER_WINDOW_ICON}
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
        <KebabMenu
          id="company-detail-menu"
          menuItems={[
            {
              id: "delete-company",
              icon: (
                <Icon
                  name={IconName.BIN_ICON}
                  width="1.25rem"
                  height="1.25rem"
                  fill="#7F1D1D"
                />
              ),
              text: "Delete company",
              color: "#7F1D1D",
              onClickHandler: () =>
                setCompanyModalType(CrmModalTypes.DELETE_COMPANY_CONFIRMATION)
            }
          ]}
          menuAlign={{
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
            transformOrigin: { vertical: "top", horizontal: "right" }
          }}
          customStyles={{
            menuIcon: {
              width: "2.25rem",
              height: "2.25rem",
              backgroundColor: "#e4e4e7",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { backgroundColor: "#d4d4d8" }
            },
            menu: {
              "& .MuiPaper-root": {
                backgroundColor: theme.palette.error.main
              }
            },
            menuItem: {
              "&:hover": { backgroundColor: "transparent" }
            }
          }}
        />
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
