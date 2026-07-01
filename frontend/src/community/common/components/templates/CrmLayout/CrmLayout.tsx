import ContentLayout, {
  ContentLayoutProps
} from "~community/common/components/templates/ContentLayout/ContentLayout";
import CrmLimitModalController from "~enterprise/crm/components/organisms/CrmLimitModalController/CrmLimitModalController";

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
