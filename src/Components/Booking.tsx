import React, { useState } from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  NumberInput,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { Trip } from './TicketForm';

interface BookingProps {
  opened: boolean;
  onClose: () => void;
  trip: Trip | null;
  balance: number;
  onBook: (price: number) => void;
}

function Booking({ opened, onClose, trip, balance, onBook }: BookingProps) {
  const [quantity, setQuantity] = useState<number>(1);

  if (!trip) return null;
  const maxAvailable = Math.max(0, trip.available_seats ?? 0);
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
        from: trip.origin_name,
        to: trip.destination_name,
        price: trip.price_JOD,
        quantity,
        total: totalPrice,
        status: 'Confirmed',
      } as const;

      // persist the ticket to localStorage
      try {
        const key = 'ticketHistory'; 
        const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        const arr = existing ? JSON.parse(existing) : [];
        arr.unshift(newTicket); // unshift method is a way to add an element to the beginning of an array
        if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(arr));

        // emit custom event so history page can update immediately
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ticketAdded', { detail: newTicket }));
        }
      } catch (e) {
        console.error("Error saving ticket to localStorage:", e);
      }

      onBook(totalPrice);
      notifications.show({
        title: 'Booking Successful!',
        message: `You have booked ${quantity} ticket${quantity > 1 ? 's' : ''} from ${trip.origin_name} to ${trip.destination_name}. Amount deducted: ${totalPrice.toFixed(2)} JOD`,
        color: 'green',
      });
      onClose();
    } else {
      notifications.show({
        title: 'Insufficient Balance',
        message: `You do not have enough balance. Required: ${totalPrice.toFixed(2)} JOD`,
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Confirm Booking" centered radius="lg">
      <Stack>
        <Text fw={700} size="lg">
          {trip.origin_name} → {trip.destination_name}
        </Text>
        <Text>Date: {trip.departure_date}</Text>
        <Text>Time: {trip.departure_time}</Text>
        <Text>Price: {trip.price_JOD.toFixed(2)} JOD</Text>
        <NumberInput
          label="Quantity"
          min={1}
          max={maxAvailable}
          value={quantity}
          onChange={(v) => setQuantity(v ?? 1)}
          styles={{ input: { width: 120 } }}
          radius="md"
        />
        <Text>Total: {totalPrice.toFixed(2)} JOD</Text>
        <Text size="sm" c={quantity <= maxAvailable ? 'dimmed' : 'red'}>
          {`Available seats: ${maxAvailable}`}
        </Text>
        <Divider />
        <Text>Your Balance: {balance.toFixed(2)} JOD</Text>
        <Text c={balance >= totalPrice ? 'green' : 'red'}>
          {balance >= totalPrice ? 'Sufficient funds' : 'Insufficient funds'}
        </Text>
        <Group justify="flex-end">
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