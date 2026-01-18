'use client';

import { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Anchor,

  ThemeIcon,
} from '@mantine/core';
import { IconUserPlus, IconUser, IconMail, IconPhone, IconLock, IconAlertCircle, IconCheck } from '@tabler/icons-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

interface Props {
  onToggle: () => void;
  onSignUpSuccess: () => void;
}

export default function SignUp({ onToggle, onSignUpSuccess }: Props) {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/User/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.errorMessage || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        onSignUpSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <Stack gap={0} align="center" mb={32}>
        <ThemeIcon 
          size={60} 
          radius="lg" 
          variant="gradient" 
          gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }}
          mb="md"
        >
          <IconUserPlus size={32} stroke={2} />
        </ThemeIcon>
        <Title order={2} size="1.8rem" fw={800} c="#0685d9ff">Create Account</Title>
        <Text c="dimmed" size="sm" fw={500} mt="xs">Join us and start booking your journey</Text>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {error && (
            <Alert 
              color="red" 
              title="Registration Error"
              icon={<IconAlertCircle size={16} />}
              variant="light"
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              color="green" 
              title="Success"
              icon={<IconCheck size={16} />}
              variant="light"
            >
              {success}
            </Alert>
          )}

          <TextInput 
            label="Username" 
            placeholder="Choose a unique username"
            required 
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
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

          <TextInput 
            label="Full Name" 
            placeholder="Enter your full name"
            required 
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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

          <TextInput 
            label="Email Address" 
            type="email"
            placeholder="Enter your email"
            required 
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            size="md"
            leftSection={<IconMail size={18} color="#0685d9ff" />}
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
            placeholder="Enter a strong password"
            description="Must contain uppercase, lowercase, number, and special character"
            required 
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          <TextInput 
            label="Phone Number" 
            placeholder="Enter your phone number"
            required 
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            size="md"
            leftSection={<IconPhone size={18} color="#0685d9ff" />}
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
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </Stack>
      </form>

      <Text ta="center" mt="xl" size="sm" fw={500}>
        Already have an account?{" "}
        <Anchor 
          component="button" 
          onClick={onToggle} 
          underline="hover"
          fw={600}
          c="#0685d9ff"
        >
          Sign In
        </Anchor>
      </Text>
    </Paper>
  );
}