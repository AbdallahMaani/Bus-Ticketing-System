"use client";

import React, { useEffect, useState } from 'react';

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
} from '@mantine/core';

import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

interface TicketRecord {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  price: number;
  quantity: number;
  total?: number;
  status: 'Confirmed' | 'Cancelled';
}

const mockTickets: TicketRecord[] = [ //dummy data 
  {
    id: 'TKT_001',
    date: '2025-12-15',
    time: '09:30',
    from: 'Amman',
    to: 'Irbid',
    price: 3.5,
    quantity: 1,
    status: 'Confirmed',
  },
  {
    id: 'TKT_002',
    date: '2025-12-10',
    time: '14:00',
    from: 'Irbid',
    to: 'Aqaba',
    price: 7.0,
    quantity: 2,
    status: 'Confirmed',
  },
  {
    id: 'TKT_003',
    date: '2025-11-25',
    time: '17:45',
    from: 'Irbid',
    to: 'Amman',
    price: 3.5,
    quantity: 1,
    status: 'Cancelled',
  },
  {
    id: 'TKT_023',
    date: '2025-11-22',
    time: '12:45',
    from: 'Zaraqa',
    to: 'Amman',
    price: 3.5,
    quantity: 2,
    status: 'Cancelled',
  }
];

export default function HistoryPage() {
  const [tickets, setTickets] = useState<TicketRecord[]>(mockTickets);

  useEffect(() => {
    // load stored tickets from localStorage (if any)
    try {
      const key = 'ticketHistory'; 
      const stored = localStorage.getItem(key);
      if (stored) {
        setTickets(JSON.parse(stored));
      }
    } catch (e) {}

    // listen for newly added tickets from Booking component
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as TicketRecord; // get the new ticket from from booking component using event 
        setTickets((prev) => {
          const updated = [detail, ...prev]; // add the new ticket to the beginning of the array
          try {
            localStorage.setItem('ticketHistory', JSON.stringify(updated)); // update localStorage
          } catch (err) {}
          return updated;
        });
      } catch (err) {}
    };

    window.addEventListener('ticketAdded', handler as EventListener); // listen for the custom event ( ticketAdded )
    return () => window.removeEventListener('ticketAdded', handler as EventListener);
  }, []);

  const totalSpent = tickets.reduce((sum, t) => sum + (t.total ?? t.price * t.quantity), 0); // the ?? operator means if t.total is null or undefined, use (t.price * t.quantity) instead

  const totalTrips = tickets.length;
  const lastTrip = tickets.length ? tickets[0].date : null;

  const rows = tickets.map((ticket) => (
    <Table.Tr key={ticket.id}>
      <Table.Td ta="center"> 
        <Group gap="sm" wrap="nowrap">
          <Avatar color="blue" radius="sm">
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

      <Table.Td ta="center">{ticket.date}</Table.Td>
      <Table.Td ta="center">{ticket.time}</Table.Td>
      <Table.Td ta="center">{ticket.price.toFixed(2)} JOD</Table.Td>
      <Table.Td ta="center">{ticket.quantity}</Table.Td>
      <Table.Td ta="center">
        {( (ticket.total ?? (ticket.price * ticket.quantity)) ).toFixed(2)} JOD
      </Table.Td>

      <Table.Td ta="center">
        <Badge
          color={ticket.status === 'Confirmed' ? 'green' : 'red'}
          variant="light"
        >
          {ticket.status}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Group justify="center">
          <Button size="sm" variant="outline">
            View
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <Box component="main" style={{ flex: 1, padding: '2rem' }}>
        <Container fluid>
          <Stack gap="lg">
          <Stack align="center" gap="xs">
              <Title order={2}>My Ticket History</Title>
              <Text c="dimmed" size="md">Past trips, and bookings.</Text>
            </Stack>

            <Center>
              <Card shadow="lg" radius="lg" withBorder miw={300}> {/* Added miw for minimum width */}
                <Stack gap={4} align="center"> 
                  <Text size="xs" c="dimmed">Total spent</Text>
                  <Text fw={700} size="lg">{totalSpent.toFixed(2)} JOD</Text>
                  <Group gap="md"> 
                    <Text size="xs" c="dimmed">Trips</Text>
                    <Text fw={600}>{totalTrips}</Text>
                    <Text size="xs" c="dimmed">Last trip</Text>
                    <Text fw={600}>{lastTrip ?? '-'}</Text> {/* Used nullish coalescing */}
                  </Group>
                </Stack>
              </Card>
            </Center>

            <Paper withBorder radius="md" p="md">
              <ScrollArea>
                {tickets.length === 0 ? (
                  <Center mih={200}>
                    <Stack align="center">
                      <Text c="dimmed">No tickets found.</Text>
                    </Stack>
                  </Center>
                ) : (
                  <Table
                    striped
                    highlightOnHover
                    withColumnBorders
                    miw={700}
                    verticalSpacing="sm"
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th ta="center">Ticket</Table.Th>
                        <Table.Th ta="center">Date</Table.Th>
                        <Table.Th ta="center">Time</Table.Th>
                        <Table.Th ta="center">Price</Table.Th>
                        <Table.Th ta="center">Quantity</Table.Th>
                        <Table.Th ta="center">Total</Table.Th>
                        <Table.Th ta="center">Status</Table.Th>
                        <Table.Th ta="center" w={140}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                  </Table>
                )}
              </ScrollArea>
            </Paper>
            <Group justify="center" mt="md">
              <Button radius="md">Filter</Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}