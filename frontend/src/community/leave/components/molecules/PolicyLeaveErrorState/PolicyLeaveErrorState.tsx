interface Props {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  isRetrying: boolean;
}

const PolicyLeaveErrorState = ({
  message,
  retryLabel,
  onRetry,
  isRetrying
}: Props) => {
  return (
    <div className="w-full" role="alert">
      <div className="flex flex-row items-center justify-center gap-2 rounded-xl p-6">
        <p className="body2">{message}</p>
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="body2 text-primary-text underline disabled:opacity-50"
        >
          {retryLabel}
        </button>
      </div>
    </div>
  );
};

export default PolicyLeaveErrorState;
