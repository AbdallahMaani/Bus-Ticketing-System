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
} from "@mantine/core";
import { IconTrash, IconRefresh, IconEdit } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiClientFetch } from "@/lib/apiClient";
import { Select } from "@mantine/core";

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
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const [statusChangeModal, setStatusChangeModal] = useState<{ open: boolean; id?: string; currentStatus?: string; newStatus?: string }>({ open: false });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClientFetch("/api/Booking");
      if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notifications.show({ title: "Bookings", message: err.message || "Failed to load bookings", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const confirmDeleteBooking = async (id?: string) => {
    if (!id) return;
    try {
      const res = await apiClientFetch(`/api/Booking/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      notifications.show({ title: "Booking", message: "Deleted", color: "green" });
      setConfirmDelete({ open: false });
      await fetchBookings();
    } catch (err: any) {
      notifications.show({ title: "Booking", message: err.message || "Delete failed", color: "red" });
    }
  };

  const updateBookingStatus = async (bookingId?: string, newStatus?: string) => {
    if (!bookingId || !newStatus) return;
    try {
      const res = await apiClientFetch(`/api/Booking/${bookingId}`, {
        method: "PUT",
        body: JSON.stringify({
          bookingId,
          bookingStatus: newStatus,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Update failed");
      }
      notifications.show({ title: "Booking", message: `Status changed to ${newStatus}`, color: "green" });
      setStatusChangeModal({ open: false });
      await fetchBookings();
    } catch (err: any) {
      notifications.show({ title: "Booking", message: err.message || "Update failed", color: "red" });
    }
  };

  if (loading) {
    return (
      <Paper withBorder p="md">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Text fw={700}>Bookings ({bookings.length})</Text>
        <Button size="xs" variant="outline" onClick={fetchBookings} leftSection={<IconRefresh size={16} />}>Refresh</Button>
      </Group>

      <div style={{ overflowX: "auto" }}>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Booking ID</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th>Route</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Qty</Table.Th>
              <Table.Th>Price (JOD)</Table.Th>
              <Table.Th style={{ width: 100 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bookings.map((b, idx) => (
              <Table.Tr key={b.bookingId || idx}>
                <Table.Td>{b.bookingId?.substring(0, 8)}...</Table.Td>
                <Table.Td>{b.userName || "Unknown"}</Table.Td>
                <Table.Td>{b.originName} → {b.destinationName}</Table.Td>
                <Table.Td>{new Date(b.bookingDate).toLocaleDateString()}</Table.Td>
                <Table.Td>{b.bookingStatus}</Table.Td>
                <Table.Td>{b.quantity}</Table.Td>
                <Table.Td>{b.priceTotal.toFixed(2)}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      onClick={() => setStatusChangeModal({ open: true, id: b.bookingId, currentStatus: b.bookingStatus })}
                      title="Change Status"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => setConfirmDelete({ open: true, id: b.bookingId })}
                      title="Delete"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm delete">
        <Stack gap="sm">
          <Text>Are you sure you want to delete this booking?</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
            <Button color="red" onClick={() => confirmDeleteBooking(confirmDelete.id)}>Delete</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={statusChangeModal.open} onClose={() => setStatusChangeModal({ open: false })} title="Change Booking Status">
        <Stack gap="sm">
          <Text>Current Status: <strong>{statusChangeModal.currentStatus}</strong></Text>
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
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setStatusChangeModal({ open: false })}>Cancel</Button>
            <Button 
              color="blue" 
              onClick={() => updateBookingStatus(statusChangeModal.id, statusChangeModal.newStatus)}
              disabled={!statusChangeModal.newStatus || statusChangeModal.newStatus === statusChangeModal.currentStatus}
            >
              Change Status
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
