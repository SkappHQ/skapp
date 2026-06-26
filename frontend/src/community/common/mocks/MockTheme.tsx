import { ThemeProvider } from "@mui/material/styles";

import { theme } from "~community/common/theme/theme";

const MockTheme = ({ children }: any) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MockTheme;
