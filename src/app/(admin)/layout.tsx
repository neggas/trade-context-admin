"use client";

import { Box, Flex } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "components/Sidebar";
import Topbar from "components/Topbar";

export default function AdminLayout({
  children,
  preview,
}: {
  children: React.ReactNode;
  preview: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const sessionError = (session as any)?.error as string | undefined;

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [status, pathname]);

  useEffect(() => {
    if (
      sessionError === "RefreshAccessTokenError" ||
      sessionError === "RefreshTokenMissing"
    ) {
      signOut({ callbackUrl: "/login" });
    }
  }, [sessionError]);

  if (status === "loading") {
    return (
      <Flex h="100vh" align="center" justify="center" bg="background">
        <Box color="muted" fontSize="13px">
          Loading...
        </Box>
      </Flex>
    );
  }

  if (!session && pathname !== "/login") {
    return null;
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box w="calc(100% - 235px)" ml="235px">
        <Topbar />
        {children}
      </Box>
      {preview}
    </Flex>
  );
}
