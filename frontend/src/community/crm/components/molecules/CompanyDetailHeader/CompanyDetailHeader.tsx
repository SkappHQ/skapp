import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { removeHttpsWwwFromUrl } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import { CrmCompanyType } from "~community/crm/types/CommonTypes";

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
      <div className="flex items-center justify-between max-w-[75%]">
        {infoItems.map(
          (item) =>
            item.value && (
              <div key={item.icon} className="flex items-center gap-3">
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
                    <Icon
                      name={item.icon}
                      width="1.25rem"
                      height="1.25rem"
                      fill="var(--color-primary-text)"
                    />
                    <span className="flex items-center gap-1">
                      {removeHttpsWwwFromUrl(item.value)}
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
                    <Icon
                      name={item.icon}
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

export default CompanyDetailHeader;
