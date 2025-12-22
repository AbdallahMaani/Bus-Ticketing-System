'use client';

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
  status: 'Confirmed' | 'Cancelled';
}

const mockTickets: TicketRecord[] = [
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
  const totalSpent = mockTickets.reduce(
    (sum, t) => sum + t.price * t.quantity,
    0
  );

  const totalTrips = mockTickets.length;
  const lastTrip = mockTickets.length ? mockTickets[0].date : null;

  const rows = mockTickets.map((ticket) => (
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
        {(ticket.price * ticket.quantity).toFixed(2)} JOD
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
            {/* Title and description */}
            <Stack align="center" gap="xs">
              <Title order={2}>My Ticket History</Title>
              <Text c="dimmed" size="md">Past trips, and bookings.</Text>
            </Stack>

            {/* Card with summary statistics - moved here */}
            <Center>
              <Card shadow="lg" radius="lg" withBorder miw={300}> {/* Added miw for minimum width */}
                <Stack gap={4} align="center"> {/* Changed Group to Stack, spacing to gap */}
                  <Text size="xs" c="dimmed">Total spent</Text>
                  <Text fw={700} size="lg">{totalSpent.toFixed(2)} JOD</Text>
                  <Group gap="md"> {/* Changed spacing to gap */}
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
                {mockTickets.length === 0 ? (
                  <Center mih={200}>
                    <Stack align="center">
                      <Text c="dimmed">No tickets found.</Text>
                      <Button>Search trips</Button>
                    </Stack>
                  </Center>
                ) : (
                  <Table
                    striped
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    miw={700}
                    verticalSpacing="sm"
                  >
                    <Table.Thead>
                      <Table.Tr ta="center">
                        <Table.Th ta="center">Ticket</Table.Th> {/* No ta="center" for this one to align with avatar group */}
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
            {/* Footer Actions - moved to be below the table */}
            <Group justify="center" mt="md">
              <Button variant="default">Filter</Button>
              <Button radius="md">Search History</Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}