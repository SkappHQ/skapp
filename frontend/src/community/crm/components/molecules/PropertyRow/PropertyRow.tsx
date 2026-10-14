import { FC, ReactNode } from "react";

interface Props {
  label: string;
  required?: boolean;
  children: ReactNode;
}

const PropertyRow: FC<Props> = ({ label, required = false, children }) => (
  <div className="flex w-full items-center gap-4 min-h-11">
    <div className="w-30 shrink-0 flex items-center">
      <span className="subtitle3 text-black whitespace-nowrap">
        {label}
        {required && (
          <span className="text-semantic-red-accent ml-1" aria-hidden="true">
            *
          </span>
        )}
      </span>
    </div>
    <div className="flex-1 min-w-0 flex items-center">{children}</div>
  </div>
);

export default PropertyRow;
