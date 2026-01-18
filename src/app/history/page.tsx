'use client';

import React, { useEffect, useState } from "react";
import {
  Container,
  Title,
  Table,
  Button,
  Group,
  Box,
  Badge,
  Paper,
  ScrollArea,
  Text,
  Stack,
  Card,
  Avatar,
  Center,
  SimpleGrid,
  ThemeIcon,
  Loader,
  Alert,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { notifications } from '@mantine/notifications';
import { apiClientFetch } from "@/lib/apiClient";
import {
  IconHistory,
  IconTicket,
  IconCalendar,
  IconReportMoney,
  IconAlertCircle,
  IconInfoCircle,
  IconMapPin,
  IconClock,
  IconX,
} from "@tabler/icons-react";

interface Booking {
  bookingId: string;
  userId: string;
  tripId: string;
  originName: string;
  destinationName: string;
  busType: string;
  bookingDate: string;
  bookingStatus: string;
  priceTotal: number;
  quantity: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    if (loading === false) return; // Prevent re-fetching if already loaded

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await apiClientFetch("/api/Booking/my-bookings");

        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!res.ok) {
          console.error("Failed to load bookings", res.status);
          setTickets([]);
          return;
        }

        const data: Booking[] = await res.json();
        data.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
        setTickets(data);
      } catch (err) {
        console.error("Error fetching bookings", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [status]);

  const handleCancel = async (bookingId: string) => {
    setCanceling(prev => ({ ...prev, [bookingId]: true }));

    try {
      const res = await apiClientFetch(`/api/Booking/${bookingId}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (res.status === 403) {
        notifications.show({
          title: 'Error',
          message: 'You do not have permission to cancel this booking',
          color: 'red',
        });
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to cancel booking');
      }

      // Success: update local state
      setTickets(prev =>
        prev.map(ticket =>
          ticket.bookingId === bookingId
            ? { ...ticket, bookingStatus: 'Cancelled' }
            : ticket
        )
      );

      notifications.show({
        title: 'Success',
        message: 'Booking cancelled successfully',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to cancel booking',
        color: 'red',
      });
    } finally {
      setCanceling(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  if (status === "loading" || loading) {
    return (
      <Box style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <Center style={{ flex: 1 }}>
          <Stack align="center" gap="lg">
            <ThemeIcon size={80} radius="lg" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }}>
              <IconHistory size={44} stroke={1.5} />
            </ThemeIcon>
            <Stack align="center" gap="xs">
              <Loader size="lg" />
              <Text c="dimmed" fw={500}>Loading your booking history...</Text>
            </Stack>
          </Stack>
        </Center>
        <Footer />
      </Box>
    );
  }

  if (!session?.user) {
    return (
      <Box style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, rgba(6, 133, 217, 0.05) 0%, rgba(11, 140, 245, 0.08) 100%)" }}>
        <Header />
        <Container size="xl" py="xl" style={{ flex: 1 }}>
          <Center mih={400}>
            <Paper withBorder p="xl" radius="lg" shadow="lg" style={{ border: "1px solid rgba(6, 133, 217, 0.2)" }}>
              <Stack align="center" gap="lg">
                <ThemeIcon size={80} radius="lg" variant="gradient" gradient={{ from: "#dc2626", to: "#ef4444", deg: 90 }}>
                  <IconAlertCircle size={44} stroke={1.5} />
                </ThemeIcon>
                <Stack align="center" gap="sm">
                  <Title order={2}>Authentication Required</Title>
                  <Text c="dimmed" ta="center" size="md">
                    Please login to view your ticket history and bookings.
                  </Text>
                </Stack>
                <Button size="lg" onClick={() => router.push("/auth/login")} variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} fw={600}>
                  Go to Login
                </Button>
              </Stack>
            </Paper>
          </Center>
        </Container>
        <Footer />
      </Box>
    );
  }

  const totalSpent = tickets.filter(t => t.bookingStatus === 'Confirmed').reduce(
    (sum, t) => sum + t.priceTotal,
    0
  );
  const lastTrip = tickets.length ? new Date(tickets[0].bookingDate).toLocaleDateString() : "-";

  const rows = tickets.map((ticket) => (
    <Table.Tr key={ticket.bookingId} style={{ borderBottom: "1px solid rgba(217, 119, 6, 0.1)" }}>
      <Table.Td>
        <Group gap="sm">
          <ThemeIcon color="blue" variant="light" size="lg" radius="md">
            <IconMapPin size={18} stroke={2} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="sm" c="#0685d9ff">
              {ticket.originName} → {ticket.destinationName}
            </Text>
            <Text size="xs" c="dimmed">ID: {ticket.bookingId.substring(0, 12)}...</Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ThemeIcon color="orange" variant="light" size="md" radius="md">
            <IconClock size={14} stroke={2} />
          </ThemeIcon>
          <div>
            <Text fw={500} size="sm">{new Date(ticket.bookingDate).toLocaleDateString()}</Text>
            <Text size="xs" c="dimmed">
              {new Date(ticket.bookingDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td ta="right">
        <Text fw={500} size="sm">{(ticket.priceTotal / ticket.quantity).toFixed(2)} JOD</Text>
      </Table.Td>
      <Table.Td ta="center">
        <Badge color="gray" variant="light" size="md">{ticket.quantity}</Badge>
      </Table.Td>
      <Table.Td ta="right">
        <Text fw={700} c="#0685d9ff" size="md">{ticket.priceTotal.toFixed(2)} JOD</Text>
      </Table.Td>
      <Table.Td ta="center">
        <Badge
          color={ticket.bookingStatus === "Confirmed" ? "green" : "red"}
          variant="light"
          radius="md"
          size="lg"
          fw={600}
        >
          {ticket.bookingStatus}
        </Badge>
      </Table.Td>
      <Table.Td ta="center">
        <Button
          size="sm"
          color="red"
          variant="light"
          disabled={ticket.bookingStatus !== 'Confirmed'}
          onClick={() => handleCancel(ticket.bookingId)}
          loading={Boolean(canceling[ticket.bookingId])}
          leftSection={<IconX size={14} />}
          fw={600}
        >
          Cancel
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box component="main" style={{ flex: 1, background: "linear-gradient(135deg, rgba(6, 133, 217, 0.03) 0%, rgba(11, 140, 245, 0.05) 100%)" }}>
        <Container size="xl" py="xl">
          <Stack gap="xl">
            <div style={{ textAlign: "center" }}>
              <ThemeIcon size={80} radius="lg" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} mb="md" mx="auto">
                <IconHistory size={44} stroke={1.5} />
              </ThemeIcon>
              <Title order={1} mb="xs" fw={800} size="2.5rem" c="#0685d9ff">My Booking History</Title>
              <Text c="dimmed" size="lg" fw={500}>
                Review all your past trips and booking details
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Card withBorder radius="lg" p="lg" shadow="md" style={{ border: "1px solid rgba(6, 133, 217, 0.2)", background: "rgba(255, 255, 255, 0.9)" }}>
                <Group justify="space-between" mb="md">
                  <Text size="lg" c="dimmed" tt="uppercase" fw={600}>Total Spent</Text>
                  <ThemeIcon color="green" variant="gradient" gradient={{ from: "#22c55e", to: "#16a34a", deg: 90 }} size="lg" radius="md">
                    <IconReportMoney size={20} stroke={2} />
                  </ThemeIcon>
                </Group>
                <Text fw={800} size="2.2rem" c="#22c55e">{totalSpent.toFixed(2)}</Text>
                <Text size="md" c="dimmed" fw={500}>JOD</Text>
              </Card>

              <Card withBorder radius="lg" p="lg" shadow="md" style={{ border: "1px solid rgba(6, 133, 217, 0.2)", background: "rgba(255, 255, 255, 0.9)" }}>
                <Group justify="space-between" mb="md">
                  <Text size="lg" c="dimmed" tt="uppercase" fw={600}>Total Trips</Text>
                  <ThemeIcon color="blue" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} size="lg" radius="md">
                    <IconTicket size={20} stroke={2} />
                  </ThemeIcon>
                </Group>
                <Text fw={800} size="2.2rem" c="#0685d9ff">
                  {tickets.filter(t => t.bookingStatus !== "Cancelled").length}
                </Text>
                <Text size="md" c="dimmed" fw={500}>Confirmed</Text>
              </Card>

              <Card withBorder radius="lg" p="lg" shadow="md" style={{ border: "1px solid rgba(6, 133, 217, 0.2)", background: "rgba(255, 255, 255, 0.9)" }}>
                <Group justify="space-between" mb="md">
                  <Text size="lg" c="dimmed" tt="uppercase" fw={600}>Last Trip</Text>
                  <ThemeIcon color="orange" variant="gradient" gradient={{ from: "#f59e0b", to: "#d97706", deg: 90 }} size="lg" radius="md">
                    <IconCalendar size={20} stroke={2} />
                  </ThemeIcon>
                </Group>
                <Text fw={800} size="1.8rem" c="#d97706">{lastTrip}</Text>
              </Card>
            </SimpleGrid>

            <Paper withBorder radius="lg" p="lg" shadow="md" style={{ border: "1px solid rgba(217, 119, 6, 0.1)", background: "rgba(255, 255, 255, 0.95)" }}>
              {tickets.length === 0 ? (
                <Center mih={250}>
                  <Stack align="center" gap="md">
                    <ThemeIcon size={70} radius="lg" variant="light" color="gray">
                      <IconInfoCircle size={38} stroke={1.5} />
                    </ThemeIcon>
                    <Stack align="center" gap="xs">
                      <Text fw={600} size="lg">No bookings yet</Text>
                      <Text size="sm" c="dimmed">
                        When you book a ticket, it will appear here.
                      </Text>
                    </Stack>
                  </Stack>
                </Center>
              ) : (
                <ScrollArea>
                  <Table highlightOnHover miw={800} verticalSpacing="sm" horizontalSpacing="md" fontSize="md">
                    <Table.Thead style={{ background: "rgba(217, 119, 6, 0.05)" }}>
                      <Table.Tr>
                        <Table.Th fw={700}>Trip Details</Table.Th>
                        <Table.Th fw={700}>Date & Time</Table.Th>
                        <Table.Th ta="right" fw={700}>Price</Table.Th>
                        <Table.Th ta="center" fw={700}>Qty</Table.Th>
                        <Table.Th ta="right" fw={700}>Total</Table.Th>
                        <Table.Th ta="center" fw={700}>Status</Table.Th>
                        <Table.Th ta="center" fw={700}>Action</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                  </Table>
                </ScrollArea>
              )}
            </Paper>

            <Alert icon={<IconInfoCircle size={18} />} color="blue" variant="light" radius="lg" style={{ border: "1px solid rgba(6, 133, 217, 0.2)" }}>
              <Text size="sm" fw={500}>
                This history includes all your confirmed and canceled bookings. For any inquiries, contact our support team.
              </Text>
            </Alert>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}