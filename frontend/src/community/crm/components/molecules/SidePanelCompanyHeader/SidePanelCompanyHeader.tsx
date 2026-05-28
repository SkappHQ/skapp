import React, { JSX } from "react";

import {
  BuildingIcon,
  LocationIcon,
  PhoneIcon,
  BrowserIcon
} from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName, IconProps } from "~community/common/types/IconTypes";
import { CrmCompanyType } from "~community/crm/types/CommonTypes";

interface InfoItem {
  icon: (props: IconProps) => JSX.Element;
  key: string;
  value: string;
  isLink: boolean;
}

interface Props {
  company: CrmCompanyType;
}

const SidePanelCompanyHeader: React.FC<Props> = ({ company }) => {
  const infoItems: InfoItem[] = [
    {
      icon: BrowserIcon,
      key: "web",
      value: company.website,
      isLink: true
    },
    {
      icon: PhoneIcon,
      key: "phone",
      value: company.contactNumber,
      isLink: false
    },
    {
      icon: LocationIcon,
      key: "location",
      value: company.address,
      isLink: false
    },
    {
      icon: BuildingIcon,
      key: "building",
      value: company.industry,
      isLink: false
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between max-w-[75%]">
        {infoItems.map(
          (item) =>
            item.value && (
              <div key={item.key} className="flex items-center gap-3">
                {item.isLink ? (
                  <a
                    href={`${item.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 body2 text-secondary-text"
                    style={{
                      color: "var(--color-primary-text)",
                      textDecoration: "underline"
                    }}
                  >
                    <item.icon
                      width="1.25rem"
                      height="1.25rem"
                      fill="var(--color-primary-text)"
                    />
                    <span className="flex items-center gap-1">
                      {item.value}
                      <Icon
                        name={IconName.POP_OUT_ICON}
                        width="1rem"
                        height="1rem"
                        fill="var(--color-primary-text)"
                      />
                    </span>
                  </a>
                ) : (
                  <>
                    <item.icon
                      width="1.25rem"
                      height="1.25rem"
                      fill="var(--color-secondary-icon)"
                    />
                    <p className="body2 text-black">{item.value}</p>
                  </>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default SidePanelCompanyHeader;
