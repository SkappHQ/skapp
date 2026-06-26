import { Box, Tab, Tabs } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";

import { TabsComponentProps } from "~community/common/types/TabsTypes";

import TabPanel from "./TabPanel";
import styles from "./styles";

// TabsContainer component
const TabsContainer: React.FC<TabsComponentProps> = ({ tabs }) => {
  const [value, setValue] = useState<number>(0);
  const theme = useTheme();
  const classes = styles(theme);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={classes.tabsContainer}>
      {tabs.length > 1 && (
        <Box sx={classes.tabsBox}>
          <Tabs
            value={value}
            onChange={handleChange}
            TabIndicatorProps={{ sx: classes.indicator }}
          >
            {tabs.map((tab, index) => (
              <Tab
                sx={classes.tab}
                key={index}
                label={tab.label}
                id={`tab-${index}`}
                aria-controls={`tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>
      )}
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
};

export default TabsContainer;
