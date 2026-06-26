import { ReactNode } from "react";

export interface TabItem {
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
}
