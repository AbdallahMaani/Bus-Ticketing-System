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
  Box,
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
    <Modal 
      opened={opened} 
      onClose={onClose} 
      centered 
      radius="lg" 
      size="lg"
    >
      <Stack gap="md">
        {/* Header */}
        <Box>
          <Text fw={800} size="xl" c="#1e40af" mb="4px">
            {trip.origin_name} → {trip.destination_name}
          </Text>
          <Text size="lg" c="dimmed">
            {trip.departure_date} at {trip.departure_time}
          </Text>
        </Box>

        {/* Trip Details */}
        <Box
          p="md"
          style={{
            borderRadius: "12px",
            background: "rgba(59, 130, 246, 0.05)",
            border: "1px solid rgba(59, 130, 246, 0.1)",
          }}
        >
          <Group justify="space-between" mb="md">
            <div>
              <Text size="sm" c="dimmed" fw={500}>Driver</Text>
              <Text size="xl" fw={600}>{trip.driver_name || 'N/A'}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" fw={500}>Available Seats</Text>
              <Text size="xl" fw={600}>{maxAvailable}</Text>
            </div>
          </Group>
          <Text size="sm" c="dimmed" fw={500}>Station</Text>
          <Text size="xl" fw={600}>{trip.origin_station_name || 'N/A'}</Text>
        </Box>

        {/* Features */}
        {trip.features && trip.features.length > 0 && (
          <Box>
            <Text size="xl" fw={600} mb="xs">Features</Text>
            <Group gap="xs">
              {trip.features.map((feature, idx) => (
                <Badge key={idx} variant="light" size="lg">
                  {feature}
                </Badge>
              ))}
            </Group>
          </Box>
        )}

        <Divider />

        {/* Pricing */}
        <Box>
          <Group justify="space-between" mb="lg">
            <Text size="xl" fw={500}>Price per ticket</Text>
            <Text size="xl" fw={700}>{trip.price_JOD.toFixed(2)} JOD</Text>
          </Group>

          <NumberInput 
            label="Number of Tickets" 
            min={1} 
            max={maxAvailable} 
            value={quantity} 
            onChange={(v) => setQuantity(Number(v) ?? 1)}
            radius="lg"
            size="lg"
          />
        </Box>

        {/* Total */}
        <Box
          p="lg"
          style={{
            borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.15)",
          }}
        >
          <Group justify="space-between" align="center">
            <Text fw={700} size="xl">Total</Text>
            <Badge 
              size="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
              fw={700}
            >
              {totalPrice.toFixed(2)} JOD
            </Badge>
          </Group>
        </Box>

        {/* Balance Status */}
        <Box
          p="lg"
          style={{
            borderRadius: "12px",
            background: balance >= totalPrice 
              ? "rgba(34, 197, 94, 0.05)"
              : "rgba(239, 68, 68, 0.05)",
            border: balance >= totalPrice 
              ? "1px solid rgba(34, 197, 94, 0.2)"
              : "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <Group justify="space-between" mb="xs">
            <Text size="xl" fw={500}>Your Balance</Text>
            <Text 
              fw={700} 
              size="xl"
              c={balance >= totalPrice ? "green" : "red"}
            >
              {balance.toFixed(2)} JOD
            </Text>
          </Group>
          <Badge 
            color={balanceStatusColor} 
            variant="light" 
            fullWidth
            fw={600}
          >
            {balanceStatusText}
          </Badge>
        </Box>

        {/* Buttons */}
        <Group justify="flex-end" gap="lg">
          <Button 
            variant="light" 
            onClick={onClose} 
            radius="lg"
            size="md"
            fw={700}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={balance < totalPrice || quantity < 1 || quantity > maxAvailable} 
            variant="gradient"
            gradient={{ from: "green", to: "teal", deg: 90 }}
            radius="lg"
            fw={700}
            size="md"
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