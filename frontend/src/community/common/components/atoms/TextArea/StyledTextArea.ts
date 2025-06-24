import { styled } from "@mui/material";

interface StyledTextAreaProps {
  textColor?: string;
}

const StyledTextArea = styled("textarea")<StyledTextAreaProps>(
  ({ theme, textColor }) => ({
    width: "100%",
    borderRadius: "0.5rem",
    border: "none",
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: "400",
    color: textColor || theme.palette.text.secondary,
    fontSize: "1rem",
    backgroundColor: theme.palette.grey[100],
    height: "5rem",
    resize: "none",
    "&:focus": {
      color: textColor || theme.palette.primary.dark,
      border: "none",
      outline: "none"
    }
  })
);

export default StyledTextArea;
