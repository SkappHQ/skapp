export const useGetEnvironment = () => {
  const env = process.env.NEXT_PUBLIC_MODE;
  return env;
};
