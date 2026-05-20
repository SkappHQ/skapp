export const formatLastUpdated = (lastContactAt: string | null): string => {
  if (!lastContactAt) return "Never";
  const date = new Date(lastContactAt);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  // Helper for ordinal suffix
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return `${day}${getOrdinal(day)} ${month} ${year}`;
};
