import { FC } from "react";

interface Props {
  message: string | undefined;
}

const FieldError: FC<Props> = ({ message }) =>
  message ? (
    <p role="alert" className="body2 text-semantic-red-text">
      {message}
    </p>
  ) : null;

export default FieldError;
