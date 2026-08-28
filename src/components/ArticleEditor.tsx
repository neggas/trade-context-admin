"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Input,
  Textarea,
  Select,
  Button,
  Flex,
  Grid,
  FormControl,
  FormLabel,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  useAdminArticle,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useUploadCover,
  useUploadSectionMedia,
  useDeleteMedia,
} from "lib/queries";
import type {
  Article,
  ArticleInput,
  ArticleType,
  Media,
  SectionInput,
  SectionTitleSize,
  TradeDirection,
  TradeStatus,
} from "types";
import ImageCropModal from "./ImageCropModal";

type CropJob =
  | { file: File; kind: "cover" }
  | { file: File; kind: "section"; index: number };

type SectionState = {
  id?: string;
  title: string;
  titleSize: SectionTitleSize;
  content: string;
  media: Media[];
};

type Props = {
  type: ArticleType;
  articleId?: string;
};

const isVideo = (mime?: string) => !!mime && mime.startsWith("video/");

export default function ArticleEditor({ type, articleId }: Props) {
  const router = useRouter();
  const listPath = type === "live" ? "/live" : "/backtest";

  const { data: article, isLoading } = useAdminArticle(articleId);
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();
  const uploadCoverMutation = useUploadCover();
  const uploadSectionMediaMutation = useUploadSectionMedia();
  const deleteMediaMutation = useDeleteMedia();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const sectionMediaInputRef = useRef<HTMLInputElement>(null);
  const pendingSectionIndex = useRef<number | null>(null);

  const [persistedId, setPersistedId] = useState<string | undefined>(articleId);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [sections, setSections] = useState<SectionState[]>([
    { title: "", titleSize: "h2", content: "", media: [] },
  ]);
  const [coverMedia, setCoverMedia] = useState<Media | null>(null);
  const [persisting, setPersisting] = useState(false);
  const [cropJob, setCropJob] = useState<CropJob | null>(null);

  // Trade fields
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [resultR, setResultR] = useState("");
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>("open");
  const [openedAt, setOpenedAt] = useState("");
  const [closedAt, setClosedAt] = useState("");

  useEffect(() => {
    if (articleId) setPersistedId(articleId);
  }, [articleId]);

  // Hydrate once per loaded article id so later query invalidations
  // (uploads) don't wipe in-progress typing.
  useEffect(() => {
    if (!article) return;

    setTitle(article.title);
    setSlug(article.slug);
    setExcerpt(article.excerpt ?? "");
    setStatus(article.status === "published" ? "published" : "draft");
    setPublishedAt(
      article.publishedAt ? article.publishedAt.split("T")[0] : ""
    );
    setSections(
      article.sections.length > 0
        ? article.sections.map((s) => ({
            id: s.id,
            title: s.title ?? "",
            titleSize: s.titleSize,
            content: s.content ?? "",
            media: s.media ?? [],
          }))
        : [{ title: "", titleSize: "h2", content: "", media: [] }]
    );
    setCoverMedia(article.coverMedia ?? null);

    if (article.trade) {
      setSymbol(article.trade.symbol);
      setDirection(article.trade.direction);
      setEntryPrice(String(article.trade.entryPrice));
      setStopLoss(article.trade.stopLoss ? String(article.trade.stopLoss) : "");
      setTakeProfit(
        article.trade.takeProfit ? String(article.trade.takeProfit) : ""
      );
      setResultR(
        article.trade.resultR !== null ? String(article.trade.resultR) : ""
      );
      setTradeStatus(article.trade.status);
      setOpenedAt(
        article.trade.openedAt ? article.trade.openedAt.split("T")[0] : ""
      );
      setClosedAt(
        article.trade.closedAt ? article.trade.closedAt.split("T")[0] : ""
      );
    }
  }, [article?.id]);

  const addSection = () => {
    setSections([
      ...sections,
      { title: "", titleSize: "h2", content: "", media: [] },
    ]);
  };

  const removeSection = async (index: number) => {
    if (sections.length <= 1) return;
    const section = sections[index];
    if (section.media.length > 0) {
      if (
        !confirm(
          "Delete this section and remove its images/videos from storage?"
        )
      ) {
        return;
      }
      if (persistedId) {
        try {
          for (const m of section.media) {
            await deleteMediaMutation.mutateAsync({
              articleId: persistedId,
              mediaId: m.id,
            });
          }
        } catch (err) {
          alert(err instanceof Error ? err.message : "Delete failed");
          return;
        }
      }
    }
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (
    index: number,
    field: keyof SectionState,
    value: string
  ) => {
    setSections(
      sections.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const buildInput = (): ArticleInput => {
    const sectionInputs: SectionInput[] = sections.map((s, i) => ({
      id: s.id,
      title: s.title || null,
      titleSize: s.titleSize,
      content: s.content || null,
      position: i,
    }));

    const generatedSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      `draft-${Date.now()}`;

    const input: ArticleInput = {
      type,
      title: title.trim() || "Untitled",
      slug: generatedSlug,
      excerpt: excerpt || null,
      status,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      sections: sectionInputs,
    };

    input.trade = {
      symbol: symbol.trim() || "TBD",
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      resultR: resultR ? parseFloat(resultR) : null,
      status: tradeStatus,
      openedAt: openedAt ? new Date(openedAt).toISOString() : null,
      closedAt: closedAt ? new Date(closedAt).toISOString() : null,
    };

    return input;
  };

  const applySavedArticle = (saved: Article) => {
    setPersistedId(saved.id);
    setSections((prev) =>
      prev.map((s, i) => ({
        ...s,
        id: saved.sections[i]?.id ?? s.id,
        media: saved.sections[i]?.media ?? s.media,
      }))
    );
    if (saved.coverMedia) setCoverMedia(saved.coverMedia);
    if (!articleId) {
      window.history.replaceState(null, "", `${listPath}/${saved.id}`);
    }
  };

  const persistArticle = async (): Promise<{
    articleId: string;
    sections: Article["sections"];
  }> => {
    const input = { ...buildInput(), status: status || "draft" };
    const saved = persistedId
      ? await updateMutation.mutateAsync({ id: persistedId, input })
      : await createMutation.mutateAsync(input);

    if (!saved) throw new Error("Could not save the article");
    applySavedArticle(saved);
    return { articleId: saved.id, sections: saved.sections };
  };

  const uploadCoverFile = async (file: File) => {
    try {
      setPersisting(true);
      const { articleId: id } = await persistArticle();
      uploadCoverMutation.mutate(
        { articleId: id, file, alt: null },
        {
          onSuccess: (media) => setCoverMedia(media),
          onError: (err) =>
            alert(err instanceof Error ? err.message : "Cover upload failed"),
        }
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed before upload");
    } finally {
      setPersisting(false);
    }
  };

  const uploadSectionFile = async (file: File, index: number) => {
    try {
      setPersisting(true);
      const saved = await persistArticle();
      const sectionId = saved.sections[index]?.id;
      if (!sectionId) {
        alert("Save the section before uploading media.");
        return;
      }
      uploadSectionMediaMutation.mutate(
        { articleId: saved.articleId, sectionId, file, alt: null },
        {
          onSuccess: (media) => {
            setSections((prev) =>
              prev.map((s, i) =>
                i === index
                  ? { ...s, id: sectionId, media: [...s.media, media] }
                  : s
              )
            );
          },
          onError: (err) =>
            alert(err instanceof Error ? err.message : "Upload failed"),
        }
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed before upload");
    } finally {
      setPersisting(false);
    }
  };

  const handleCoverSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type.startsWith("image/")) {
      setCropJob({ file, kind: "cover" });
      return;
    }
    void uploadCoverFile(file);
  };

  const triggerSectionMediaPicker = (index: number) => {
    pendingSectionIndex.current = index;
    sectionMediaInputRef.current?.click();
  };

  const handleSectionMediaSelected = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    const index = pendingSectionIndex.current;
    e.target.value = "";
    pendingSectionIndex.current = null;
    if (!file || index === null) return;
    if (file.type.startsWith("image/")) {
      setCropJob({ file, kind: "section", index });
      return;
    }
    void uploadSectionFile(file, index);
  };

  const handleRemoveMedia = (sectionIndex: number, mediaId: string) => {
    if (!persistedId) return;
    deleteMediaMutation.mutate(
      { articleId: persistedId, mediaId },
      {
        onSuccess: () => {
          setSections((prev) =>
            prev.map((s, i) =>
              i === sectionIndex
                ? { ...s, media: s.media.filter((m) => m.id !== mediaId) }
                : s
            )
          );
        },
        onError: (err) =>
          alert(err instanceof Error ? err.message : "Delete failed"),
      }
    );
  };

  const handleRemoveCover = () => {
    if (!persistedId || !coverMedia) return;
    deleteMediaMutation.mutate(
      { articleId: persistedId, mediaId: coverMedia.id },
      {
        onSuccess: () => setCoverMedia(null),
        onError: (err) =>
          alert(err instanceof Error ? err.message : "Delete failed"),
      }
    );
  };

  const saving =
    createMutation.isPending ||
    updateMutation.isPending ||
    persisting ||
    uploadCoverMutation.isPending ||
    uploadSectionMediaMutation.isPending;

  const handlePreview = () => {
    const input = buildInput();
    const previewArticle = {
      id: persistedId ?? "preview",
      type: input.type,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      status: input.status ?? "draft",
      publishedAt: input.publishedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: (input.sections ?? []).map((s, i) => ({
        id: sections[i]?.id ?? `preview-${i}`,
        articleId: persistedId ?? "preview",
        position: i,
        title: s.title,
        titleSize: s.titleSize ?? "h2",
        content: s.content,
        media: sections[i]?.media ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      trade: input.trade
        ? {
            id: "preview-trade",
            articleId: persistedId ?? "preview",
            symbol: input.trade.symbol,
            direction: input.trade.direction,
            entryPrice: input.trade.entryPrice,
            stopLoss: input.trade.stopLoss ?? null,
            takeProfit: input.trade.takeProfit ?? null,
            resultR: input.trade.resultR ?? null,
            status: input.trade.status,
            openedAt: input.trade.openedAt ?? null,
            closedAt: input.trade.closedAt ?? null,
            events: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : null,
      backtest: null,
      coverMedia,
    };
    sessionStorage.setItem("preview-article", JSON.stringify(previewArticle));
    router.push("/preview");
  };

  const handleSave = (saveStatus: "draft" | "published") => {
    const input = { ...buildInput(), status: saveStatus };
    if (persistedId) {
      updateMutation.mutate(
        { id: persistedId, input },
        {
          onSuccess: () => {
            router.push(listPath);
            router.refresh();
          },
          onError: (err) =>
            alert(err instanceof Error ? err.message : "Save failed"),
        }
      );
    } else {
      createMutation.mutate(input, {
        onSuccess: () => {
          router.push(listPath);
          router.refresh();
        },
        onError: (err) =>
          alert(err instanceof Error ? err.message : "Save failed"),
      });
    }
  };

  const handleDelete = () => {
    if (!persistedId) return;
    if (!confirm("Are you sure you want to delete this article?")) return;
    deleteMutation.mutate(persistedId, {
      onSuccess: () => {
        router.push(listPath);
        router.refresh();
      },
      onError: (err) =>
        alert(err instanceof Error ? err.message : "Delete failed"),
    });
  };

  if (isLoading) {
    return (
      <Box maxW="900px" p="55px 35px 100px" m="auto" color="muted">
        Loading...
      </Box>
    );
  }

  const pageTitle = persistedId
    ? "Edit"
    : type === "live"
      ? "New Trade"
      : "New Backtest";
  const pageLabel = type === "live" ? "Live Trade" : "Backtest";

  return (
    <Box maxW="900px" p="55px 35px 100px" m="auto">
      <Flex align="flex-end" justify="space-between" mb="45px">
        <Box>
          <Text variant="pageLabel">{pageLabel}</Text>
          <Text variant="pageTitle" mt="10px">
            {pageTitle}
          </Text>
          <Text variant="pageDescription">
            Build your article section by section. Images and videos can be
            added while you write.
          </Text>
        </Box>
      </Flex>

      <Box mb="25px">
        <FormControl mb="25px">
          <FormLabel variant="fieldLabel">Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
          />
        </FormControl>

        <FormControl mb="25px">
          <FormLabel variant="fieldLabel">Slug</FormLabel>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from title if empty"
          />
        </FormControl>

        <FormControl mb="25px">
          <FormLabel variant="fieldLabel">Excerpt</FormLabel>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short description..."
            minH="80px"
          />
        </FormControl>

        <Grid templateColumns="1fr 1fr" gap="18px" mb="25px">
          <FormControl>
            <FormLabel variant="fieldLabel">Status</FormLabel>
            <Select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published")
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel variant="fieldLabel">Published Date</FormLabel>
            <Input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </FormControl>
        </Grid>
      </Box>

      <Box mb="35px">
        <Text fontSize="14px" fontWeight={550} mb="15px">
          Trade Details
        </Text>
        <Grid templateColumns="repeat(3, 1fr)" gap="18px" mb="18px">
          <FormControl>
            <FormLabel variant="fieldLabel">Symbol</FormLabel>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="BTC/USD"
            />
          </FormControl>
          <FormControl>
            <FormLabel variant="fieldLabel">Direction</FormLabel>
            <Select
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as TradeDirection)
              }
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel variant="fieldLabel">Status</FormLabel>
            <Select
              value={tradeStatus}
              onChange={(e) =>
                setTradeStatus(e.target.value as TradeStatus)
              }
            >
              <option value="open">Open</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="breakeven">Breakeven</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </FormControl>
        </Grid>
        <Grid templateColumns="repeat(4, 1fr)" gap="18px" mb="18px">
          <FormControl>
            <FormLabel variant="fieldLabel">Entry Price</FormLabel>
            <Input
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="0"
              type="number"
            />
          </FormControl>
          <FormControl>
            <FormLabel variant="fieldLabel">Stop Loss</FormLabel>
            <Input
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="0"
              type="number"
            />
          </FormControl>
          <FormControl>
            <FormLabel variant="fieldLabel">Take Profit</FormLabel>
            <Input
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="0"
              type="number"
            />
          </FormControl>
          <FormControl>
            <FormLabel variant="fieldLabel">Result (R)</FormLabel>
            <Input
              value={resultR}
              onChange={(e) => setResultR(e.target.value)}
              placeholder="0"
              type="number"
            />
          </FormControl>
        </Grid>
        <Grid templateColumns="1fr 1fr" gap="18px">
          <FormControl>
            <FormLabel variant="fieldLabel">Opened At</FormLabel>
            <Input
              type="date"
              value={openedAt}
              onChange={(e) => setOpenedAt(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel variant="fieldLabel">Closed At</FormLabel>
            <Input
              type="date"
              value={closedAt}
              onChange={(e) => setClosedAt(e.target.value)}
            />
          </FormControl>
        </Grid>
      </Box>

      <Box mb="35px">
        <Text fontSize="14px" fontWeight={550} mb="15px">
          Cover Image
        </Text>
        {coverMedia?.url ? (
          <Box mb="12px">
            <Box
              overflow="hidden"
              border="1px solid"
              borderColor="border"
              bg="#0A0C0F"
              borderRadius="10px"
              aspectRatio="16 / 9"
            >
              <ChakraImage
                src={coverMedia.url}
                alt={coverMedia.alt ?? coverMedia.originalName ?? "cover"}
                w="100%"
                h="100%"
                objectFit="contain"
              />
            </Box>
            <Button
              variant="danger"
              w="100%"
              mt="8px"
              onClick={handleRemoveCover}
              isLoading={deleteMediaMutation.isPending}
            >
              Delete cover from storage
            </Button>
          </Box>
        ) : (
          <Button
            variant="secondary"
            onClick={() => coverInputRef.current?.click()}
            isLoading={uploadCoverMutation.isPending || persisting}
          >
            + Upload cover
          </Button>
        )}
      </Box>

      <Text fontSize="14px" fontWeight={550} mb="15px">
        Article
      </Text>

      {sections.map((section, index) => (
        <Box
          key={section.id ?? `new-${index}`}
          position="relative"
          mb="20px"
          p="24px"
          border="1px solid"
          borderColor="border"
          bg="surface"
        >
          <Flex align="center" justify="space-between" mb="22px">
            <Text variant="sectionNumber">
              Section {String(index + 1).padStart(2, "0")}
            </Text>
            <Flex gap="6px">
              {sections.length > 1 && (
                <Button
                  variant="iconDanger"
                  size="sm"
                  onClick={() => removeSection(index)}
                >
                  ×
                </Button>
              )}
            </Flex>
          </Flex>

          <Grid templateColumns="1fr 150px" gap="12px" mb="18px">
            <Input
              value={section.title}
              onChange={(e) => updateSection(index, "title", e.target.value)}
              placeholder="Section title..."
            />
            <Select
              value={section.titleSize}
              onChange={(e) =>
                updateSection(
                  index,
                  "titleSize",
                  e.target.value as SectionTitleSize
                )
              }
            >
              <option value="h2">Large title</option>
              <option value="h3">Medium title</option>
              <option value="h4">Small title</option>
            </Select>
          </Grid>

          <Textarea
            value={section.content}
            onChange={(e) => updateSection(index, "content", e.target.value)}
            placeholder="Write anything about this section..."
            minH="180px"
          />

          {section.media.length > 0 && (
            <Flex gap="10px" flexWrap="wrap" mt="14px">
              {section.media.map((m) => (
                <Box
                  key={m.id}
                  position="relative"
                  w="180px"
                  borderRadius="10px"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="border"
                  bg="#0A0C0F"
                >
                  <Box aspectRatio="16 / 9" overflow="hidden" bg="#0A0C0F">
                    {m.url && isVideo(m.mimeType) ? (
                      <video
                        src={m.url}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          background: "#0A0C0F",
                        }}
                      />
                    ) : (
                      m.url && (
                        <ChakraImage
                          src={m.url}
                          alt={m.alt ?? m.originalName ?? ""}
                          w="100%"
                          h="100%"
                          objectFit="contain"
                        />
                      )
                    )}
                  </Box>
                  <Button
                    variant="danger"
                    size="sm"
                    w="100%"
                    borderRadius="0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveMedia(index, m.id);
                    }}
                    isLoading={deleteMediaMutation.isPending}
                  >
                    Delete from storage
                  </Button>
                </Box>
              ))}
            </Flex>
          )}

          <Button
            variant="secondary"
            size="sm"
            mt="12px"
            onClick={() => triggerSectionMediaPicker(index)}
            isLoading={
              uploadSectionMediaMutation.isPending || persisting
            }
          >
            + Add image or video
          </Button>
        </Box>
      ))}

      <Button
        variant="secondary"
        w="100%"
        minH="55px"
        mt="5px"
        border="1px dashed"
        borderColor="#343A42"
        bg="transparent"
        color="muted"
        _hover={{ color: "text", borderColor: "#555C66", bg: "surface" }}
        onClick={addSection}
      >
        + Add section
      </Button>

      <Flex
        justify="space-between"
        mt="40px"
        pt="20px"
        borderTop="1px solid"
        borderColor="border"
      >
        {persistedId ? (
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        ) : (
          <Box />
        )}
        <Flex gap="10px">
          <Button variant="secondary" onClick={handlePreview}>
            Preview
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSave("draft")}
            isLoading={saving}
          >
            Save draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave("published")}
            isLoading={saving}
          >
            Publish
          </Button>
        </Flex>
      </Flex>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleCoverSelected}
      />
      <input
        ref={sectionMediaInputRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={handleSectionMediaSelected}
      />
      {cropJob ? (
        <ImageCropModal
          file={cropJob.file}
          onCancel={() => setCropJob(null)}
          onConfirm={(file) => {
            const job = cropJob;
            setCropJob(null);
            if (job.kind === "cover") {
              void uploadCoverFile(file);
              return;
            }
            void uploadSectionFile(file, job.index);
          }}
        />
      ) : null}
    </Box>
  );
}
