import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  onRetry: () => void;
}

const LeavePoliciesErrorState: FC<Props> = ({ onRetry }) => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  return (
    <div className="mt-4 flex flex-col items-center gap-4 rounded-lg border border-secondary-accent px-6 py-16 text-center">
      <p className="subtitle2 text-black">
        {translateText(["errorStateTitle"])}
      </p>
      <p className="body2 text-secondary-text">
        {translateText(["errorStateDescription"])}
      </p>
      <ButtonV2 variant="tertiary" size="md" onClick={onRetry}>
        {translateText(["retryBtnTxt"])}
      </ButtonV2>
    </div>
  );
};

export default LeavePoliciesErrorState;
