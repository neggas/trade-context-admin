"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

export default function LoginPage() {
  const [email, setEmail] = useState("dev@mail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid credentials"
          : "Sign in failed. Is the API running?"
      );
      setLoading(false);
    } else {
      window.location.href = result?.url || "/";
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="background">
      <Box w="380px" p="40px">
        <Text variant="logo" mb="40px">
          TRADING JOURNAL
        </Text>

        <Text fontSize="24px" fontWeight={550} letterSpacing="-0.03em" mb="8px">
          Sign in
        </Text>
        <Text color="muted" fontSize="13px" mb="35px">
          Sign in to your admin account
        </Text>

        <form onSubmit={handleSubmit}>
          <FormControl mb="20px">
            <FormLabel variant="fieldLabel">Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormControl>

          <FormControl mb="25px">
            <FormLabel variant="fieldLabel">Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>

          {error && (
            <Text color="loss" fontSize="12px" mb="15px">
              {error}
            </Text>
          )}

          <Button
            type="submit"
            variant="primary"
            w="100%"
            isLoading={loading}
            loadingText="Signing in..."
          >
            Sign in
          </Button>
        </form>
      </Box>
    </Flex>
  );
}
