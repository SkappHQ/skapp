import React, { useState } from "react";

import { PasswordFieldStates, PasswordFieldTypes } from "../types/AuthTypes";

const usePasswordVisibilityToggle = (
  initialStates: PasswordFieldStates[]
): {
  getPasswordType: (id: string) => PasswordFieldTypes;
  getPasswordVisibilityState: (id: string) => boolean;
  togglePasswordVisibility: (
    id: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
} => {
  const [passwordFieldStates, setPasswordFieldStates] =
    useState<PasswordFieldStates[]>(initialStates);

  const getPasswordType = (id: string) => {
    const passwordType = passwordFieldStates.find(
      (state) => state.id === id
    )?.type;

    return passwordType ?? "password";
  };

  const getPasswordVisibilityState = (id: string) => {
    const isPasswordVisibilityState = passwordFieldStates.find(
      (state) => state.id === id
    )?.isPasswordVisible;

    return isPasswordVisibilityState ?? false;
  };

  const togglePasswordVisibility = (
    id: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setPasswordFieldStates((prevStates) =>
      prevStates.map((state) =>
        state.id === id
          ? {
              ...state,
              type: state.type === "text" ? "password" : "text",
              isPasswordVisible: !state.isPasswordVisible
            }
          : state
      )
    );
  };

  return {
    getPasswordType,
    getPasswordVisibilityState,
    togglePasswordVisibility
  };
};

export default usePasswordVisibilityToggle;
