import CrmLimitModalController from "~enterprise/crm/components/organisms/CrmLimitModalController/CrmLimitModalController";

import ContentLayout from "../ContentLayout/ContentLayout";
import { ContentLayoutProps } from "../ContentLayout/ContentLayout";

interface CrmLayoutProps extends ContentLayoutProps {}

const CrmLayout = (props: CrmLayoutProps) => {
  const { children, ...rest } = props;
  return (
    <>
      <ContentLayout {...rest}>{children}</ContentLayout>
      <CrmLimitModalController />
    </>
  );
};

export default CrmLayout;
