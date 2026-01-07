"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  Avatar,
  Badge,
  Grid,
  Card,
  Divider,
  ActionIcon,
  Modal,
  PasswordInput,
  Tabs,
  Alert,
  Progress,
  SimpleGrid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconWallet,
  IconEdit,
  IconLock,
  IconTicket,
  IconBus,
  IconCalendar,
  IconCreditCard,
  IconLogout,
  IconCheck,
  IconAlertCircle,
  IconShieldCheck,
  IconHistory,
  IconSettings,
} from "@tabler/icons-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

interface UserProfile {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  balance: number;
}

interface Booking {
  bookingId: string;
  tripId: string;
  bookingDate: string;
  status: string;
  priceTotal: number;
  quantity: number;
}

export default function MyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [passwordModalOpened, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Fetch user profile
        const res = await fetch(`${API_BASE}/api/user/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.clear();
          router.push("/auth/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to load profile");

        const data = await res.json();
        setProfile(data);
        setFullName(data.fullName ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");

        // Fetch user bookings - endpoint expected: /api/booking/user/{userId}
        try {
          const bookingsRes = await fetch(`${API_BASE}/api/booking/my-bookings`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (bookingsRes.ok) {
            const bookingsData = await bookingsRes.json();
            // Normalize booking DTOs to Booking[]
            const normalized: Booking[] = (Array.isArray(bookingsData) ? bookingsData : []).map((b: any) => ({
              bookingId: b.bookingId ?? b.booking_id ?? String(b.id ?? ""),
              tripId: b.tripId ?? b.trip_id ?? "",
              bookingDate: b.bookingDate ?? b.booking_date ?? b.createdAt ?? "",
              status: b.status ?? b.bookingStatus ?? "Confirmed",
              priceTotal: Number(b.priceTotal ?? b.price_total ?? b.priceJod ?? 0),
              quantity: Number(b.quantity ?? 1),
            }));
            setBookings(normalized);
          } else {
            // No bookings or endpoint not available - ignore
            setBookings([]);
          }
        } catch (err) {
          console.warn("Could not fetch bookings", err);
          setBookings([]);
        }
      } catch (err) {
        console.error(err);
        notifications.show({
          title: "Error",
          message: "Unable to load profile",
          color: "red",
          icon: <IconAlertCircle size={18} />,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setUpdateLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/${profile.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
        }),
      });

      if (res.status === 401) {
        localStorage.clear();
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to update profile");
      }

      notifications.show({
        title: "Success",
        message: "Profile updated successfully",
        color: "green",
        icon: <IconCheck size={18} />,
      });

      setProfile({ ...profile, fullName, email, phone });
      setEditMode(false);

      // Update cache
      const cached = localStorage.getItem("currentUser");
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.fullName = fullName;
        parsed.email = email;
        parsed.phone = phone;
        localStorage.setItem("currentUser", JSON.stringify(parsed));
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to update profile",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      notifications.show({
        title: "Error",
        message: "Passwords do not match",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    if (newPassword.length < 6) {
      notifications.show({
        title: "Error",
        message: "Password must be at least 6 characters",
        color: "yellow",
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    try {
      // Backend ChangePasswordDto expects oldPassword/newPassword (camelCase)
      const res = await fetch(`${API_BASE}/api/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldpassword: currentPassword,
          newpassword: newPassword,
        }),
      });

      if (res.status === 401) {
        localStorage.clear();
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to change password");
      }

      notifications.show({
        title: "Success",
        message: "Password changed successfully",
        color: "green",
        icon: <IconCheck size={18} />,
      });

      closePasswordModal();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to change password",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
    notifications.show({
      title: "Logged Out",
      message: "You have been logged out successfully",
      color: "blue",
    });
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center style={{ minHeight: "60vh" }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading your profile...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle />} title="Error" color="red">
          Unable to load profile. Please try again.
        </Alert>
      </Container>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const completedBookings = bookings.filter((b) => b.status === "Confirmed").length;
 const totalSpent = bookings.filter(t => t.status === 'Confirmed').reduce(
    (sum, t) => sum + t.priceTotal,
    0
  );
  return (
    <>
      <Header />
    <Container size="lg" py={40}>
      <Stack gap="xl">
        {/* Header Section */}
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Group gap="xl">
                <Avatar
                  size={120}
                  radius="xl"
                  color="orange"
                  styles={{
                    placeholder: {
                      fontSize: "2.5rem",
                      fontWeight: 700,
                    },
                  }}
                >
                  {getInitials(profile.fullName)}
                </Avatar>
                <Stack gap="xs">
                  <Group gap="sm">
                    <Title order={2}>{profile.fullName}</Title>
                    <Badge
                      color={profile.role === "Admin" ? "red" : "blue"}
                      variant="light"
                      size="lg"
                    >
                      {profile.role}
                    </Badge>
                  </Group>
                  <Group gap="lg">
                    <Group gap="xs">
                      <IconMail size={16} color="gray" />
                      <Text size="sm" c="dimmed">
                        {profile.email}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <IconPhone size={16} color="gray" />
                      <Text size="sm" c="dimmed">
                        {profile.phone}
                      </Text>
                    </Group>
                  </Group>
                  <Group gap="xs" mt="xs">
                    <IconShieldCheck size={18} color="green" />
                    <Text size="sm" c="green" fw={500}>
                      Account Verified
                    </Text>
                  </Group>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="sm" h="100%" justify="center">
                <Button
                  fullWidth
                  variant="light"
                  color="orange"
                  size="md"
                  leftSection={<IconWallet size={20} />}
                  onClick={() => router.push("/topup")}
                >
                  Balance: {profile.balance.toFixed(2)} JOD
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  color="gray"
                  size="sm"
                  leftSection={<IconLogout size={18} />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed" tt="uppercase" fw={500}>
                  Total Bookings
                </Text>
                <ActionIcon variant="light" color="blue" size="lg" radius="xl">
                  <IconTicket size={20} />
                </ActionIcon>
              </Group>
              <Text size="2rem" fw={700}>
                {bookings.length}
              </Text>
              <Progress value={(completedBookings / (bookings.length || 1)) * 100} color="blue" size="sm" />
              <Text size="xs" c="dimmed">
                {completedBookings} completed trips
              </Text>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed" tt="uppercase" fw={500}>
                  Total Spent
                </Text>
                <ActionIcon variant="light" color="green" size="lg" radius="xl">
                  <IconCreditCard size={20} />
                </ActionIcon>
              </Group>
              <Text size="2rem" fw={700}>
                {totalSpent.toFixed(2)} JOD
              </Text>
              <Text size="xs" c="dimmed">
                Across all bookings
              </Text>
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed" tt="uppercase" fw={500}>
                  Member Since
                </Text>
                <ActionIcon variant="light" color="orange" size="lg" radius="xl">
                  <IconCalendar size={20} />
                </ActionIcon>
              </Group>
              <Text size="2rem" fw={700}>
                2025
              </Text>
              <Text size="xs" c="dimmed">
                Active member
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" color="orange">
          <Tabs.List grow>
            <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
              Profile Info
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconSettings size={16} />}>
              Security
            </Tabs.Tab>
          </Tabs.List>

          {/* Profile Info Tab */}
          <Tabs.Panel value="profile" pt="xl">
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Group justify="space-between" mb="xl">
                <div>
                  <Title order={3}>Personal Information</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    Update your account details and information
                  </Text>
                </div>
                {!editMode ? (
                  <Button
                    leftSection={<IconEdit size={18} />}
                    variant="light"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Group>
                    <Button variant="subtle" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button
                      leftSection={<IconCheck size={18} />}
                      onClick={handleUpdateProfile}
                      loading={updateLoading}
                    >
                      Save Changes
                    </Button>
                  </Group>
                )}
              </Group>

              <Divider mb="xl" />

              <Stack gap="lg">
                <TextInput
                  label="Username"
                  value={profile.username}
                  disabled
                  leftSection={<IconUser size={18} />}
                  size="md"
                  description="Username cannot be changed"
                />

                <TextInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!editMode}
                  leftSection={<IconUser size={18} />}
                  size="md"
                  required
                />

                <TextInput
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editMode}
                  leftSection={<IconMail size={18} />}
                  size="md"
                  type="email"
                  required
                />

                <TextInput
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editMode}
                  leftSection={<IconPhone size={18} />}
                  size="md"
                  required
                />
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Security Tab */}
          <Tabs.Panel value="security" pt="xl">
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <div>
                <Title order={3}>Security Settings</Title>
                <Text size="sm" c="dimmed" mt="xs">
                  Manage your password and account security
                </Text>
              </div>

              <Divider my="xl" />

              <Stack gap="lg">
                <Card padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group gap="xs" mb="xs">
                        <IconLock size={20} />
                        <Text fw={600}>Password</Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Last changed recently
                      </Text>
                    </div>
                    <Button
                      leftSection={<IconLock size={18} />}
                      variant="light"
                      onClick={openPasswordModal}
                    >
                      Change Password
                    </Button>
                  </Group>
                </Card>

                <Card padding="lg" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Group gap="xs" mb="xs">
                        <IconShieldCheck size={20} />
                        <Text fw={600}>Account Status</Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Your account is secure and verified
                      </Text>
                    </div>
                    <Badge color="green" size="lg" variant="light">
                      Active
                    </Badge>
                  </Group>
                </Card>

                <Alert icon={<IconAlertCircle />} title="Security Tips" color="blue" variant="light">
                  <Stack gap="xs">
                    <Text size="sm">• Use a strong, unique password</Text>
                    <Text size="sm">• Never share your password with anyone</Text>
                    <Text size="sm">• Log out from shared devices</Text>
                  </Stack>
                </Alert>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Change Password Modal */}
      <Modal
        opened={passwordModalOpened}
        onClose={closePasswordModal}
        title={
          <Group gap="xs">
            <IconLock size={24} />
            <Text fw={600} size="lg">
              Change Password
            </Text>
          </Group>
        }
        size="md"
        centered
      >
        <Stack gap="md">
          <PasswordInput
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            size="md"
            required
          />

          <PasswordInput
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            size="md"
            required
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            size="md"
            required
            error={
              confirmPassword && newPassword !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closePasswordModal}>
              Cancel
            </Button>
            <Button
              leftSection={<IconCheck size={18} />}
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
            >
              Update Password
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
          <Footer />

        </>

  );
}