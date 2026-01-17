"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Alert, Text, Divider, Anchor, ThemeIcon } from '@mantine/core';
import SignUp from './SignUp';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Attempting login with username:", username);
      
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        setError(result.error);
        console.error("Sign in error:", result.error);
      } else if (result?.ok) {
        console.log("Login successful, updating session");
        
        // Refresh session to get updated user data
        const updatedSession = await update();
        console.log("Updated session:", updatedSession);
        
        // Get the user role from the updated session
        const userRole = (updatedSession?.user as any)?.role;
        console.log("User role:", userRole);
        
        // Redirect based on role
        if (userRole === "Admin") {
          console.log("Admin user, redirecting to admin dashboard");
          router.push('/admin');
        } else {
          console.log("Regular user, redirecting to home");
          router.push('/');
        }
      } else {
        setError("An unexpected error occurred");
      }
    } catch (err: any) {
      console.error("Login exception:", err);
      setError(err?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  if (showSignUp) {
    return (
      <Container size={420} my={40}>
        <SignUp onToggle={() => setShowSignUp(false)} onSignUpSuccess={() => {
          setShowSignUp(false);
          setError('');
        }} />
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Stack align="center" mb={20}>
        <ThemeIcon size={60} radius="md" variant="light">🚌</ThemeIcon>
        <Title order={2}>Jordan Bus System</Title>
        <Text c="dimmed">Sign in to your account</Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert color="red" title="Login Error">
                {error}
              </Alert>
            )}

            <TextInput 
              label="Username" 
              placeholder="Enter your username"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              disabled={loading}
            />
            <PasswordInput 
              label="Password" 
              placeholder="Enter your password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={loading}
            />

            <Button type="submit" fullWidth loading={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </Stack>
        </form>

        <Divider my="lg" label="or" />

        <Text ta="center" size="sm">
          Don&apos;t have an account?{' '}
          <Anchor 
            component="button" 
            type="button"
            onClick={() => setShowSignUp(true)} 
            underline="hover"
          >
            Sign up
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}