export const mediaSrc = (media: {
  id?: string;
  url?: string | null;
} | null | undefined): string => {
  if (!media?.id) return media?.url ?? "";
  // Same-origin proxy — avoids localhost BASE_URL in the browser.
  return `/media/${media.id}`;
};
