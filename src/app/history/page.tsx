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
import { useTickets } from "@/Components/TicketStore";

export default function HistoryPage() {
  const { tickets } = useTickets();

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