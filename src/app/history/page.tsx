"use client";

import React from "react";
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
} from "@mantine/core";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { useTickets } from "@/Components/TicketStore";

export default function HistoryPage() {
  const { tickets } = useTickets();

  const totalSpent = tickets.reduce(
    (sum, t) => sum + (t.total ?? t.price * t.quantity),
    0
  );

  const totalTrips = tickets.length;
  const lastTrip = tickets.length ? tickets[0].date : null;

  const rows = tickets.map((ticket) => (
    <Table.Tr key={ticket.id}>
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Avatar color="blue" radius="md">
            🚌
          </Avatar>
          <Stack gap={0}>
            <Text fw={600} size="sm">
              {ticket.id}
            </Text>
            <Text size="xs" c="dimmed">
              {ticket.from} → {ticket.to}
            </Text>
          </Stack>
        </Group>
      </Table.Td>

      <Table.Td>{ticket.date}</Table.Td>
      <Table.Td>{ticket.time}</Table.Td>
      <Table.Td>{ticket.price.toFixed(2)} JOD</Table.Td>
      <Table.Td>{ticket.quantity}</Table.Td>
      <Table.Td>
        {(ticket.total ?? ticket.price * ticket.quantity).toFixed(2)} JOD
      </Table.Td>

      <Table.Td>
        <Badge
          color={ticket.status === "Confirmed" ? "green" : "red"}
          variant="light"
        >
          {ticket.status}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Button size="xs" variant="light">
          View
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box component="main" style={{ flex: 1 }}>
        <Container size="xl" py="xl">
          <Stack gap="xl">
            <Stack gap={4}>
              <Title order={2}>My Ticket History</Title>
              <Text c="dimmed">
                View all your past trips and bookings in one place.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Card withBorder radius="xl" p="lg">
                <Stack align="center" gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    Total Spent
                  </Text>
                  <Text fw={800} size="xl">
                    {totalSpent.toFixed(2)} JOD
                  </Text>
                </Stack>
              </Card>

              <Card withBorder radius="xl" p="lg">
                <Stack align="center" gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    Total Trips
                  </Text>
                  <Text fw={700} size="xl">
                    {totalTrips}
                  </Text>
                </Stack>
              </Card>

              <Card withBorder radius="xl" p="lg">
                <Stack align="center" gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    Last Trip
                  </Text>
                  <Text fw={700} size="lg">
                    {lastTrip ?? "-"}
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

            <Paper withBorder radius="lg" p="lg">
              <Group justify="space-between" mb="md">
                <Text fw={600}>Trips</Text>
                <Button size="sm" variant="light">
                  Filter
                </Button>
              </Group>

              <ScrollArea>
                {tickets.length === 0 ? (
                  <Center mih={200}>
                    <Stack align="center">
                      <Avatar size="lg" radius="xl">
                        🚌
                      </Avatar>
                      <Text c="dimmed">No tickets found</Text>
                    </Stack>
                  </Center>
                ) : (
                  <Table
                    highlightOnHover
                    verticalSpacing="md"
                    miw={800}
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Ticket</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Time</Table.Th>
                        <Table.Th>Price</Table.Th>
                        <Table.Th>Qty</Table.Th>
                        <Table.Th>Total</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Action</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                  </Table>
                )}
              </ScrollArea>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
