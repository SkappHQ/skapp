import React from "react";

import { Theme, useTheme } from "@mui/material/styles";

import Icon from "~community/common/components/atoms/Icon/Icon";
import KebabMenu from "~community/common/components/molecules/KebabMenu/KebabMenu";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

interface Props {
  company: CrmCompanyMetricsType;
}

const CompanyDetailHeader: React.FC<Props> = ({ company }) => {
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
    <div className="flex flex-col gap-3">
      <p className="font-bold text-2xl leading-6 tracking-[0.07px]">
        {company.name}
      </p>

     
      <div className="flex items-center justify-between max-w-[75%]">
        {infoItems.map(
          (item) =>
            item.value && (
              <div key={item.icon} className="flex items-center gap-3">
                {item.isLink ? (
                  <a
                    href={
                      /^https?:\/\//i.test(item.value)
                        ? item.value
                        : `https://${item.value}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm leading-6 tracking-[0.5px]"
                    style={{ color: "var(--color-primary-text)", textDecoration: "underline" }}
                  >
                    <Icon
                      name={item.icon}
                      width="1.25rem"
                      height="1.25rem"
                      fill="var(--color-primary-text)"
                    />
                    <span className="flex items-center gap-1">
                      {item.value.replace(/^https?:\/\//, "")}
                      <Icon
                        name={IconName.BROWSER_WINDOW_ICON}
                        width="1rem"
                        height="1rem"
                        fill="var(--color-primary-text)"
                      />
                    </span>
                  </a>
                ) : (
                  <>
                    <Icon
                      name={item.icon}
                      width="1.25rem"
                      height="1.25rem"
                      fill="var(--color-secondary-icon)"
                    />
                    <p className="text-sm leading-6 tracking-[0.5px] text-black">
                      {item.value}
                    </p>
                  </>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default CompanyDetailHeader;

export const CompanyDetailHeaderActions: React.FC<{ company: CrmCompanyMetricsType }> = ({ company }) => {
  const theme: Theme = useTheme();
  const { setCompanyModalType, setSelectedCompany } = useCrmStore();
  const translateText = useTranslator("crmModule", "companies");

  return (
    <KebabMenu
      id="company-detail-menu"
      icon={<Icon name={IconName.THREE_DOTS_ICON} width="1rem" height="1rem" />}
      menuItems={[
        {
          id: "delete-company",
          icon: (
            <Icon
              name={IconName.BIN_ICON}
              width="1.25rem"
              height="1.25rem"
              fill="var(--color-semantic-red-text)"
            />
          ),
          text: translateText(["deleteCompanyModal", "menuItemText"]),
          color: "var(--color-semantic-red-text)",
          onClickHandler: () => {
            setSelectedCompany(company);
            setCompanyModalType(CrmModalTypes.DELETE_COMPANY_CONFIRMATION);
          }
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
          backgroundColor: theme.palette.grey[200],
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": { backgroundColor: theme.palette.grey[500] }
        },
        menu: {
          zIndex: 1500,
          "& .MuiPaper-root": {
            backgroundColor: theme.palette.error.main
          }
        },
        menuItem: {
          "&:hover": { backgroundColor: "transparent" }
        }
      }}
    />
  );
};
