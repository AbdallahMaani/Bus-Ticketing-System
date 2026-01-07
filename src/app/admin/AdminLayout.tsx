"use client";

import React from "react";
import Link from "next/link";
import { AppShell, Group, Button, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
    >
      <AppShell.Header p="xs">
        <Group justify="space-between" align="center" style={{ height: "100%" }}>
          <Group>
            <Link href="/" aria-label="Home">
              <Text fw={700} c="blue" style={{ cursor: "pointer" }}>
                Jordan Bus — Admin
              </Text>
            </Link>
          </Group>
          <Group>
            <Button variant="subtle" component={Link} href="/">Site</Button>
            <Button color="red" onClick={handleLogout}>Logout</Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}