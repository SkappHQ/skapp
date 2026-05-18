export const formatLastUpdated = (lastContactAt: string | null): string => {
  if (!lastContactAt) return "Never";
  return new Date(lastContactAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};
