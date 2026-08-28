"use client";

import { Box, Text } from "@chakra-ui/react";

export default function NotesPage() {
  return (
    <Box maxW="1250px" p="55px 35px 100px" m="auto">
      <Box mb="45px">
        <Text variant="pageLabel">Notes</Text>
        <Text variant="pageTitle" mt="10px">
          Notes
        </Text>
        <Text variant="pageDescription">
          Personal observations and trading thoughts.
        </Text>
      </Box>
    </Box>
  );
}
