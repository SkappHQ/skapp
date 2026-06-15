import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatISODateWithSuffix } from "~community/common/utils/dateTimeUtils";

interface Props {
  name: string;
  lastModifiedDate: string;
}

const SidePanelContactHeader: FC<Props> = ({ name, lastModifiedDate }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  return (
    <div className="flex flex-col gap-2 pl-2">
      <h2 className="h1 leading-[24px] tracking-[0.07px] text-black">{name}</h2>
      <p className="body2 leading-[24px] text-secondary-text">
        {`${translateText(["lastUpdated"])} : ${formatISODateWithSuffix(lastModifiedDate)}`}
      </p>
    </div>
  );
};

export default SidePanelContactHeader;
