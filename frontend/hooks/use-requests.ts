import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSubmitCertificateRequest() {
  return useMutation({
    mutationFn: (courseId: string) =>
      api.post("/requests/certificate", { courseId }).then((r) => r.data),
  });
}

export function useSubmitQuizRetryRequest() {
  return useMutation({
    mutationFn: (quizId: string) =>
      api.post("/requests/quiz-retry", { quizId }).then((r) => r.data),
  });
}

export function useCertificateRequests() {
  return useQuery({
    queryKey: ["certificate-requests"],
    queryFn: () => api.get("/requests/certificate").then((r) => r.data),
    staleTime: 15_000,
  });
}

export function useQuizRetryRequests() {
  return useQuery({
    queryKey: ["quiz-retry-requests"],
    queryFn: () => api.get("/requests/quiz-retry").then((r) => r.data),
    staleTime: 15_000,
  });
}

export function useReviewCertificateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      api.patch(`/requests/certificate/${id}/review`, { action }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate-requests"] });
    },
  });
}

export function useReviewQuizRetryRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      api.patch(`/requests/quiz-retry/${id}/review`, { action }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quiz-retry-requests"] });
    },
  });
}
