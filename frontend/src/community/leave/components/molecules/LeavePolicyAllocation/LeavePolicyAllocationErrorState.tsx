import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  onRetry: () => void;
  isRetrying: boolean;
}

const LeavePolicyAllocationErrorState = ({ onRetry, isRetrying }: Props) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leavePolicyAllocation",
    "errorState"
  );

  return (
    <div className="w-full" role="alert">
      <div className="flex flex-row items-center justify-center gap-2 rounded-xl p-6">
        <p className="body2">{translateText(["message"])}</p>
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="body2 text-primary-text underline disabled:opacity-50"
        >
          {translateText(["retry"])}
        </button>
      </div>
    </div>
  );
};

export default LeavePolicyAllocationErrorState;
