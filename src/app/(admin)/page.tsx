"use client";

import { Box, Grid, GridItem, Text } from "@chakra-ui/react";
import { useAdminStats } from "lib/queries";

export default function DashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  const statItems = [
    {
      label: "Published trades",
      value: isLoading ? "—" : stats?.publishedTrades ?? "—",
    },
    {
      label: "Total R",
      value: isLoading ? "—" : stats ? `+${stats.totalR.toFixed(1)}R` : "—",
    },
    {
      label: "Win rate",
      value: isLoading
        ? "—"
        : stats?.winRate
          ? `${stats.winRate.toFixed(1)}%`
          : "—",
    },
    { label: "Drafts", value: isLoading ? "—" : stats?.drafts ?? "—" },
  ];

  return (
    <Box maxW="1250px" p="55px 35px 100px" m="auto">
      <Box mb="45px">
        <Text variant="pageLabel">Overview</Text>
        <Text variant="pageTitle" mt="10px">
          Dashboard
        </Text>
        <Text variant="pageDescription">
          Overview of your trading journal and recent activity.
        </Text>
      </Box>

      <Grid
        templateColumns="repeat(4, 1fr)"
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor="border"
      >
        {statItems.map((stat) => (
          <GridItem
            key={stat.label}
            minH="145px"
            p="22px 20px"
            bg="surface"
            borderRight="1px solid"
            borderColor="border"
            _last={{ borderRight: "none" }}
          >
            <Text variant="statLabel">{stat.label}</Text>
            <Text variant="statValue">{stat.value}</Text>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
}
