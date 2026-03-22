import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { getBlinkClass } from "~community/common/utils/commonUtil";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { userBulkTemplate } from "~community/people/utils/getConstants";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const UserBulkCsvDownload = () => {
  const { setIsDirectoryModalOpen, setDirectoryModalType } = usePeopleStore(
    (state) => state
  );
  const translateText = useTranslator("peopleModule", "peoples");

  const handleNextBtn = () => {
    setIsDirectoryModalOpen(true);
    setDirectoryModalType(DirectoryModalTypes.UPLOAD_CSV);
  };

  const { ongoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup
  }));

  const [isDownloadBlinking, setIsDownloadBlinking] = useState(false);
  const [isNextBlinking, setIsNextBlinking] = useState(false);

  useEffect(() => {
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setIsDownloadBlinking(true);
    }
  }, [ongoingQuickSetup]);

  const handleDownloadClick = () => {
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setIsDownloadBlinking(false);
      setIsNextBlinking(true);
    }
  };

  return (
    <div>
      <div>
      
        <p className=" font-normal pb-6">
          {translateText(["downloadCsvDes"])}
        </p>
        <div className="flex flex-row justify-end gap-3 mb-4">
            <a
              href={userBulkTemplate.url}
              download={userBulkTemplate.fileName}
              target="_blank"
              rel="noreferrer"
              onClick={handleDownloadClick}
              tabIndex={-1}
            >
              <ButtonV2
                variant={"secondary"}
              className={getBlinkClass(isDownloadBlinking)}
                icon={<Icon name={IconName.DOWNLOAD_ICON} fill="var( --color-primary-text)"  />}
                iconPosition="end"
              >
                {translateText(["downloadCsvButton"])}
              </ButtonV2>
            </a>
            <ButtonV2
              variant={"primary"}
              onClick={() => handleNextBtn()}
        className={getBlinkClass(isNextBlinking)}
              icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
              iconPosition="end"
            >
              {translateText(["nextButton"])}
            </ButtonV2>
        </div>
      </div>
    </div>
  );
};

export default UserBulkCsvDownload;
