"use client";

import Link from "next/link"; // this line means we are using the Link component from next/link for client-side navigation
import { useRouter } from "next/navigation"; 
import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  Text,
  UnstyledButton,
} from "@mantine/core";

function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [full_name, setFullname] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setIsLoggedIn(true);
        setFullname(user.full_name || "User");
        setBalance(user.balance || 0);
      } catch {
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setFullname("");
    router.push("/auth/login");
  };

  return (
    <Paper
      withBorder
      radius={0}
      h={85} 
      p={7} 
      component="header"
      bg="white"
    >
      <Group justify="space-between" align="center" h="100%" px="md">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Group gap="sm">
            <Text fw={800} size="xl" c="blue">
              Jordan Bus System
            </Text>
          </Group>
        </Link>

        <Group gap="md">
          <Button component={Link} href="/" variant="subtle" size="xl" radius="lg">
            Home
          </Button>
          <Button component={Link} href="/history" variant="subtle" size="xl" radius="lg">
            History
          </Button>
          <Button component={Link} href="/about" variant="subtle" size="xl" radius="lg">
            About
          </Button>
        </Group>

        {isLoggedIn ? (
          <Menu width={253} position="bottom-end" shadow="xl">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="md">
                  <Box ta="right">
                    <Text fw={600} size="lg" c="dimmed">
                      {full_name}
                    </Text>
                    <Badge size="lg" variant="light">
                      {balance.toFixed(2)} JD
                    </Badge>
                  </Box>
                  <Avatar radius="xl" color="blue" size="lg">
                    {full_name.charAt(0).toUpperCase()}
                  </Avatar>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item component={Link} href="/myprofile">
                My Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button component={Link} href="/auth/login" size="lg" radius="lg">
            Login
          </Button>
        )}
      </Group>
    </Paper>
  );
}

export default Header;
