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
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import {
  IconHistory,
  IconTicket,
  IconCalendar,
  IconReportMoney,
  IconAlertCircle,
  IconInfoCircle,
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

export default function HistoryPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);

    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          localStorage.clear();
          setIsLoggedIn(false);
          router.push("/auth/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/Booking/my-bookings`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.clear();
            setIsLoggedIn(false);
            router.push("/auth/login");
            return;
          }
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
    })();
  }, [router]);

  const handleCancel = async (bookingId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      localStorage.clear();
      router.push("/auth/login");
      return;
    }

    setCanceling(prev => ({ ...prev, [bookingId]: true }));

    try {
      // Correct endpoint: Booking controller, not Bus
      const res = await fetch(`${API_BASE_URL}/api/Booking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (res.status === 401) {
        // Unauthorized - token invalid
        localStorage.clear();
        router.push("/auth/login");
        return;
      }

      if (res.status === 403) {
        console.error('Failed to cancel booking. Status: 403');
        // show client-friendly error (could be a toast)
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to cancel booking. Status:', res.status, 'Message:', text);
        return;
      }

      // Success: update local state
      setTickets(prev =>
        prev.map(ticket =>
          ticket.bookingId === bookingId
            ? { ...ticket, bookingStatus: 'Cancelled' }
            : ticket
        )
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setCanceling(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  if (loading) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <Center style={{ flex: 1 }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading your history...</Text>
          </Stack>
        </Center>
        <Footer />
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <Container size="xl" py="xl" style={{ flex: 1 }}>
          <Center mih={400}>
            <Paper withBorder p="xl" radius="lg" shadow="sm">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="xl" color="red">
                  <IconAlertCircle size={30} />
                </ThemeIcon>
                <Title order={3}>You are not logged in</Title>
                <Text c="dimmed" ta="center">
                  Please login to view your ticket history.
                </Text>
                <Button
                  size="md"
                  onClick={() => router.push("/auth/login")}
                  color="blue"
                >
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
    <Table.Tr key={ticket.bookingId}>
      <Table.Td>
        <Group gap="sm">
          <Avatar color="blue" radius="md" size="lg">
            🚌
          </Avatar>
          <div>
            <Text fw={600} size="sm">
              {ticket.originName} → {ticket.destinationName}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {ticket.bookingId}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{new Date(ticket.bookingDate).toLocaleDateString()}</Text>
        <Text size="xs" c="dimmed">
          {new Date(ticket.bookingDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
        </Text>
      </Table.Td>
      <Table.Td ta="right">
        <Text fw={500}>{(ticket.priceTotal / ticket.quantity).toFixed(2)} JOD</Text>
      </Table.Td>
      <Table.Td ta="center">{ticket.quantity}</Table.Td>
      <Table.Td ta="right">
        <Text fw={600} c="blue">
          {ticket.priceTotal.toFixed(2)} JOD
        </Text>
      </Table.Td>
      <Table.Td ta="center">
        <Badge
          color={ticket.bookingStatus === "Confirmed" ? "green" : "red"}
          variant="light"
          radius="sm"
        >
          {ticket.bookingStatus}
        </Badge>
      </Table.Td>
      <Table.Td ta="center">
        <Button
          size="xs"
          color="red"
          variant="outline"
          disabled={ticket.bookingStatus !== 'Confirmed'}
          onClick={() => handleCancel(ticket.bookingId)}
          loading={Boolean(canceling[ticket.bookingId])}
        >
          Cancel
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />
      <Box component="main" style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <Container size="xl" py="xl">
          <Stack gap="xl">
            <div style={{ textAlign: "center" }}>
              <ThemeIcon
                size={70}
                radius="xl"
                color="orange"
                variant="light"
                mb="md"
                mx="auto"
              >
                <IconHistory size={40} />
              </ThemeIcon>
              <Title order={1} mb="xs">
                My Booking History
              </Title>
              <Text c="dimmed" size="lg">
                Review all your past trips and booking details
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Card withBorder radius="md" p="lg" shadow="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed" tt="uppercase" fw={500}>
                    Total Spent 
                  </Text>
                  <ThemeIcon color="green" variant="light" size="lg" radius="md">
                    <IconReportMoney size={20} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="2rem" mt="md">
                  {totalSpent.toFixed(2)} JOD
                </Text>
              </Card>

              <Card withBorder radius="md" p="lg" shadow="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed" tt="uppercase" fw={500}>
                    Total Trips
                  </Text>
                  <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                    <IconTicket size={20} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="2rem" mt="md">
                  {tickets.filter(t => t.bookingStatus !== "Cancelled").length}
                </Text>
              </Card>

              <Card withBorder radius="md" p="lg" shadow="sm">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed" tt="uppercase" fw={500}>
                    Last Trip
                  </Text>
                  <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="1.5rem" mt="md">
                  {lastTrip}
                </Text>
              </Card>
            </SimpleGrid>

            <Paper withBorder radius="md" p="lg" shadow="sm">
              {tickets.length === 0 ? (
                <Center mih={200}>
                  <Stack align="center" gap="sm">
                    <ThemeIcon size={50} radius="xl" variant="light">
                      <IconInfoCircle size={30} />
                    </ThemeIcon>
                    <Text c="dimmed">No tickets found.</Text>
                    <Text size="sm" c="dimmed">
                      When you book a ticket, it will appear here.
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <ScrollArea>
                  <Table
                    highlightOnHover
                    miw={800}
                    verticalSpacing="md"
                    horizontalSpacing="md"
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Trip Details</Table.Th>
                        <Table.Th>Date & Time</Table.Th>
                        <Table.Th ta="right">Price</Table.Th>
                        <Table.Th ta="center">Quantity</Table.Th>
                        <Table.Th ta="right">Total</Table.Th>
                        <Table.Th ta="center">Status</Table.Th>
                        <Table.Th ta="center">Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                  </Table>
                </ScrollArea>
              )}
            </Paper>

            <Alert
              icon={<IconInfoCircle size={18} />}
              color="blue"
              variant="light"
              radius="md"
            >
              <Text size="sm">
                This history includes all your confirmed and canceled bookings.
                For any inquiries, please contact our support team.
              </Text>
            </Alert>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}