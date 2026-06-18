export const getBillingSuccessToast = (
  _tier: string | null | undefined,
  _isTrial: boolean,
  translateFn: (keys: string[]) => string
) => {
  return {
    title: translateFn(["subscriptionSuccessToastTitle"]),
    description: translateFn(["subscriptionSuccessToastDescription"])
  };
};
