import { FC } from "react";

export interface ContactInfoItemSkeletonProps {
  widthClass?: string;
  hasEndIcon?: boolean;
}

export const ContactInfoItemSkeleton: FC<ContactInfoItemSkeletonProps> = ({
  widthClass = "w-[80px]",
  hasEndIcon = false
}) => {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="h-[13.33px] w-[16.67px] rounded-sm bg-gray-100 shrink-0" />
      <div className={`h-2.5 ${widthClass} rounded-sm bg-gray-100`} />
      {hasEndIcon && (
        <div className="h-[13.33px] w-[16.67px] rounded bg-gray-100 shrink-0 ml-1" />
      )}
    </div>
  );
};

export const ContactHeaderSkeleton: FC = () => {
  return (
    <div className="w-full flex flex-col gap-3 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-[17px] w-[93px] rounded-sm bg-gray-100" />
        <div className="h-2.5 w-[135px] rounded-sm bg-gray-100" />
      </div>
      <div className="flex items-center justify-between max-w-[629px] w-full">
        <ContactInfoItemSkeleton widthClass="w-[86px]" />
        <ContactInfoItemSkeleton widthClass="w-[68px]" />
        <ContactInfoItemSkeleton widthClass="w-[34px]" hasEndIcon />
      </div>
    </div>
  );
};
