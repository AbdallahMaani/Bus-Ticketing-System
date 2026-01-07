"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  Skeleton,
} from "@mantine/core";

// Structure matches your C# UserDTOs exactly
interface UserProfile {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  balance: number;
}

interface CurrentUser {
  userId: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  balance: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch fresh user data from Backend API
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userJson = localStorage.getItem("currentUser");

      // Check if user is logged in
      if (!accessToken || !userJson) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const storedUser: CurrentUser = JSON.parse(userJson);

      // Step 1: Show cached data immediately (optimistic update)
      setIsLoggedIn(true);
      setDisplayName(storedUser.fullName || storedUser.username);
      setBalance(storedUser.balance);

      // Step 2: Fetch fresh data from Backend API
      // Endpoint: GET /api/user/me
      // This gives us the real-time balance and profile info
      const response = await fetch("https://localhost:7088/api/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        // Step 3: Update with real data from Backend
        const freshData: UserProfile = await response.json();

        // Update state with backend data
        setDisplayName(freshData.fullName);
        setBalance(freshData.balance);

        // Update localStorage with fresh data
        const updatedUser: CurrentUser = {
          userId: freshData.userId,
          username: freshData.username,
          fullName: freshData.fullName,
          email: freshData.email,
          phone: freshData.phone,
          role: freshData.role,
          balance: freshData.balance,
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        console.log(`✅ Profile refreshed for ${freshData.fullName}`);
      } else if (response.status === 401) {
        // Token expired or invalid
        console.warn("⚠️ Token expired, logging out");
        handleLogout();
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      // Keep showing cached data if API call fails
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile when component mounts or when pathname changes
  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    // Clear all localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("currentUser");

    // Reset state
    setIsLoggedIn(false);
    setDisplayName("User");
    setBalance(0);

    // Redirect to login
    router.push("/auth/login");
    router.refresh();
  };

  const handleTopUp = () => {
    // Navigate to top-up page
    router.push("/TopUp");
  };

  return (
    <Paper withBorder radius={0} h={85} p={7} component="header" bg="white">
      <Group justify="space-between" align="center" h="100%" px="md">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Group gap="sm">
            <Text fw={800} size="xl" c="blue">
              Jordan Bus
            </Text>
          </Group>
        </Link>

        {/* Navigation Links */}
        <Group gap="md">
          <Button
            component={Link}
            href="/"
            variant="subtle"
            size="md"
            radius="lg"
          >
            Home
          </Button>
          <Button
            component={Link}
            href="/history"
            variant="subtle"
            size="md"
            radius="lg"
          >
            History
          </Button>
          <Button
            component={Link}
            href="/about"
            variant="subtle"
            size="md"
            radius="lg"
          >
            About
          </Button>
        </Group>

        {/* User Menu or Login */}
        {isLoggedIn ? (
          <Menu width={280} position="bottom-end" shadow="xl">
            <Menu.Target>
              <UnstyledButton style={{ cursor: "pointer" }}>
                <Group gap="md">
                  <Box ta="right">
                    {loading ? (
                      <>
                        <Skeleton height={24} width={150} mb={8} />
                        <Skeleton height={20} width={100} />
                      </>
                    ) : (
                      <>
                        <Text fw={600} size="sm" c="dark">
                          {displayName}
                        </Text>
                        <Badge
                          size="md"
                          variant="light"
                          color="green"
                          onClick={handleTopUp}
                          style={{ cursor: "pointer" }}
                        >
                          {balance.toFixed(2)} JD
                        </Badge>
                      </>
                    )}
                  </Box>
                  <Avatar
                    radius="xl"
                    color="blue"
                    size="lg"
                    name={displayName}
                  >
                  </Avatar>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item component={Link} href="/myprofile">
                My Profile
              </Menu.Item>
              <Menu.Item component={Link} href="/history">
                My Bookings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item component={Link} href="/TopUp" color="green">
                Top Up Balance
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button component={Link} href="/auth/login" size="md" radius="lg">
            Login
          </Button>
        )}
      </Group>
    </Paper>
  );
}

export default Header;