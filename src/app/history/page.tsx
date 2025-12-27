"use client";

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
} from "@mantine/core";
import { useRouter } from "next/navigation";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { useTickets } from "@/Components/TicketStore";

export default function HistoryPage() {
  const router = useRouter();
  const { tickets } = useTickets(); // we destructure tickets from useTickets hook

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("currentUser");

    if (!userJson) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(false);
      return;
    }

    try {  
      const user = JSON.parse(userJson);
      setIsLoggedIn(!!user); // !! converts to boolean
    } catch (err) {
      console.error("Invalid user data");
      setIsLoggedIn(false);
    }
  }, []);

  if (isLoggedIn === null) {
    return null;
  }

  const totalSpent = tickets.reduce(
    (sum, t) => sum + (t.total ?? t.price * t.quantity),
    0
  );
  const totalTrips = tickets.length;
  const lastTrip = tickets.length ? tickets[0].date : "-";

  const rows = tickets.map((ticket) => ( // maps tickets from the usetickets to the table 
    <Table.Tr key={ticket.id}> {/* above in JS we use // to write a Javascript comment below in HTML we use {/**/}{/* to write a Javascript comment*/}
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Avatar color="blue" radius="md">
            🚌
          </Avatar>
          <Stack gap={0}>
            <Text fw={600} size="sm" c="blue">
              {ticket.id}
            </Text>
            <Text size="xs" c="dimmed">
              {ticket.from} → {ticket.to}
            </Text>
          </Stack>
        </Group>
      </Table.Td> 

      <Table.Td ta="center">{ticket.date}</Table.Td>
      <Table.Td ta="center">{ticket.time}</Table.Td>
      <Table.Td ta="center">{ticket.price.toFixed(2)} JOD</Table.Td>
      <Table.Td ta="center">{ticket.quantity}</Table.Td>
      <Table.Td ta="center">
        {(ticket.total ?? ticket.price * ticket.quantity).toFixed(2)} JOD
      </Table.Td>
      <Table.Td ta="center">
        <Badge
          color={ticket.status === "Confirmed" ? "green" : "red"}
          variant="light"
        >
          {ticket.status}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box component="main" style={{ flex: 1 }}>
        <Container size="xl" py="xl">

          {!isLoggedIn && (
            <Center mih={400}>
              <Paper withBorder p="xl" radius="lg">
                <Stack align="center" gap="md">
                  <Title order={3}>You are not logged in</Title>
                  <Text c="dimmed" ta="center">
                    Please login to view your ticket history
                  </Text>
                  <Button
                    size="md"
                    onClick={() => router.push("/auth/login")}
                  >
                    Go to Login
                  </Button>
                </Stack>
              </Paper>
            </Center>
          )}

          {isLoggedIn && (
            <Stack gap="xl">
              <Paper shadow="md" p="xl" withBorder radius="lg">
                <Center>
                  <Stack align="center" gap="xs">
                    <Title order={4} ta="center" c="dimmed">
                      My Ticket History
                    </Title>
                    <Text c="dimmed" size="sm">
                      View all your past trips and bookings
                    </Text>
                  </Stack>
                </Center>
              </Paper>

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <Card withBorder radius="xl" p="lg">
                  <Stack align="center">
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Total Spent
                    </Text>
                    <Text fw={800} size="xl">
                      {totalSpent.toFixed(2)} JOD
                    </Text>
                  </Stack>
                </Card>

                <Card withBorder radius="xl" p="lg">
                  <Stack align="center">
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Total Trips
                    </Text>
                    <Text fw={700} size="xl">
                      {totalTrips}
                    </Text>
                  </Stack>
                </Card>

                <Card withBorder radius="xl" p="lg">
                  <Stack align="center">
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Last Trip
                    </Text>
                    <Text fw={700} size="lg">
                      {lastTrip}
                    </Text>
                  </Stack>
                </Card>
              </SimpleGrid>

              <Paper withBorder radius="lg" p="lg">
                <ScrollArea>
                  {tickets.length === 0 ? (
                    <Center mih={200}>
                      <Text c="dimmed">No tickets found</Text>
                    </Center>
                  ) : (
                    <Table highlightOnHover miw={800}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th ta="center">Ticket</Table.Th>
                          <Table.Th ta="center">Date</Table.Th>
                          <Table.Th ta="center">Time</Table.Th>
                          <Table.Th ta="center">Price</Table.Th>
                          <Table.Th ta="center">Quantity</Table.Th>
                          <Table.Th ta="center">Total</Table.Th>
                          <Table.Th ta="center">Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                  )}
                </ScrollArea>
              </Paper>
            </Stack>
          )}

        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
