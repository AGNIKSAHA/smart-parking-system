import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/redux-hooks";
import { authApi } from "./auth.api";
import { setAuthBootstrapped, setUser } from "./auth.slice";
import { writeStoredAuthUser } from "./auth.storage";

export const useAuthUser = () => useAppSelector((state) => state.auth.user);
export const useAuthBootstrapped = () => useAppSelector((state) => state.auth.bootstrapped);

export const useSessionBootstrap = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    retry: false,
    throwOnError: false
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setUser(query.data));
      writeStoredAuthUser(query.data);
      dispatch(setAuthBootstrapped(true));
    }

    const axiosError = query.error as AxiosError | null;
    if (query.isError && axiosError?.response?.status === 401 && user) {
      dispatch(setUser(null));
      writeStoredAuthUser(null);
      dispatch(setAuthBootstrapped(true));
      return;
    }

    if (query.isError || query.isSuccess) {
      dispatch(setAuthBootstrapped(true));
    }
  }, [dispatch, query.data, query.error, query.isError, user]);

  return query;
};

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      dispatch(setUser(user));
      dispatch(setAuthBootstrapped(true));
      writeStoredAuthUser(user);
      navigate("/dashboard");
      toast.success("Logged in");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message;
      if (message?.toLowerCase().includes("email not verified")) {
        toast.error("Email not verified. Check inbox and verify first.");
        return;
      }
      toast.error(message ?? "Login failed");
    }
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created. Verification email sent.");
      navigate("/login");
    },
    onError: () => toast.error("Registration failed")
  });
};

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: authApi.verifyEmail
  });

export const useResendVerification = () =>
  useMutation({
    mutationFn: authApi.resendVerification
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: authApi.forgotPassword
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: authApi.resetPassword
  });

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(setUser(null));
      dispatch(setAuthBootstrapped(true));
      writeStoredAuthUser(null);
      navigate("/login");
    }
  });
};
