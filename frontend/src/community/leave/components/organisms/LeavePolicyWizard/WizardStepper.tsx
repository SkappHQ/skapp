import { TickIcon } from "@rootcodelabs/skapp-ui";
import { Fragment, JSX } from "react";

interface Props {
  steps: string[];
  activeStep: number;
}

const WizardStepper = ({ steps, activeStep }: Props): JSX.Element => {
  return (
    <ol className="flex max-w-4xl items-center gap-3">
      {steps.map((label, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;

        return (
          <Fragment key={label}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className="w-10 flex-none border-t-2 border-dashed border-gray-300"
              />
            )}
            <li
              className="flex items-center gap-2"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={`flex size-8 flex-none items-center justify-center rounded-full text-sm ${
                  isCompleted
                    ? "bg-blue-200 text-blue-700"
                    : isActive
                      ? "border border-blue-600 bg-blue-100 text-blue-700"
                      : "border border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <TickIcon className="size-4" fill="currentColor" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`whitespace-nowrap text-sm ${
                  isCompleted || isActive
                    ? "font-medium text-blue-700"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
};

export default WizardStepper;
