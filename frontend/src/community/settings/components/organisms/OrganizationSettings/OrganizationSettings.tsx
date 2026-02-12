import { Box, Divider } from "@mui/material";
import { JSX } from "react";

import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";

import BrandingDetails from "../BrandingDetails/BrandingDetails";
import OrganizationDetails from "../OrganizationDetails/OrganizationDetails";

const OrganizationSettings = (): JSX.Element => {
  const { data: organizationResponse } = useGetOrganization();
  const organizationDetails = organizationResponse?.results[0];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          gap: "2rem",
          flexDirection: "column"
        }}
      >
        <OrganizationDetails organizationDetails={organizationDetails} />
        <Divider />
        <BrandingDetails organizationDetails={organizationDetails} />
      </Box>
    </Box>
  );
};

export default OrganizationSettings;
