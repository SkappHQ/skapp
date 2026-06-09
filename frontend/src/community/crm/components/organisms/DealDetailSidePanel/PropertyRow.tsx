import { FC, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertyRowProps {
  label: string;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// PropertyRow
// ---------------------------------------------------------------------------

const PropertyRow: FC<PropertyRowProps> = ({ label, children }) => (
  <div className="flex w-full items-center py-1">
    <span className="subtitle3 w-[120px] shrink-0 text-secondary-text">
      {label}
    </span>
    <div className="flex-1 min-w-0 flex items-center">{children}</div>
  </div>
);

export default PropertyRow;
