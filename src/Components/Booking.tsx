"use client";
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  NumberInput,
  Divider,
  Badge,
  Grid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiClientFetch } from '@/lib/apiClient';
import type { Trip } from './types';

interface BookingProps {
  opened: boolean;
  onClose: () => void;
  trip: Trip | null;
  balance: number;
  onBooked?: (price: number) => void;
}

function Booking({ opened, onClose, trip, balance, onBooked }: BookingProps) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  if (!trip) return null;
  const maxAvailable = Math.max(0, trip.available_seats ?? 0);
  const totalPrice = Number((quantity * trip.price_JOD).toFixed(2));

  const handleConfirm = async () => {
    if (quantity < 1) {
      notifications.show({ 
        title: 'Invalid quantity', 
        message: 'Please select at least one ticket.', 
        color: 'red' 
      });
      return;
    }
    if (quantity > maxAvailable) {
      notifications.show({ 
        title: 'Not enough seats', 
        message: `Only ${maxAvailable} seats are available.`, 
        color: 'red' 
      });
      return;
    }

    if (!session?.user) {
      notifications.show({ 
        title: 'Not authenticated', 
        message: 'Please login first.', 
        color: 'red' 
      });
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        userId: session.user.id,
        tripId: trip.trip_id,
        bookingDate: new Date().toISOString(),
        bookingStatus: 'Confirmed',
        quantity,
      };

      const res = await apiClientFetch('/api/Booking', {
        method: 'POST',
        body: JSON.stringify(bookingPayload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Unable to create booking');
      }

      await res.json();

      notifications.show({
        title: 'Success!',
        message: 'Your booking has been confirmed',
        color: 'green',
      });

      onBooked?.(totalPrice);
      onClose();
    } catch (err: any) {
      console.error("Booking error", err);
      notifications.show({ 
        title: 'Booking failed', 
        message: err.message || 'Network error during booking', 
        color: 'red' 
      });
    } finally {
      setLoading(false);
    }
  };

  const balanceStatusColor = balance >= totalPrice ? 'green' : 'red';
  const balanceStatusText = balance >= totalPrice 
    ? 'Funds are sufficient for this booking' 
    : 'Insufficient funds to complete this booking';

  return (
    <Modal opened={opened} onClose={onClose} centered radius="lg" size="lg">
      <Stack gap="md">
        <Group align="center" gap="xs">
          <Text fw={700} size="xl">{trip.origin_name} → {trip.destination_name}</Text>
        </Group>

        <Group gap="sm">
          <Text size="sm">Date: <Text span fw={500}>{trip.departure_date}</Text></Text>
          <Text size="sm">Time: <Text span fw={500}>{trip.departure_time}</Text></Text>
        </Group>

        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <div>
                <Text size="xs" c="dimmed" fw={500}>Driver Name</Text>
                <Text size="sm" fw={600}>{trip.driver_name || 'N/A'}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" fw={500}>Departure Station</Text>
                <Text size="sm" fw={600}>{trip.origin_station || trip.station_name || 'N/A'}</Text>
              </div>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <div>
                <Text size="xs" c="dimmed" fw={500}>Departure Street</Text>
                <Text size="sm" fw={600}>{trip.origin_street || 'N/A'}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" fw={500}>Available Seats</Text>
                <Text size="sm" fw={600}>{maxAvailable}</Text>
              </div>
            </Stack>
          </Grid.Col>
        </Grid>

        {trip.features && trip.features.length > 0 && (
          <div>
            <Text size="xs" c="dimmed" fw={500} mb="xs">Bus Features</Text>
            <Group gap="xs">
              {trip.features.map((feature, idx) => (
                <Badge key={idx} size="sm" variant="light" color="blue">{feature}</Badge>
              ))}
            </Group>
          </div>
        )}

        <Divider my="xs" />

        <Text size="md">Price per ticket: <Text span fw={600}>{trip.price_JOD.toFixed(2)} JOD</Text></Text>

        <NumberInput 
          label="Number of Tickets" 
          description={`Available seats: ${maxAvailable}`} 
          min={1} 
          max={maxAvailable} 
          value={quantity} 
          onChange={(v) => setQuantity(Number(v) ?? 1)} 
          styles={{ input: { width: 120 } }} 
          radius="md" 
        />

        <Divider my="xs" />
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg">Total Amount:</Text>
          <Badge size="xl" variant="light" color="blue" py="sm">{totalPrice.toFixed(2)} JOD</Badge>
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
          <Button variant="outline" onClick={onClose} radius="md">Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={balance < totalPrice || quantity < 1 || quantity > maxAvailable} 
            color="blue" 
            radius="md"
            loading={loading}
          >
            Confirm Booking
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default Booking;