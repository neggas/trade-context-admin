"use client";

import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Article } from "types";

export default function PreviewModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    // Read article data from sessionStorage (set by the editor)
    const data = sessionStorage.getItem("preview-article");
    if (data) {
      setArticle(JSON.parse(data));
    }
  }, []);

  const close = () => router.back();

  if (!article) {
    return (
      <Flex
        position="fixed"
        inset={0}
        bg="rgba(0,0,0,0.7)"
        align="center"
        justify="center"
        zIndex={1000}
        onClick={close}
      >
        <Box
          bg="surface"
          p="40px"
          maxW="500px"
          onClick={(e) => e.stopPropagation()}
        >
          <Text color="muted">No preview data available</Text>
          <Button variant="secondary" mt="20px" onClick={close}>
            Close
          </Button>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex
      position="fixed"
      inset={0}
      bg="rgba(0,0,0,0.8)"
      align="center"
      justify="center"
      zIndex={1000}
      onClick={close}
      p="20px"
    >
      <Box
        bg="background"
        border="1px solid"
        borderColor="border"
        maxW="750px"
        w="100%"
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <Flex
          justify="space-between"
          align="center"
          p="16px 25px"
          borderBottom="1px solid"
          borderColor="border"
        >
          <Text fontSize="12px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
            Preview
          </Text>
          <Button variant="icon" size="sm" onClick={close}>
            ×
          </Button>
        </Flex>

        {/* Article content */}
        <Box p="45px 55px">
          <Text fontSize="11px" color="accent" textTransform="uppercase" letterSpacing="0.12em" fontWeight={600}>
            {article.type === "live" ? "Live Trade" : "Backtest"}
          </Text>
          <Text
            fontSize="clamp(32px, 5vw, 52px)"
            lineHeight="1.06"
            letterSpacing="-0.045em"
            mt="12px"
            maxW="620px"
          >
            {article.title}
          </Text>
          {article.excerpt && (
            <Text
              maxW="620px"
              mt="25px"
              color="secondary"
              fontSize="16px"
              lineHeight="1.8"
            >
              {article.excerpt}
            </Text>
          )}

          {article.coverMedia?.url && (
            <Box
              mt="32px"
              overflow="hidden"
              border="1px solid"
              borderColor="border"
              borderRadius="10px"
              bg="#0A0C0F"
              aspectRatio="16 / 9"
            >
              {article.coverMedia.mimeType?.startsWith("video/") ? (
                <video
                  src={article.coverMedia.url}
                  controls
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#0A0C0F",
                  }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.coverMedia.url}
                  alt={article.coverMedia.alt ?? article.title}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#0A0C0F",
                  }}
                />
              )}
            </Box>
          )}

          {/* Trade info */}
          {article.trade && (
            <Box
              mt="35px"
              p="25px"
              border="1px solid"
              borderColor="border"
              bg="surface"
            >
              <Flex gap="30px" flexWrap="wrap">
                <Box>
                  <Text fontSize="9px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
                    Symbol
                  </Text>
                  <Text fontSize="14px" mt="7px">{article.trade.symbol}</Text>
                </Box>
                <Box>
                  <Text fontSize="9px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
                    Direction
                  </Text>
                  <Text fontSize="14px" mt="7px" textTransform="capitalize">
                    {article.trade.direction}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="9px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
                    Entry
                  </Text>
                  <Text fontSize="14px" mt="7px">{article.trade.entryPrice}</Text>
                </Box>
                {article.trade.resultR !== null && (
                  <Box>
                    <Text fontSize="9px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
                      Result
                    </Text>
                    <Text
                      fontSize="14px"
                      mt="7px"
                      fontWeight={600}
                      color={article.trade.resultR > 0 ? "profit" : "loss"}
                    >
                      {article.trade.resultR > 0 ? "+" : ""}
                      {article.trade.resultR.toFixed(2)}R
                    </Text>
                  </Box>
                )}
              </Flex>
            </Box>
          )}

          {/* Backtest info */}
          {article.backtest && (
            <Box
              mt="35px"
              p="25px"
              border="1px solid"
              borderColor="border"
              bg="surface"
            >
              <Flex gap="30px" flexWrap="wrap">
                <Box>
                  <Text fontSize="9px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
                    Strategy
                  </Text>
                  <Text fontSize="14px" mt="7px">{article.backtest.strategyName}</Text>
                </Box>
                <Box>
                  <Text fontSize="9px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
                    Market
                  </Text>
                  <Text fontSize="14px" mt="7px">{article.backtest.market}</Text>
                </Box>
                {article.backtest.winRate !== null && (
                  <Box>
                    <Text fontSize="9px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
                      Win Rate
                    </Text>
                    <Text fontSize="14px" mt="7px">{article.backtest.winRate.toFixed(1)}%</Text>
                  </Box>
                )}
                {article.backtest.totalR !== null && (
                  <Box>
                    <Text fontSize="9px" color="muted" textTransform="uppercase" letterSpacing="0.1em">
                      Total R
                    </Text>
                    <Text fontSize="14px" mt="7px" color="profit">
                      +{article.backtest.totalR.toFixed(1)}R
                    </Text>
                  </Box>
                )}
              </Flex>
            </Box>
          )}

          {/* Sections */}
          {article.sections.map((section, i) => (
            <Box key={i} mt="40px" maxW="620px">
              {section.title && (
                <Text
                  fontSize={
                    section.titleSize === "h2" ? "24px" : section.titleSize === "h3" ? "20px" : "17px"
                  }
                  fontWeight={550}
                  letterSpacing="-0.025em"
                  mb="15px"
                >
                  {section.title}
                </Text>
              )}
              {section.content && (
                <Text
                  color="secondary"
                  fontSize="16px"
                  lineHeight="1.9"
                  whiteSpace="pre-wrap"
                >
                  {section.content}
                </Text>
              )}
              {section.media?.map((m) =>
                m.url ? (
                  <Box
                    key={m.id}
                    mt="20px"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="border"
                    borderRadius="10px"
                    bg="#0A0C0F"
                    aspectRatio="16 / 9"
                  >
                    {m.mimeType?.startsWith("video/") ? (
                      <video
                        src={m.url}
                        controls
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          background: "#0A0C0F",
                        }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.url}
                        alt={m.alt ?? section.title ?? ""}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          background: "#0A0C0F",
                        }}
                      />
                    )}
                  </Box>
                ) : null
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Flex>
  );
}
