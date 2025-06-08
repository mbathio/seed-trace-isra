import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { toast } from "react-toastify";

export const useApiQuery = <T>(
  key: (string | number)[],
  url: string,
  params?: Record<string, any>,
  options?: any
) => {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get(url, { params });
      return response.data.data;
    },
    ...options,
  });
};

export const useApiMutation = <TData, TVariables>(
  url: string,
  method: "post" | "put" | "patch" | "delete" = "post",
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: any) => void;
    invalidateQueries?: (string | number)[][];
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await api[method](url, variables);
      return response.data;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      options?.invalidateQueries?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    onError: (error: any) => {
      options?.onError?.(error);
      const errorMessage =
        error?.response?.data?.message || "Une erreur s'est produite";
      toast.error(errorMessage);
    },
  });
};
