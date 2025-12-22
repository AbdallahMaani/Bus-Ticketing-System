"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Group,
  Text,
  ThemeIcon,
  Button,
  Box,
  Menu,
  Avatar,
  UnstyledButton,
} from "@mantine/core";

function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [full_name, setFullname] = useState("");
  const [balance, setBalance] = useState(0);

  // Check login status on component mount
  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setIsLoggedIn(true);
        // Use full_name from the stored user object
        setFullname(user.full_name || "User"); // it takes the full_name from localStorage
        setBalance(user.balance || 0); // it takes the balance from localStorage
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser"); // Clear the session
    setIsLoggedIn(false);
    setFullname("");
    router.push("/auth/login");
  };

  return (
    <Box
      h="100%"
      px="md"
      bg="white"
      style={{ borderBottom: "1px solid #e9ecef" }}
    >
      <Group justify="space-between" h="100%" align="center" w="100%">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="lg" radius="lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            <Text
              fw={800}
              size="xl"
              c="blue"
              style={{ letterSpacing: "-0.5px" }}
            >
              Jordan Bus System
            </Text>
          </Group>
        </Link>

        <Group gap="md">
          <Button variant="subtle" component={Link} href="/" size="lg" radius="md">
            Home
          </Button>
          <Button variant="subtle" component={Link} href="/history" size="lg" radius="md">
            History
          </Button>
          <Button variant="subtle" component={Link} href="/about" size="lg" radius="md">
            About
          </Button>
          
        </Group>

        <Group>
          {isLoggedIn ? (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={10}>
                    <div style={{ textAlign: "right" }}>
                      <Text size="lg" fw={500}>
                        {full_name}
                      </Text>
                      <Text c="dimmed" size="md">
                        Balance: {balance.toFixed(2)} JD
                      </Text>
                    </div>
                    <Avatar color="blue" radius="xl">
                      {full_name ? full_name.charAt(0).toUpperCase() : "U"}
                    </Avatar>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
              <Menu.Item component={Link} href="/myprofile">
                  My Profile
                </Menu.Item>

                <Menu.Item color="red" onClick={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Button component={Link} href="/auth/login" radius="md">
              Login
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  );
}

export default Header;
