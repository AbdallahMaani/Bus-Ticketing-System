"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Paper,
  Title,
  Divider,
  Stack,
  Alert,
  Text,
  ThemeIcon,
} from "@mantine/core";

interface User {
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role: "customer" | "admin";
  balance: number;
}

function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/jordan_bus_data.json");
      if (!response.ok) {
        throw new Error(`Failed to load data. Status: ${response.status}`);
      }
      const data = await response.json();
      const users: User[] = data.users || [];

      const user = users.find(
        (u: User) =>
          (u.username === identifier || u.email === identifier) && //identifier is either username or email 
          u.password === password
      );

      if (user) {
        // ✅ FIX: Save user to localStorage to persist "session"
        localStorage.setItem("currentUser", JSON.stringify(user));

        console.log(`User ${user.username} logged in successfully!`);
        router.push("/");

        // Optional: Force a refresh to update the Header immediately if not using state management
        router.refresh();
      } else {
        setError("Invalid username/email or password.");
      }
    } catch (err) {
      setError("System error: Could not connect to data source.");
    }
  };

  const handleGuestAccess = () => {
    localStorage.removeItem("currentUser"); // Ensure no previous user is logged in
    router.push("/");
  };

  return (
    <Container size={420} my={40}>
      <Stack align="center" gap={5} mb={30}>
        <ThemeIcon color="blue" variant="light" size={60} radius="md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 6v6" />
            <path d="M15 6v6" />
            <path d="M2 12h19.6" />
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
            <circle cx="7" cy="18" r="2" />
            <path d="M9 18h5" />
            <circle cx="16" cy="18" r="2" />
          </svg>
        </ThemeIcon>
        <Title ta="center" order={2} style={{ color: "#222" }}>
          Welcome to Jordan Bus System
        </Title>
        <Text c="dimmed" size="sm">
          Sign in to access your bookings and history
        </Text>
      </Stack>
      <Paper withBorder shadow="xl" p={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label="Username or Email"
              placeholder="Your email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              styles={{ input: { color: "black" }, label: { color: "black" } }}
              radius="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              styles={{ input: { color: "black" }, label: { color: "black" } }}
              radius="md"
            />
            <Button fullWidth type="submit" radius="md">
              Sign in
            </Button>
          </Stack>
        </form>
        <Divider label="or" labelPosition="center" my="lg" />
        <Button
          fullWidth
          variant="default"
          onClick={handleGuestAccess}
          radius="md"
        >
          Continue as guest
        </Button>
      </Paper>
    </Container>
  );
}

export default LoginPage;
