import { API_URL } from "lib/client";

const webMediaBase = () =>
  API_URL.replace(/\/$/, "").replace(/\/admin$/, "/web");

export const publicMediaUrl = (mediaId: string): string =>
  `${webMediaBase()}/media/${mediaId}`;

export const mediaSrc = (media: {
  id?: string;
  url?: string | null;
} | null | undefined): string => {
  if (!media) return "";
  if (media.id) return publicMediaUrl(media.id);
  return media.url ?? "";
};
