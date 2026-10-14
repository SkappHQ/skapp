import { FC, ReactNode } from "react";

interface Props {
  label: string;
  required?: boolean;
  children: ReactNode;
}

const PropertyRow: FC<Props> = ({ label, required = false, children }) => (
  <div className="flex min-h-11 w-full items-center gap-4">
    <div className="flex w-30 shrink-0 items-center">
      <span className="subtitle3 whitespace-nowrap text-black">
        {label}
        {required && (
          <span className="ml-1 text-semantic-red-accent" aria-hidden="true">
            *
          </span>
        )}
      </span>
    </div>
    <div className="flex min-w-0 flex-1 items-center">{children}</div>
  </div>
);

export default PropertyRow;
