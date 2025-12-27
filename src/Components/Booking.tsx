"use client";

import React, { useState } from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  NumberInput,
  Divider,
  Badge, // Added Badge for total price and balance status
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { Trip } from './TicketForm';
import { useTickets } from "@/Components/TicketStore";


interface BookingProps {
  opened: boolean;
  onClose: () => void;
  trip: Trip | null;
  balance: number;
  onBook: (price: number) => void;
}

function Booking({ opened, onClose, trip, balance, onBook }: BookingProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const { addTicket } = useTickets();

  if (!trip) return null;
  const maxAvailable = Math.max(0, trip.available_seats ?? 0); // trip.available_seats ?? 0 this means if trip.available_seats is null or undefined, use 0 instead
  const totalPrice = Number((quantity * trip.price_JOD).toFixed(2));

  const handleConfirm = () => {
    if (quantity < 1) {
      notifications.show({ title: 'Invalid quantity', message: 'Please select at least one ticket.', color: 'red' });
      return;
    }

    if (quantity > maxAvailable) {
      notifications.show({ title: 'Not enough seats', message: `Only ${maxAvailable} seats are available.`, color: 'red' });
      return;
    }

    if (balance >= totalPrice) {
      // build a ticket record
      const newTicket = {
        id: `TKT_${Date.now()}`,
        date: trip.departure_date,
        time: trip.departure_time,
        from: trip.origin_name ?? '',
        to: trip.destination_name ?? '', // we use ?? '' to ensure it's a string
        price: trip.price_JOD,
        quantity,
        total: totalPrice,
        status: 'Confirmed',
      };

      addTicket(newTicket);
      onBook(totalPrice);
      onClose(); 

    } else {
      notifications.show({
        title: 'Insufficient Balance',
        message: `You do not have enough balance. Required: ${totalPrice.toFixed(2)} JOD`,
        color: 'red',
      });
    }
  };

  // Determine the color for the balance status badge
  const balanceStatusColor = balance >= totalPrice ? 'green' : 'red';
  const balanceStatusText = balance >= totalPrice ? 'Funds are sufficient for this booking' : 'Insufficient funds to complete this booking';

  return (
    <Modal
      opened={opened}
      onClose={onClose} 
      centered
      radius="lg"
    >
      <Stack gap="md"> 
        <Group align="center" gap="xs">
          <Text fw={700} size="xl">
          {trip.origin_name} → {trip.destination_name}
          </Text>
        </Group>

        <Group gap="sm"> 
          <Text size="sm">Date: <Text span fw={500}>{trip.departure_date}</Text></Text>
          <Text size="sm">Time: <Text span fw={500}>{trip.departure_time}</Text></Text>
        </Group>

        <Group align="center" gap="xs">
          <Text size="md">Price per ticket: <Text span fw={600}>{trip.price_JOD.toFixed(2)} JOD</Text></Text>
        </Group>

        <NumberInput
          label="Number of Tickets" 
          description={`Available seats: ${maxAvailable}`} 
          min={1}
          max={maxAvailable}
          value={quantity}
          onChange={(v) => setQuantity(v ?? 1)} // (v ?? 1) means if the value (quantity) is null or undefined, use 1 instead
          styles={{ input: { width: 120 } }} 
          radius="md"
        />

        <Divider my="xs" /> {/* Added vertical margin */} 

        <Group justify="space-between" align="center">
          <Text fw={700} size="lg">Total Amount:</Text>
          <Badge size="xl" variant="light" color="blue" py="sm">
            {totalPrice.toFixed(2)} JOD
          </Badge>
        </Group>

        <Divider my="xs" />

        <Group justify="space-between" align="center">
          <Text size="md">Your Current Balance:</Text>
          <Text fw={600} size="md">{balance.toFixed(2)} JOD</Text>
        </Group>

        <Badge color={balanceStatusColor} variant="light" size="lg" fullWidth> 
          {balanceStatusText}
        </Badge>

        <Group justify="flex-end" mt="md"> 
          <Button variant="outline" onClick={onClose} radius="md">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={balance < totalPrice || quantity < 1 || quantity > maxAvailable}
            color="blue"
            radius="md"
          >
            Confirm Booking
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default Booking;