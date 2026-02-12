import { Box, Divider } from "@mui/material";
import { JSX } from "react";

import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";

import BrandingDetails from "../BrandingDetails/BrandingDetails";
import OrganizationDetails from "../OrganizationDetails/OrganizationDetails";

const OrganizationSettings = (): JSX.Element => {
  const { data: organizationDetails } = useGetOrganization();

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
        <OrganizationDetails />
        <Divider />
        <BrandingDetails
          themeColor={organizationDetails.results[0].themeColor}
          logo={organizationDetails.results[0].organizationLogo}
        />
      </Box>
    </Box>
  );
};

export default OrganizationSettings;
