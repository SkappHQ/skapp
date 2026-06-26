import { StyleProps } from "~community/common/types/CommonTypes";

const styles = (): StyleProps => ({
  panel: { display: "flex", gap: "3rem", justifyContent: "center" },
  legendItem: { display: "flex", gap: ".3rem", alignItems: "center" },
  text: { fontSize: 12 }
});

export default styles;
