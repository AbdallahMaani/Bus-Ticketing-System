'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Anchor,
} from '@mantine/core';

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
    <Container size={420} my={40}>
      <Paper withBorder p={30}>
        <Title order={2}>Create Account</Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red" title="Error">{error}</Alert>}
            {success && <Alert color="green" title="Success">{success}</Alert>}

            <TextInput 
              label="Username" 
              placeholder="Choose a username"
              required 
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} 
            />
            <TextInput 
              label="Full Name" 
              placeholder="Enter your full name"
              required 
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
            />
            <TextInput 
              label="Email" 
              type="email"
              placeholder="Enter your email"
              required 
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
            <PasswordInput 
              label="Password" 
              placeholder="Enter a strong password"
              description="Must contain uppercase, lowercase, number, and special character"
              required 
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
            <TextInput 
              label="Phone" 
              placeholder="Enter your phone number"
              required 
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
            />

            <Button type="submit" fullWidth loading={loading}>Register</Button>
          </Stack>
        </form>

        <Text ta="center" mt="sm">
          Already have an account? <Anchor component="button" onClick={onToggle} underline="hover">Login</Anchor>
        </Text>
      </Paper>
    </Container>
  );
}