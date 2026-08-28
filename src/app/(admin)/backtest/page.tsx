"use client";

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import { useAdminArticles, useDeleteArticle } from "lib/queries";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BacktestsPage() {
  const { data: articles, isLoading } = useAdminArticles("backtest");
  const deleteMutation = useDeleteArticle();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <Box maxW="1250px" p="55px 35px 100px" m="auto">
      <Flex align="flex-end" justify="space-between" mb="45px">
        <Box>
          <Text variant="pageLabel">Research</Text>
          <Text variant="pageTitle" mt="10px">
            Backtests
          </Text>
          <Text variant="pageDescription">
            Manage historical strategy research.
          </Text>
        </Box>
        <Link href="/backtest/new">
          <Button variant="primary">+ New Backtest</Button>
        </Link>
      </Flex>

      <Box border="1px solid" borderColor="border" overflowX="auto">
        <Table variant="unstyled">
          <Thead bg="surface">
            <Tr>
              <Th color="muted" fontSize="9px" fontWeight={500} textTransform="uppercase" letterSpacing="0.1em">Date</Th>
              <Th color="muted" fontSize="9px" fontWeight={500} textTransform="uppercase" letterSpacing="0.1em">Title</Th>
              <Th color="muted" fontSize="9px" fontWeight={500} textTransform="uppercase" letterSpacing="0.1em">Pair</Th>
              <Th color="muted" fontSize="9px" fontWeight={500} textTransform="uppercase" letterSpacing="0.1em">Result</Th>
              <Th color="muted" fontSize="9px" fontWeight={500} textTransform="uppercase" letterSpacing="0.1em">Status</Th>
              <Th color="muted" fontSize="9px" fontWeight={500} textTransform="uppercase" letterSpacing="0.1em" textAlign="right">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading && (
              <Tr>
                <Td colSpan={6} color="muted" textAlign="center">
                  Loading...
                </Td>
              </Tr>
            )}
            {!isLoading && articles?.length === 0 && (
              <Tr>
                <Td colSpan={6} color="muted" textAlign="center">
                  No backtests yet
                </Td>
              </Tr>
            )}
            {articles?.map((article) => (
              <Tr key={article.id} _hover={{ bg: "surface" }}>
                <Td fontSize="12px">{formatDate(article.publishedAt)}</Td>
                <Td fontSize="12px">{article.title}</Td>
                <Td fontSize="12px">{article.symbol ?? "—"}</Td>
                <Td
                  fontSize="12px"
                  color={
                    article.resultR !== null && article.resultR > 0
                      ? "profit"
                      : article.resultR !== null && article.resultR < 0
                        ? "loss"
                        : "muted"
                  }
                >
                  {article.resultR !== null
                    ? `${article.resultR > 0 ? "+" : ""}${article.resultR.toFixed(2)}R`
                    : "—"}
                </Td>
                <Td fontSize="12px">
                  <Flex
                    as="span"
                    px="8px"
                    py="5px"
                    border="1px solid"
                    borderColor={article.tradeStatus === "won" ? "rgba(99,199,154,0.25)" : "border"}
                    color={article.tradeStatus === "won" ? "profit" : "muted"}
                    fontSize="9px"
                    w="fit-content"
                  >
                    {article.tradeStatus ?? "—"}
                  </Flex>
                </Td>
                <Td fontSize="12px">
                  <Flex justify="flex-end" gap="7px">
                    <Link href={`/backtest/${article.id}`}>
                      <Button variant="icon" size="sm" title="Edit">
                        ✎
                      </Button>
                    </Link>
                    <Button
                      variant="iconDanger"
                      size="sm"
                      title="Delete"
                      onClick={() => handleDelete(article.id, article.title)}
                      isLoading={deleteMutation.isPending}
                    >
                      ×
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
