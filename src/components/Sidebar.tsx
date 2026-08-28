"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⌂", section: "Workspace" },
  { href: "/live", label: "Live Trades", icon: "↗", section: "Workspace" },
  { href: "/backtest", label: "Backtests", icon: "◫", section: "Workspace" },
  { href: "/notes", label: "Notes", icon: "≡", section: "Workspace" },
  { href: "/settings", label: "Settings", icon: "⚙", section: "System" },
];

const externalLink = { href: "http://localhost:3000", label: "View website", icon: "↗", section: "System" };

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sections = ["Workspace", "System"];

  return (
    <Box
      as="aside"
      position="fixed"
      top={0}
      left={0}
      bottom={0}
      w="235px"
      p="28px 18px"
      borderRight="1px solid"
      borderColor="border"
      bg="background"
      zIndex={100}
    >
      <Text variant="logo" px="12px">
        TRADING
      </Text>

      {sections.map((section) => (
        <Box key={section} mt="50px">
          <Text variant="sidebarLabel" px="12px">
            {section}
          </Text>
          <Flex flexDir="column" gap="4px" mt="12px">
            {navItems
              .filter((item) => item.section === section)
              .map((item) => (
                <Link key={item.href} href={item.href}>
                  <Flex
                    align="center"
                    gap="10px"
                    p="10px 12px"
                    borderRadius="3px"
                    color={isActive(item.href) ? "text" : "secondary"}
                    fontSize="13px"
                    bg={isActive(item.href) ? "surface2" : "transparent"}
                    _hover={{ color: "text", bg: "surface" }}
                  >
                    <Text as="span" w="25px" color="muted" fontSize="13px">
                      {item.icon}
                    </Text>
                    <Text as="span">{item.label}</Text>
                  </Flex>
                </Link>
              ))}
            {section === "System" && (
              <a href={externalLink.href} target="_blank" rel="noreferrer">
                <Flex
                  align="center"
                  gap="10px"
                  p="10px 12px"
                  borderRadius="3px"
                  color="secondary"
                  fontSize="13px"
                  _hover={{ color: "text", bg: "surface" }}
                >
                  <Text as="span" w="25px" color="muted" fontSize="13px">
                    {externalLink.icon}
                  </Text>
                  <Text as="span">{externalLink.label}</Text>
                </Flex>
              </a>
            )}
          </Flex>
        </Box>
      ))}

      <Box
        position="absolute"
        left="18px"
        right="18px"
        bottom="25px"
        pt="20px"
        borderTop="1px solid"
        borderColor="border"
      >
        <Flex align="center" gap="10px">
          <Flex
            align="center"
            justify="center"
            w="30px"
            h="30px"
            border="1px solid"
            borderColor="border"
            color="secondary"
            fontSize="11px"
          >
            AF
          </Flex>
          <Box>
            <Text variant="profileName">Admin</Text>
            <Text variant="profileRole">Trading Journal</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
