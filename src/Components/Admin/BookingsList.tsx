/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Paper,
  Text,
  Loader,
  Center,
  Group,
  ActionIcon,
  Modal,
  Button,
  Stack,
  Badge,
} from "@mantine/core";
import { IconRefresh, IconPencil } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiClientFetch } from "@/lib/apiClient";
import { Select, TextInput } from "@mantine/core";

type BookingDto = {
  bookingId: string;
  tripId: string;
  userId: string;
  bookingDate: string;
  bookingStatus: string;
  priceTotal: number;
  quantity: number;
  originName?: string;
  destinationName?: string;
  userName?: string;
};

export default function BookingsTable() {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChangeModal, setStatusChangeModal] = useState<{ open: boolean; id?: string; currentStatus?: string; newStatus?: string }>({ open: false });
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [quantityModal, setQuantityModal] = useState<{ open: boolean; id?: string; quantity?: number }>({ open: false });
  const [tripPriceMap, setTripPriceMap] = useState<Record<string, number>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });

  const fetchUsers = async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)];
    const newUserMap: Record<string, string> = {};

    for (const id of uniqueIds) {
      try {
        const res = await apiClientFetch(`/api/User/${id}`);
        if (res.ok) {
          const user = await res.json();
          newUserMap[id] = user.fullName || user.userName || "Unknown";
        }
      } catch (err: any) {
        console.error(`Failed to fetch user ${id}:`, err);
      }
    }
    setUserMap(newUserMap);
  };

  const fetchTripPrice = async (tripId: string) => {
    if (tripPriceMap[tripId]) {
      return tripPriceMap[tripId];
    }
    try {
      const res = await apiClientFetch(`/api/Trip/${tripId}`);
      if (res.ok) {
        const trip = await res.json();
        const price = trip.priceJod || 0;
        setTripPriceMap((prev) => ({ ...prev, [tripId]: price }));
        return price;
      }
    } catch (err: any) {
      console.error(`Failed to fetch trip ${tripId}:`, err);
    }
    return 0;
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClientFetch("/api/Booking");
      if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
      const data = await res.json();
      let bookingsData = Array.isArray(data) ? data : [];
      
      // Sort bookings by date - newest first
      bookingsData.sort((a: BookingDto, b: BookingDto) => {
        return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
      });
      
      setBookings(bookingsData);
      
      const userIds = bookingsData.map((b: BookingDto) => b.userId).filter(Boolean);
      if (userIds.length > 0) {
        await fetchUsers(userIds);
      }
    } catch (err: any) {
      notifications.show({ title: "Bookings", message: err.message || "Failed to load bookings", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBookingStatus = async (bookingId?: string, newStatus?: string) => {
    if (!bookingId || !newStatus) return;

    try {
      const res = await apiClientFetch(`/api/Booking/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to update status');
      }

      notifications.show({
        title: 'Booking Status Updated',
        message: `Booking status has been successfully changed to ${newStatus}.`,
        color: 'green',
      });

      setStatusChangeModal({ open: false });
      setConfirmDelete({ open: false });
      await fetchBookings();
    } catch (err: any) {
      notifications.show({
        title: 'Update Error',
        message: err.message || 'An unknown error occurred.',
        color: 'red',
      });
    }
  };

  const updateBookingQuantity = async (bookingId?: string, newQuantity?: number) => {
    if (!bookingId || newQuantity === undefined) return;
    try {
      const res = await apiClientFetch(`/api/Booking/${bookingId}/quantity`, {
        method: "PUT",
        body: JSON.stringify({
          quantity: newQuantity
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Update failed");
      }
      notifications.show({ title: "Booking", message: `Quantity updated successfully`, color: "green" });
      setQuantityModal({ open: false });
      await fetchBookings();
    } catch (err: any) {
      notifications.show({ title: "Booking", message: err.message || "Update failed", color: "red" });
    }
  };

  if (loading) {
    return (
      <Paper withBorder p="lg" radius="lg">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="space-between" mb="lg">
        <Text fw={650} size="md">Bookings ({bookings.length})</Text>
        <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={fetchBookings} leftSection={<IconRefresh size={16} />} fw={600}>Refresh</Button>
      </Group>

      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(6, 150, 217, 0.1)" }}>
        <Table verticalSpacing="lg" striped highlightOnHover fontSize="lg">
          <Table.Thead style={{ background: "rgba(0, 113, 219, 0.12)" }}>
            <Table.Tr>
              <Table.Th ta="center" fw={650} size="md">Booking ID</Table.Th>
              <Table.Th ta="center" fw={650} size="md">Owner</Table.Th>
              <Table.Th ta="center" fw={650} size="md">Route</Table.Th>
              <Table.Th ta="center" fw={650} size="md">Date</Table.Th>
              <Table.Th ta="center" fw={650} size="md">Status</Table.Th>
              <Table.Th ta="center" fw={650} size="md">Qty</Table.Th>
              <Table.Th ta="center" fw={650} size="md">Price (JOD)</Table.Th>
              <Table.Th ta="center" fw={650} size="md" style={{ width: 180 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bookings.map((b, idx) => (
              <Table.Tr key={b.bookingId || idx}>
                <Table.Td ta="center">{b.bookingId?.substring(0, 8)}...</Table.Td>
                <Table.Td ta="center">{userMap[b.userId] || b.userName || "Unknown"}</Table.Td>
                <Table.Td ta="center">{b.originName} → {b.destinationName}</Table.Td>
                <Table.Td ta="center">{new Date(b.bookingDate).toLocaleDateString()}</Table.Td>
                <Table.Td ta="center">
                    <Badge variant="light" color={b.bookingStatus === 'Confirmed' ? 'green' : b.bookingStatus === 'Cancelled' ? 'red' : 'gray'}>
                        {b.bookingStatus}
                    </Badge>
                </Table.Td>
                <Table.Td ta="center">{b.quantity}</Table.Td>
                <Table.Td ta="center">{b.priceTotal.toFixed(2)}</Table.Td>
                <Table.Td ta="center">
                  <Group gap="xs" justify="center">
                    <ActionIcon
                      color="orange"
                      variant="light"
                      size="lg"
                      onClick={() => {
                        setQuantityModal({ open: true, id: b.bookingId, quantity: b.quantity });
                      }}
                      title="Edit Quantity"
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                    <ActionIcon
                      color="blue"
                      variant="light"
                      size="lg"
                      onClick={() => setStatusChangeModal({ open: true, id: b.bookingId, currentStatus: b.bookingStatus, newStatus: b.bookingStatus })}
                      title="Change Status"
                    >
                      <IconRefresh size={18} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm Cancellation" radius="lg" centered>
        <Stack>
            <Text>Are you sure you want to cancel this booking? This will refund the user and cannot be undone.</Text>
            <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setConfirmDelete({ open: false })}>No, go back</Button>
                <Button color="red" onClick={() => updateBookingStatus(confirmDelete.id, "Cancelled")}>Yes, cancel booking</Button>
            </Group>
        </Stack>
      </Modal>

      <Modal opened={statusChangeModal.open} onClose={() => setStatusChangeModal({ open: false })} title="Change Booking Status" radius="lg" centered>
        <Stack gap="md">
          <Text size="lg" fw={600}>Current Status: <Text span fw={700} c="#0685d9ff">{statusChangeModal.currentStatus}</Text></Text>
          <Select
            label="New Status"
            placeholder="Select new status"
            data={[
              { label: "Confirmed", value: "Confirmed" },
              { label: "Cancelled", value: "Cancelled" },
            ]}
            value={statusChangeModal.newStatus}
            onChange={(val) => setStatusChangeModal((prev) => ({ ...prev, newStatus: val || "" }))}
            searchable
            size="md"
          />
          <Group justify="flex-end" gap="md">
            <Button variant="light" onClick={() => setStatusChangeModal({ open: false })} fw={600} size="md">Cancel</Button>
            <Button
              variant="gradient"
              gradient={{ from: '#0685d9ff', to: '#0b8cf5ff', deg: 90 }}
              onClick={() => {
                if (statusChangeModal.newStatus === 'Cancelled') {
                  setConfirmDelete({ open: true, id: statusChangeModal.id });
                  setStatusChangeModal({ open: false });
                } else {
                  updateBookingStatus(statusChangeModal.id, statusChangeModal.newStatus);
                }
              }}
              disabled={!statusChangeModal.newStatus || statusChangeModal.newStatus === statusChangeModal.currentStatus}
              fw={700}
              size="md"
            >
              Change Status
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={quantityModal.open} onClose={() => setQuantityModal({ open: false })} title="Edit Quantity" radius="lg" centered>
        <Stack gap="md">
          <TextInput
            label="Quantity"
            type="number"
            min="1"
            value={quantityModal.quantity || ""}
            onChange={(e) => {
              const qty = parseInt(e.currentTarget.value) || 0;
              setQuantityModal((prev) => ({ ...prev, quantity: qty }));
            }}
            size="md"
            fw={600}
          />
          <Group justify="flex-end" gap="md">
            <Button variant="light" onClick={() => setQuantityModal({ open: false })} fw={600} size="md">Cancel</Button>
            <Button 
              variant="gradient"
              gradient={{ from: "#22c55e", to: "#16a34a", deg: 90 }}
              onClick={() => updateBookingQuantity(quantityModal.id, quantityModal.quantity)}
              disabled={!quantityModal.quantity || quantityModal.quantity <= 0}
              fw={700}
              size="md"
            >
              Update
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
