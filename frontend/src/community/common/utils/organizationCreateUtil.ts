export const getPasswordStrength = (password: string) => {
  return {
    0: /[a-z]/.test(password),
    1: password.length >= 8,
    2: /[A-Z]/.test(password),
    3: /[`~!@#$%^&*()-+{[\]\\|=,.//?;<>':"_-]/.test(password),
    4: /\d/.test(password)
  };
};
