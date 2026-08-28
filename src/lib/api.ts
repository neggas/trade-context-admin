import { adminFetch, adminUpload } from "lib/client";
import type {
  Article,
  ArticleInput,
  ArticleListItem,
  ArticleType,
  AdminStats,
  Media,
} from "types";

export async function getAdminStats(token?: string): Promise<AdminStats> {
  return adminFetch<AdminStats>("/stats", { token });
}

export async function getAdminArticles(
  type?: ArticleType,
  token?: string
): Promise<ArticleListItem[]> {
  const query = type ? `?type=${type}` : "";
  return adminFetch<ArticleListItem[]>(`/articles${query}`, { token });
}

export async function getAdminArticle(
  id: string,
  token?: string
): Promise<Article | null> {
  return adminFetch<Article | null>(`/articles/${id}`, { token });
}

export async function createArticle(
  input: ArticleInput,
  token?: string
): Promise<Article> {
  return adminFetch<Article>("/articles", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>,
  token?: string
): Promise<Article | null> {
  return adminFetch<Article | null>(`/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
    token,
  });
}

export async function deleteArticle(
  id: string,
  token?: string
): Promise<void> {
  return adminFetch<void>(`/articles/${id}`, {
    method: "DELETE",
    token,
  });
}

// ---- Media ----

export async function uploadArticleCover(
  articleId: string,
  file: File,
  alt: string | null,
  token?: string
): Promise<Media> {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);
  return adminUpload<Media>(`/articles/${articleId}/cover`, {
    method: "POST",
    body: form,
    token,
  });
}

export async function uploadSectionMedia(
  articleId: string,
  sectionId: string,
  file: File,
  alt: string | null,
  token?: string
): Promise<Media> {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);
  return adminUpload<Media>(
    `/articles/${articleId}/sections/${sectionId}/media`,
    { method: "POST", body: form, token }
  );
}

export async function deleteMedia(
  articleId: string,
  mediaId: string,
  token?: string
): Promise<void> {
  return adminUpload<void>(`/articles/${articleId}/media/${mediaId}`, {
    method: "DELETE",
    token,
  });
}
