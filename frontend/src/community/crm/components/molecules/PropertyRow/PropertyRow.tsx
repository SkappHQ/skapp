import { FC, ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

const PropertyRow: FC<Props> = ({ label, children }) => (
  <div className="flex items-center gap-4 min-h-11">
    <div className="w-30 shrink-0">
      <span className="text-[14px] font-medium text-black whitespace-nowrap">
        {label}
      </span>
    </div>
    <div className="flex-1 min-w-0 flex items-center">{children}</div>
  </div>
);

export default PropertyRow;
