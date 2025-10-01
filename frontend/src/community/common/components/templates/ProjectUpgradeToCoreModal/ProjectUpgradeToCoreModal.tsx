import { useRouter } from "next/navigation";
import React from "react";

import templateUpgradeImage from "~community/common/assets/images/project-upgrade-to-core.png";
import UpgradeToCoreModal from "~community/common/components/molecules/UpgradeToCoreModal/UpgradeToCoreModal";
import ROUTES from "~community/common/constants/routes";
import useSessionData from "~community/common/hooks/useSessionData";

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

  const renderCustomMessage = () =>
    isSuperAdmin
      ? "Experience the full potential of Skapp by upgrading to Skapp Core."
      : "Please contact your administrator to unlock this feature for your organization.";

  return (
    <UpgradeToCoreModal
      id="project-upgrade-to-core-modal"
      isOpen={isOpen}
      closeIconButton={{
        onClick: onClose
      }}
      title={{ children: "Upgrade to Skapp Core" }}
      description={{
        children: (
          <>
            <p
              style={{ color: "#666", marginBottom: "16px" }}
              className="body1"
            >
              You can only create up to <strong>5 projects</strong> on the Free
              plan. Upgrade to Skapp Core to create more projects and scale your
              work without limits.
            </p>
            <p style={{ color: "#666" }} className="body1">
              {renderCustomMessage()}
            </p>
          </>
        )
      }}
      button={
        isSuperAdmin
          ? {
              children: "Upgrade Now",
              onClick: () => {
                onClose();
                router.push(ROUTES.SUBSCRIPTION);
              }
            }
          : undefined
      }
      image={{
        src: templateUpgradeImage.src || "/default-upgrade-image.png",
        alt: "Upgrade to Core Plan"
      }}
      onClose={onClose}
    />
  );
};

export default ProjectUpgradeToCoreModal;
