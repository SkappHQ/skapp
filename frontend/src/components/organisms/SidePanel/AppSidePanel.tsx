import { FC } from "react";

import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";

// Rendered unconditionally so the inner SidePanel's close animation plays
// and form state is preserved across opens/closes.
const AppSidePanel: FC = () => {
  return <AddDealSidePanel />;
};

export default AppSidePanel;
