import React from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
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
  if (!trip) return null;

  const handleConfirm = () => {
    if (balance >= trip.price_JOD) {
      // build a ticket record
      const newTicket = {
        id: `TKT_${Date.now()}`,
        date: trip.departure_date,
        time: trip.departure_time,
        from: trip.origin_name,
        to: trip.destination_name,
        price: trip.price_JOD,
        quantity: 1,
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

      onBook(trip.price_JOD);
      notifications.show({
        title: 'Booking Successful!',
        message: `You have booked the trip from ${trip.origin_name} to ${trip.destination_name}. Amount deducted: ${trip.price_JOD.toFixed(2)} JOD`,
        color: 'green',
      });
      onClose();
    } else {
      notifications.show({
        title: 'Insufficient Balance',
        message: 'You do not have enough balance to book this trip.',
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
        <Divider />
        <Text>Your Balance: {balance.toFixed(2)} JOD</Text>
        <Text c={balance >= trip.price_JOD ? 'green' : 'red'}>
          {balance >= trip.price_JOD ? 'Sufficient funds' : 'Insufficient funds'}
        </Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose} radius="md">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={balance < trip.price_JOD}
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