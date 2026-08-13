import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import useFormChangeDetector from "~community/people/hooks/useFormChangeDetector";

const RouteChangeAreYouSureModal: React.FC = () => {
  const [isAreYouSureModalOpen, setIsAreYouSureModalOpen] = useState(false);
  const allowRouteChangeRef = useRef<boolean>(false);
  const targetRouteRef = useRef<string>("");

  const router = useRouter();

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );
  const { hasChanged } = useFormChangeDetector();

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasChanged) {
      e.preventDefault();
      return "";
    }
  };

  const handleRouteChange = (url: string) => {
    if (allowRouteChangeRef.current) return;
    targetRouteRef.current = url;
    if (hasChanged && !isAreYouSureModalOpen) {
      setIsAreYouSureModalOpen(true);
      router.events.emit("routeChangeError");
      throw "routeChange aborted";
    }
  };

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleRouteChange, handleBeforeUnload]);

  const handleModalResume = () => {
    setIsAreYouSureModalOpen(false);
  };

  const handleModalLeave = async () => {
    setIsAreYouSureModalOpen(false);
    allowRouteChangeRef.current = true;
    const targetRoute = targetRouteRef.current;
    await router.push(targetRoute);
  };

  return (
    <Modal
      isModalOpen={isAreYouSureModalOpen}
      onCloseModal={() => {
        setIsAreYouSureModalOpen(false);
      }}
      title={translateText(["areYouSureModalTitle"])}
      isClosable={false}
      modalWrapperStyles={{
        zIndex: ZIndexEnums.MODAL
      }}
    >
      <AreYouSureModal
        onPrimaryBtnClick={handleModalResume}
        onSecondaryBtnClick={handleModalLeave}
      />
    </Modal>
  );
};

export default RouteChangeAreYouSureModal;
