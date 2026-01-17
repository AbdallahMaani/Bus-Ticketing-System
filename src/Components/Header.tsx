"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
import { logoutUser, apiClientFetch } from "@/lib/apiClient";
import { IconWallet, IconLogout, IconUser, IconHistory, IconShieldCheck, IconDashboard, IconHome } from "@tabler/icons-react";
import { useEffect, useState } from "react";

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState<number>(0);

  const isLoading = status === "loading";
  const isLoggedIn = !!session?.user;

  // Fetch balance from API to ensure it's always up-to-date
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchBalance = async () => {
      try {
        const res = await apiClientFetch("/api/User/me");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance || 0);
        } else {
          console.error("Failed to fetch balance:", res.status);
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    fetchBalance();
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await logoutUser(); // Call backend logout endpoint
      await signOut({ redirect: false }); // Clear NextAuth session
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Still sign out locally even if backend fails
      await signOut({ redirect: false });
      router.push("/auth/login");
    }
  };

  const handleTopUp = () => {
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
            variant={pathname === "/" ? "filled" : "subtle"}
            size="md"
            radius="lg"
            leftSection={<IconHome size={18} />}
          >
            Home
          </Button>
          <Button
            component={Link}
            href="/history"
            variant={pathname === "/history" ? "filled" : "subtle"}
            size="md"
            radius="lg"
          >
            History
          </Button>
          <Button
            component={Link}
            href="/about"
            variant={pathname === "/about" ? "filled" : "subtle"}
            size="md"
            radius="lg"
          >
            About
          </Button>
          {/* Admin Dashboard Button - Only show if user is Admin */}
          {isLoggedIn && (session.user as any)?.role === "Admin" && (
            <Button
              component={Link}
              href="/admin"
              variant={pathname === "/admin" ? "filled" : "subtle"}
              size="md"
              radius="lg"
              color="orange"
              leftSection={<IconDashboard size={18} />}
            >
              Admin Dashboard
            </Button>
          )}
        </Group>

        {/* User Menu or Login */}
        {isLoading ? (
          <Group gap="md">
            <Skeleton height={40} width={120} radius="lg" />
          </Group>
        ) : isLoggedIn && session.user ? (
          <Menu width={280} position="bottom-end" shadow="xl">
            <Menu.Target>
              <UnstyledButton style={{ cursor: "pointer" }}>
                <Group gap="md">
                  <Box ta="right">
                    <Text fw={600} size="sm" c="dark">
                      {session.user.fullName || session.user.username}
                    </Text>
                    <Badge
                      size="md"
                      variant="light"
                      color="green"
                      onClick={handleTopUp}
                      style={{ cursor: "pointer" }}
                    >
                      {(balance || session?.user?.balance || 0).toFixed(2)} JD
                    </Badge>
                  </Box>
                  <Avatar
                    radius="xl"
                    color="blue"
                    size="lg"
                  >
                    {session.user.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item 
                component={Link} 
                href="/myprofile"
                leftSection={<IconUser size={16} />}
              >
                My Profile
              </Menu.Item>
              <Menu.Item 
                component={Link} 
                href="/history"
                leftSection={<IconHistory size={16} />}
              >
                My Bookings
              </Menu.Item>
              {/* Admin Menu Item - Only show if user is Admin */}
              {(session.user as any)?.role === "Admin" && (
                <>
                  <Menu.Divider />
                  <Menu.Item 
                    component={Link} 
                    href="/admin"
                    leftSection={<IconDashboard size={16} />}
                    color="orange"
                  >
                    Admin Dashboard
                  </Menu.Item>
                </>
              )}
              <Menu.Divider />
              <Menu.Item 
                component={Link} 
                href="/TopUp" 
                color="green"
                leftSection={<IconWallet size={16} />}
              >
                Top Up Balance
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                color="red" 
                onClick={handleLogout}
                leftSection={<IconLogout size={16} />}
              >
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