import { useMutation } from "@tanstack/react-query";
import { userApi, type LoginPayload, type RegisterPayload } from "./userApi";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => userApi.login(payload),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => userApi.register(payload),
  });
};
