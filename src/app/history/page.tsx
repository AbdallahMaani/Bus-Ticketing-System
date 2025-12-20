'use client';

import { Container, Title, Table, Button, Group, Box } from '@mantine/core';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

// Example data structure for a ticket record
interface TicketRecord {
  id: string;
  date: string;
  from: string;
  to: string;
  price: number;
  status: 'Confirmed' | 'Cancelled';
}

// Mock data for demonstration purposes
const mockTickets: TicketRecord[] = [
  {
    id: 'TKT_001',
    date: '2025-12-15',
    from: 'Amman',
    to: 'Irbid',
    price: 3.5,
    status: 'Confirmed',
  },
  {
    id: 'TKT_002',
    date: '2025-12-10',
    from: 'Irbid',
    to: 'Aqaba',
    price: 7.0,
    status: 'Confirmed',
  },
  {
    id: 'TKT_003',
    date: '2025-11-25',
    from: 'Irbid',
    to: 'Amman',
    price: 3.5,
    status: 'Cancelled',
  },
];

export default function HistoryPage() {
  const rows = mockTickets.map((ticket) => (
    <Table.Tr key={ticket.id}>
      <Table.Td>{ticket.id}</Table.Td>
      <Table.Td>{ticket.date}</Table.Td>
      <Table.Td>{ticket.from}</Table.Td>
      <Table.Td>{ticket.to}</Table.Td>
      <Table.Td>{ticket.price.toFixed(2)} JOD</Table.Td>
      <Table.Td>{ticket.status}</Table.Td>
      <Table.Td>
        <Button size="xs" variant="outline">
          View Details
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <Header />
      <Box component="main" style={{ flex: 1, padding: '2rem' }}>
        <Container fluid>
          <Title order={2} mb="lg">
            My Ticket History
          </Title>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead ta="center">
              <Table.Tr >
                <Table.Th>Ticket ID</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>From</Table.Th>
                <Table.Th>To</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
          <Group mt="lg">
            <Button>Search History</Button>
          </Group>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
