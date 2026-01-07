"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // 1. Import jwt decode
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
  Checkbox,
  Anchor,
} from "@mantine/core";

// 2. Define the response structure coming from your Backend
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 3. Define what is INSIDE your token (The Claims)
interface DecodedToken {
  nameid: string; // UserId
  unique_name: string; // Username
  role: string; // Role
  exp: number; // Expiry
}

function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginUrl = isAdmin
        ? "https://localhost:7088/api/Admin/login"
        : "https://localhost:7088/api/User/login";

      // 4. Connect to your REAL Backend Login Endpoint
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Match the 'LoginDto' in your C# code
        body: JSON.stringify({
          username: identifier, 
          password: password,
        }),
      });

      if (!response.ok) {
        // Handle 400 or 401 errors
        const errorData = await response.text(); 
        throw new Error(errorData || "Invalid username or password");
      }

      // 5. Get the tokens
      const data: TokenResponse = await response.json();

      // 6. Save Tokens to LocalStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // 7. Decode token to get user info (Optional, for UI display)
      const decoded: DecodedToken = jwtDecode(data.accessToken);
      localStorage.setItem("currentUser", JSON.stringify({
        username: decoded.unique_name,
        role: decoded.role,
        userId: decoded.nameid,
      }));

      console.log(`User ${decoded.unique_name} logged in!`);
      
      // 8. Redirect
      router.push("/");
      router.refresh();

    } catch (err: any) {
      setError(err.message || "System error: Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
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
              label="Username"
              placeholder="Enter your username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              radius="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              radius="md"
            />
             <Checkbox
              label="Login as Admin"
              checked={isAdmin}
              onChange={(event) => setIsAdmin(event.currentTarget.checked)}
            />
            <Button fullWidth type="submit" radius="md" loading={loading}>
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
      <Text c="dimmed" size="sm" ta="center" mt="md">
          Don't have an account?{' '}
          <Anchor href="/auth/signup" fz="sm">
            Sign up
          </Anchor>
        </Text>
    </Container>
  );
}

export default LoginPage;