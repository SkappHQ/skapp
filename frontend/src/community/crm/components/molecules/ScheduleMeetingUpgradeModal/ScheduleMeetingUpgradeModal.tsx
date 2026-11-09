import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC } from "react";

import UpgradeToCoreModal from "~community/common/components/molecules/UpgradeToCoreModal/UpgradeToCoreModal";
import ROUTES from "~community/common/constants/routes";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import upgradeImage from "~public/image/upgrade-schedule-meeting.png";

interface Props {
  onClose: () => void;
}

const ScheduleMeetingUpgradeModal: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "scheduleMeeting",
    "scheduleUpgradeModal"
  );
  const router = useRouter();
  const { isSuperAdmin } = useSessionData();

  const handleUpgrade = (): void => {
    onClose();
    router.push(`${ROUTES.SETTINGS.BASE}?tab=billing`);
  };

  return (
    <UpgradeToCoreModal
      id="crm-schedule-meeting-upgrade-modal"
      isOpen
      onClose={onClose}
      title={translateText(["title"])}
      content={
        <div className="flex flex-col gap-4">
          <p className="body2 text-black">{translateText(["description"])}</p>
          <p className="body2 text-black">
            {isSuperAdmin
              ? translateText(["upgradeDescription"])
              : translateText(["contactAdminDescription"])}
          </p>
        </div>
      }
      {...(isSuperAdmin && {
        button: {
          children: translateText(["upgradeBtn"]),
          onClick: handleUpgrade
        }
      })}
      imageContent={
        <Image
          src={upgradeImage}
          alt={translateText(["imageAlt"])}
          style={{ width: "100%", height: "100%" }}
        />
      }
    />
  );
};

export default ScheduleMeetingUpgradeModal;
