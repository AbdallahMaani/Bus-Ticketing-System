"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Alert, Text, Divider, Anchor, ThemeIcon, Group, Box } from '@mantine/core';
import { IconBus, IconLock, IconUser, IconUserPlus, IconLogout } from '@tabler/icons-react';
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
        
        // Redirect all users to home page (Header will handle admin link visibility)
        console.log("Login successful, redirecting to home");
        router.push('/');
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

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log("Guest user attempting to access home page");
      console.log("Redirecting guest user to home page");
      
      // Redirect guest to home page without authentication
      router.push('/');
    } catch (err: any) {
      console.error("Guest login exception:", err);
      setError("An error occurred while accessing as guest");
    } finally {
      setLoading(false);
    }
  };

  if (showSignUp) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, rgba(6, 133, 217, 0.05) 0%, rgba(11, 140, 245, 0.08) 100%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container size={420}>
          <SignUp onToggle={() => setShowSignUp(false)} onSignUpSuccess={() => {
            setShowSignUp(false);
            setError('');
          }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(6, 133, 217, 0.05) 0%, rgba(11, 140, 245, 0.08) 100%)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container size={420}>
        <Stack gap={0} align="center" mb={40}>
          <ThemeIcon 
            size={80} 
            radius="lg" 
            variant="gradient" 
            gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }}
            mb="md"
          >
            <IconBus size={44} stroke={2} />
          </ThemeIcon>
          <Title order={1} size="2.5rem" fw={800} c="#0685d9ff" ta="center">Jordan Bus</Title>
          <Text c="dimmed" ta="center" size="md" fw={500} mt="xs">Book your journey with ease</Text>
        </Stack>

        <Paper 
          withBorder 
          p={40} 
          radius="lg"
          shadow="lg"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(6, 133, 217, 0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              {error && (
                <Alert color="red" title="Login Error" icon={<IconLock size={16} />} variant="light">
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
                size="md"
                leftSection={<IconUser size={18} color="#0685d9ff" />}
                styles={{
                  input: {
                    borderColor: "rgba(6, 133, 217, 0.2)",
                    "&:focus": {
                      borderColor: "#0685d9ff",
                    },
                  },
                }}
              />
              <PasswordInput 
                label="Password" 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={loading}
                size="md"
                leftSection={<IconLock size={18} color="#0685d9ff" />}
                styles={{
                  input: {
                    borderColor: "rgba(6, 133, 217, 0.2)",
                    "&:focus": {
                      borderColor: "#0685d9ff",
                    },
                  },
                }}
              />

              <Button 
                type="submit" 
                fullWidth 
                loading={loading}
                size="md"
                fw={700}
                variant="gradient"
                gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Divider my="xl" label="Or continue with" labelPosition="center" />

          <Stack gap="sm">
            <Button 
              fullWidth
              variant="light"
              onClick={() => setShowSignUp(true)}
              size="md"
              fw={600}
              leftSection={<IconUserPlus size={18} />}
              color="orange"
            >
              Create New Account
            </Button>

            <Button 
              fullWidth
              variant="subtle"
              onClick={handleGuestLogin}
              disabled={loading}
              size="md"
              fw={600}
              leftSection={<IconLogout size={18} />}
              color="gray"
            >
              Continue as Guest
            </Button>
          </Stack>
        </Paper>

        <Text c="dimmed" ta="center" size="sm" mt="xl">
          Protected by secure authentication. Your data is safe with us.
        </Text>
      </Container>
    </Box>
  );
}