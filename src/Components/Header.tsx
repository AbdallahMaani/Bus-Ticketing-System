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
        <Group gap="lg" justify="center">
          <Button
            component={Link}
            href="/"
            variant={pathname === "/" ? "gradient" : "subtle"}
            gradient={pathname === "/" ? { from: "blue", to: "cyan", deg: 90 } : undefined}
            size="lg"
            radius="xl"
            fw={500}
            leftSection={<IconHome size={18} />}
            styles={{
              root: {
                transition: "all 0.3s ease",
              },
            }}
          >
            Home
          </Button>
          {isLoggedIn && (
            <Button
              component={Link}
              href="/history"
              variant={pathname === "/history" ? "gradient" : "subtle"}
              gradient={pathname === "/history" ? { from: "blue", to: "cyan", deg: 90 } : undefined}
              size="lg"
              radius="xl"
              fw={500}
              leftSection={<IconHistory size={18} />}
              styles={{
                root: {
                  transition: "all 0.3s ease",
                },
              }}
            >
              History
            </Button>
          )}
           {isLoggedIn && (session.user as any)?.role === "Admin" && (
            <Button
              component={Link}
              href="/admin"
              variant={pathname === "/admin" ? "gradient" : "subtle"}
              gradient={pathname === "/admin" ? { from: "orange", to: "red", deg: 90 } : undefined}
              size="lg"
              radius="xl"
              fw={600}
              leftSection={<IconDashboard size={18} />}
              styles={{
                root: {
                  transition: "all 0.3s ease",
                },
              }}
            >
              Admin
            </Button>
          )}
          <Button
            component={Link}
            href="/about"
            variant={pathname === "/about" ? "gradient" : "subtle"}
            gradient={pathname === "/about" ? { from: "blue", to: "cyan", deg: 90 } : undefined}
            size="lg"
            radius="xl"
            fw={500}
            styles={{
              root: {
                transition: "all 0.3s ease",
              },
            }}
          >
            About
          </Button>
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
                    <Text fw={600} size="lg" c="dark">
                      {session.user.fullName || "User"}
                    </Text>
                    <Badge
                      size="lg"
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
                    {session.user.fullName?.[0]?.toUpperCase() || 'U'}
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
          <Button 
            component={Link} 
            href="/auth/login" 
            size="lg" 
            radius="xl"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan", deg: 90 }}
            fw={500}
          >
            Login
          </Button>
        )}
      </Group>
    </Paper>
  );
}

export default Header;