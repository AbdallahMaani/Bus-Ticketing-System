"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Title, Paper, Stack, Text } from "@mantine/core";
import AdminLayout from "./AdminLayout";
import UserList from "@/Components/UserList";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const cur = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (!cur) {
      router.push("/auth/login");
      return;
    }
    try {
      const parsed = JSON.parse(cur);
      if (parsed?.role !== "Admin") {
        router.push("/");
      }
    } catch {
      router.push("/auth/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <Container size="xl" py="xl">
        <Stack spacing="lg">
          <Paper withBorder p="md" radius="md">
            <Title order={2}>Admin Dashboard</Title>
            <Text c="dimmed" mt="xs">
              Manage users: view, edit, delete and reset passwords.
            </Text>
          </Paper>

          <UserList />
        </Stack>
      </Container>
    </AdminLayout>
  );
}