import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import KebabMenu from "~community/common/components/molecules/KebabMenu/KebabMenu";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyType } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

interface Props {
  company: CrmCompanyType;
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

      <div className="flex items-center justify-between max-w-[757px]">
        {infoItems.map(
          (item, index) =>
            item.value && (
              <div key={index} className="flex items-center gap-3">
                <Icon
                  name={item.icon}
                  width="1.25rem"
                  height="1.25rem"
                  fill="#68707F"
                />
                {item.isLink ? (
                  <a
                    href={
                      item.value.startsWith("http")
                        ? item.value
                        : `https://${item.value}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm leading-6 tracking-[0.5px]"
                    style={{ color: "#2a61a0", textDecoration: "underline" }}
                  >
                    {item.value}
                    <Icon
                      name={IconName.BROWSER_WINDOW_ICON}
                      width="1rem"
                      height="1rem"
                      fill="#2a61a0"
                    />
                  </a>
                ) : (
                  <p className="text-sm leading-6 tracking-[0.5px] text-black">
                    {item.value}
                  </p>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default CompanyDetailHeader;

export const CompanyDetailHeaderActions: React.FC = () => {
  const { setCompanyModalType } = useCrmStore();

  return (
    <KebabMenu
      id="company-detail-menu"
      icon={
        <Icon
          name={IconName.THREE_DOTS_ICON}
          width="1rem"
          height="1rem"
        />
      }
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
          zIndex: 1500,
          "& .MuiPaper-root": {
            backgroundColor: "#FEE2E2"
          }
        },
        menuItem: {
          "&:hover": { backgroundColor: "transparent" }
        }
      }}
    />
  );
};
