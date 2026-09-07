"use client";

import { NextPage } from "next";
import { useEffect } from "react";

import AccessDeniedCard from "~community/common/components/atoms/AcessDeniedCard/AccessDeniedCard";
import PageTitle from "~community/common/components/atoms/PageTitle/PageTitle";
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
      <PageTitle title={translateText(["pageHead"])} />
      <AccessDeniedCard />
    </>
  );
};
export default Unauthorized;
