export const getDataFromLocalStorage = (key: string): any => {
  const data: any = localStorage?.getItem(key);
  const jsonData = JSON.parse(data);
  return jsonData;
};

export const setDataToLocalStorage = async <T>(
  key: string,
  data: T
): Promise<void> => {
  localStorage?.setItem(key, JSON.stringify(data));
};

export const removeDataFromLocalStorage = async (
  key: string
): Promise<void> => {
  localStorage?.removeItem(key);
};
