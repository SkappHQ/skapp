import { JSX, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onSubmit?: () => void;
}

const Form = ({ children, onSubmit }: Props): JSX.Element => {
  return (
    <form onSubmit={onSubmit} autoComplete="off">
      {children}
    </form>
  );
};

export default Form;
