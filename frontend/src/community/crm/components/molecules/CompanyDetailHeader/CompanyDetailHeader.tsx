import { Box, IconButton, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import KebabMenu from "~community/common/components/molecules/KebabMenu/KebabMenu";
import ModalController from "~community/common/components/organisms/ModalController/ModalController";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyTableDataType, CrmCompanyType } from "~community/crm/types/CommonTypes";

import DeleteCompanyModal from "../DeleteCompanyModal/DeleteCompanyModal";

interface Props {
  company: CrmCompanyTableDataType;
  onClose: () => void;
}

const CompanyDetailHeader: React.FC<Props> = ({ company, onClose }) => {
  const theme = useTheme();
  const { isDeleteCompanyModalOpen, setIsDeleteCompanyModalOpen } =
    useCrmStore();

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
                  <Icon name={item.icon} width="1.25rem" height="1.25rem" />
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
                    <Typography variant="body2">{item.value}</Typography>
                  )}
                </Box>
              )
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <KebabMenu
          id="company-detail-kebab"
          menuItems={[
            {
              id: "delete-company",
              icon: (
                <Icon
                  name={IconName.BIN_ICON}
                  width="1.25rem"
                  height="1.25rem"
                  fill="#82181A"
                />
              ),
              text: "Delete company",
              onClickHandler: () => {
                setIsDeleteCompanyModalOpen(true);
              }
            }
          ]}
          icon={
            <Icon name={IconName.THREE_DOTS_ICON} width="1rem" height="1rem" />
          }
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
                width: "227px",
                backgroundColor: "transparent",
                boxShadow: "none",
                borderRadius: "0.75rem"
              }
            },
            menuItem: {
              width: "227px",
              height: "48px",
              backgroundColor: "#FFE2E2",
              borderRadius: "12px",
              border: "0.8px solid #F3F4F6",
              px: "0.75rem",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#FFE2E2" }
            },
            menuItemText: {
              color: "#82181A",
              fontSize: "1rem",
              lineHeight: "1.5rem",
              letterSpacing: "0.03125rem"
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
          <Icon name={IconName.CLOSE_ICON} width="1.25rem" height="1.25rem" />
        </IconButton>
      </Box>

      <ModalController
        isModalOpen={isDeleteCompanyModalOpen}
        handleCloseModal={() => {
          setIsDeleteCompanyModalOpen(false);
        }}
        modalTitle="Are you sure?"
        isDividerVisible={false}
      >
        <DeleteCompanyModal />
      </ModalController>
    </Box>
  );
};

export default CompanyDetailHeader;
