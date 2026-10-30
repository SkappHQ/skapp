import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  analytic: { fontSize: "2rem", fontWeight: 700 },
  chipRow: { display: "flex", gap: 1, alignItems: "center", pt: 1 },
  counts: { display: "flex", gap: 1 },
  count: { display: "flex", alignItems: "center", gap: 0.5 }
});

export default styles;
