"use client";

import React, { useEffect, useState } from "react";
import Header from "@/Components/Header";
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Stack,
  Avatar,
  Text,
  Group,
  rem,
} from "@mantine/core";

// Define the User interface
interface User {
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  balance: number;
}

function MyProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve user data from localStorage on component mount
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Handle input changes for editable fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (user) {
      setUser({ ...user, [name]: value });
    }
  };

  // Handle form submission for updating profile
  const handleUpdateProfile = () => {
    if (user) {
      // Here you would typically send the updated user data to a server
      // For now, we'll just update it in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      alert("Profile updated successfully!");
    }
  };

  if (loading) {
    return <Text>Loading...</Text>; // Or a spinner
  }

  if (!user) {
    return (
      <Container size="xs" my={40}>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2} ta="center">
            My Profile
          </Title>
          <Text c="dimmed" ta="center" mt={5}>
            Please log in to view your profile.
          </Text>
        </Paper>
      </Container>
    );
  }

  return (
    <div>
      <Header />
    <Container size="xs" my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack align="center" gap="lg">
          <Avatar size={rem(120)} radius="50%" alt={`${user.full_name}'s avatar`} />
          <Title order={2} ta="center">
            {user.full_name}
          </Title>
          <Text c="dimmed" ta="center">
            @{user.username}
          </Text>
        </Stack>

        <Stack mt="xl" gap="md">
          <TextInput
            label="Full Name"
            name="full_name"
            value={user.full_name}
            onChange={handleInputChange}
          />
          <TextInput
            label="Email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
          />
          <TextInput
            label="Phone"
            name="phone"
            value={user.phone}
            onChange={handleInputChange}
          />
          
          {/* Display balance as a read-only field */}
          <TextInput
            label="Balance"
            value={`$${user.balance.toFixed(2)}`}
            readOnly
            styles={{ input: { color: "gray" } }}
          />
          <Button
            fullWidth
            mt="xl"
            onClick={handleUpdateProfile}
          >
            Update Profile
          </Button>
        </Stack>
      </Paper>
    </Container>
    </div>
  );
}

export default MyProfilePage;