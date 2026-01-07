'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !fullName || !email || !password || !phone) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const newUser = {
      username,
      fullName,
      email,
      password,
      phone,
    };

    try {
      const res = await fetch('https://localhost:7088/api/User/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        router.push('/auth/login');
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2}>
        Create an Account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor href="/auth/login" size="sm">
          Log in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red" title="Error">{error}</Alert>}
            
            <TextInput
              label="Username"
              placeholder="Choose a username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              radius="md"
            />
            
            <TextInput
              label="Full Name"
              placeholder="Your full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              radius="md"
            />

            <TextInput
              label="Email"
              placeholder="you@mantine.dev"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <TextInput
              label="Phone Number"
              placeholder="Your phone number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              radius="md"
            />

            <Button fullWidth mt="xl" type="submit" loading={loading} radius="md">
              Sign up
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default SignUp;

