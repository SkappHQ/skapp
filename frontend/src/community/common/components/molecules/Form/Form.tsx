import { type FormEvent, JSX, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onReset?: (event: FormEvent<HTMLFormElement>) => void;
}

const Form = ({
  children,
  className,
  onSubmit,
  onReset
}: Props): JSX.Element => {
  return (
    <form
      className={className}
      onSubmit={onSubmit}
      onReset={onReset}
      autoComplete="off"
    >
      {children}
    </form>
  );
};

export default Form;
