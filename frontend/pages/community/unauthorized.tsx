import { NextPage } from "next";
import Head from "next/head";

import AccessDeniedCard from "~community/common/components/atoms/AcessDeniedCard/AccessDeniedCard";
import { useTranslator } from "~community/common/hooks/useTranslator";

const Unauthorized: NextPage = () => {
  const translateText = useTranslator("unauthorized");

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
