import { useRouter } from "next/navigation";
import React from "react";
import { Trans } from "react-i18next";

import templateUpgradeImage from "~community/common/assets/images/project-upgrade-to-core.png";
import UpgradeToCoreModal from "~community/common/components/molecules/UpgradeToCoreModal/UpgradeToCoreModal";
import ROUTES from "~community/common/constants/routes";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface ProjectUpgradeToCoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectUpgradeToCoreModal: React.FC<ProjectUpgradeToCoreModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isSuperAdmin } = useSessionData();
  const router = useRouter();
  const translateText = useTranslator("pmModule", "projectUpgradeModal");

  return (
    <UpgradeToCoreModal
      id="project-upgrade-to-core-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={translateText(["title"])}
      content={
        <>
          <p style={{ marginBottom: "16px" }} className="body1">
            <Trans
              i18nKey="pmModule.projectUpgradeModal.descriptionPart1"
              components={{ bold: <span className="subtitle3" /> }}
            />
          </p>
          <p className="body1">
            {isSuperAdmin
              ? translateText(["descriptionPartTwoSuperAdmin"])
              : translateText(["descriptionPartTwoPmAdmin"])}
          </p>
        </>
      }
      button={
        isSuperAdmin
          ? {
              children: translateText(["btnLabel"]),
              onClick: () => {
                onClose();
                router.push(`${ROUTES.SETTINGS.BASE}?tab=billing`);
              }
            }
          : undefined
      }
      image={{
        src: templateUpgradeImage.src || "/default-upgrade-image.png",
        alt: translateText(["logoAltText"])
      }}
    />
  );
};

export default ProjectUpgradeToCoreModal;
