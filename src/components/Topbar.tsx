"use client";

import { Flex, Text, Button } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/live": "Live Trades",
  "/notes": "Notes",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();
  const currentName = pageNames[pathname] || "Dashboard";

  const isNewPage = pathname.includes("/new");
  const isLiveSection = pathname.startsWith("/live");

  return (
    <Flex
      h="70px"
      px="35px"
      borderBottom="1px solid"
      borderColor="border"
      align="center"
      justify="space-between"
    >
      <Text variant="breadcrumb">
        Admin <span> / </span>
        <Text as="strong" variant="breadcrumbActive">
          {currentName}
        </Text>
      </Text>

      <Flex align="center" gap="10px">
        {isLiveSection && !isNewPage && (
          <Link href="/live/new">
            <Button variant="primary">+ New Trade</Button>
          </Link>
        )}
      </Flex>
    </Flex>
  );
}
