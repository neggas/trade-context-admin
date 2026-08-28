"use client";

import { Box, Text } from "@chakra-ui/react";

export default function SettingsPage() {
  return (
    <Box maxW="1250px" p="55px 35px 100px" m="auto">
      <Box mb="45px">
        <Text variant="pageLabel">System</Text>
        <Text variant="pageTitle" mt="10px">
          Settings
        </Text>
      </Box>
    </Box>
  );
}
