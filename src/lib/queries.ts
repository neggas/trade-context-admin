import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  getAdminStats,
  getAdminArticles,
  getAdminArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadArticleCover,
  uploadSectionMedia,
  deleteMedia,
} from "lib/api";
import type { ArticleInput, ArticleType } from "types";

// Query keys
export const queryKeys = {
  stats: ["admin", "stats"] as const,
  articles: (type?: ArticleType) => ["admin", "articles", type] as const,
  article: (id: string) => ["admin", "articles", id] as const,
};

// Queries
export function useAdminStats() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => getAdminStats(token),
    enabled: !!token,
  });
}

export function useAdminArticles(type?: ArticleType) {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  return useQuery({
    queryKey: queryKeys.articles(type),
    queryFn: () => getAdminArticles(type, token),
    enabled: !!token,
  });
}

export function useAdminArticle(id: string | undefined) {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  return useQuery({
    queryKey: queryKeys.article(id ?? ""),
    queryFn: () => getAdminArticle(id!, token),
    enabled: !!id && !!token,
  });
}

// Mutations
export function useCreateArticle() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ArticleInput) => createArticle(input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

export function useUpdateArticle() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ArticleInput> }) =>
      updateArticle(id, input, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.article(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

export function useDeleteArticle() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArticle(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}

// Media mutations
export function useUploadCover() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      articleId,
      file,
      alt,
    }: {
      articleId: string;
      file: File;
      alt: string | null;
    }) => uploadArticleCover(articleId, file, alt, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.article(variables.articleId),
      });
    },
  });
}

export function useUploadSectionMedia() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      articleId,
      sectionId,
      file,
      alt,
    }: {
      articleId: string;
      sectionId: string;
      file: File;
      alt: string | null;
    }) => uploadSectionMedia(articleId, sectionId, file, alt, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.article(variables.articleId),
      });
    },
  });
}

export function useDeleteMedia() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      articleId,
      mediaId,
    }: {
      articleId: string;
      mediaId: string;
    }) => deleteMedia(articleId, mediaId, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.article(variables.articleId),
      });
    },
  });
}
