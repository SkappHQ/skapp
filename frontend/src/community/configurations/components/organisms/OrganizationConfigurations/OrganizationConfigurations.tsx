import { FC } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import BusinessUnitsSection from "~community/configurations/components/organisms/BusinessUnitsSection/BusinessUnitsSection";
import WorkLocationsTable from "~community/configurations/components/organisms/WorkLocationsTable/WorkLocationsTable";

const OrganizationConfigurations: FC = () => {
  const { isSuperAdmin } = useSessionData();

  return (
    <div className="flex flex-col gap-8">
      {isSuperAdmin && <BusinessUnitsSection />}
      <WorkLocationsTable />
    </div>
  );
};

export default OrganizationConfigurations;
