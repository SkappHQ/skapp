import { Box, useTheme } from "@mui/material";
import React from "react";

import { TabPanelProps } from "~community/common/types/TabsTypes";

import styles from "./styles";

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  const theme = useTheme();
  const classes = styles(theme); // Get styles with theme

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Box sx={classes.tabPanelBox}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
