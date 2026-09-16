import { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabPanelProps {
  children: ReactNode;
  value: number;
  index: number;
}

export interface TabsComponentProps {
  tabs: TabItem[];
  activeTabIndex: number;
  onTabChange: (index: number) => void;
}
