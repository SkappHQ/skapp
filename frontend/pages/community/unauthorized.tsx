import { NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";

import AccessDeniedCard from "~community/common/components/atoms/AcessDeniedCard/AccessDeniedCard";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";

const Unauthorized: NextPage = () => {
  const translateText = useTranslator("unauthorized");

  const setBreadcrumbs = useCommonStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([]);
  }, []);

  return (
    <>
      <Head>
        <title>{translateText(["pageHead"])}</title>
      </Head>
      <AccessDeniedCard />
    </>
  );
};
export default Unauthorized;
