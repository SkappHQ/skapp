import { FC } from "react";

import useGetImageUrl from "~community/common/hooks/useGetImageUrl";

interface Props {
  id: string;
  authPic: string | null;
  firstName: string;
  lastName: string;
  alt: string;
  className?: string;
}

type ResolvedProps = Omit<Props, "authPic"> & { src?: string };

const AVATAR_CLASS =
  "inline-flex size-[160px] shrink-0 items-center justify-center overflow-hidden " +
  "rounded-full border-[6.67px] border-primary-text bg-secondary-accent";

const getInitials = (firstName: string, lastName: string): string =>
  [firstName?.trim()?.charAt(0), lastName?.trim()?.charAt(0)]
    .filter(Boolean)
    .join("")
    .toUpperCase();

const ResolvedBirthdayAvatar: FC<ResolvedProps> = ({
  id,
  src,
  firstName,
  lastName,
  alt,
  className = ""
}) => (
  <div
    id={id}
    role="img"
    aria-label={alt}
    className={`${AVATAR_CLASS} ${className}`}
  >
    {src ? (
      <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />
    ) : (
      <span className="h1c text-secondary-text uppercase">
        {getInitials(firstName, lastName)}
      </span>
    )}
  </div>
);

const UploadedBirthdayAvatar: FC<Props & { authPic: string }> = ({
  authPic,
  ...rest
}) => {
  const imageUrl = useGetImageUrl(authPic);

  return <ResolvedBirthdayAvatar {...rest} src={imageUrl ?? undefined} />;
};

const BirthdayAvatar: FC<Props> = ({ authPic, ...rest }) =>
  authPic ? (
    <UploadedBirthdayAvatar authPic={authPic} {...rest} />
  ) : (
    <ResolvedBirthdayAvatar {...rest} />
  );

export default BirthdayAvatar;
