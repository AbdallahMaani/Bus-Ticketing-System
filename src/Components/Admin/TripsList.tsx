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
  TextInput,
} from "@mantine/core";
import { IconTrash, IconPencil, IconRefresh, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiClientFetch } from "@/lib/apiClient";

type TripDto = {
  tripId: string;
  routeId: string;
  busId: string;
  departureTime?: string;
  departureDate?: string;
  arrivalTime?: string;
  priceJod?: number;
  price?: number;
  availableSeats: number;
  originName?: string;
  destinationName?: string;
  busType?: string;
};

export default function TripsTable() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<TripDto>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const [createModal, setCreateModal] = useState(false);
  const [newTrip, setNewTrip] = useState({ routeId: "", busId: "", departureTime: "", arrivalTime: "", price: 0, availableSeats: 0 });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await apiClientFetch("/api/Trip");
      if (!res.ok) throw new Error(`Failed to load trips (${res.status})`);
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notifications.show({ title: "Trips", message: err.message || "Failed to load trips", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const startEdit = (t: TripDto) => {
    setEditingId(t.tripId);
    setEditValues({ departureTime: t.departureTime, arrivalTime: t.arrivalTime, price: t.price, availableSeats: t.availableSeats });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await apiClientFetch(`/api/Trip/${id}`, {
        method: "PUT",
        body: JSON.stringify(editValues),
      });
      if (!res.ok) throw new Error("Update failed");
      notifications.show({ title: "Trip", message: "Updated", color: "green" });
      setEditingId(null);
      await fetchTrips();
    } catch (err: any) {
      notifications.show({ title: "Trip", message: err.message || "Update failed", color: "red" });
    }
  };

  const createTrip = async () => {
    try {
      const res = await apiClientFetch("/api/Trip", {
        method: "POST",
        body: JSON.stringify(newTrip),
      });
      if (!res.ok) throw new Error("Create failed");
      notifications.show({ title: "Trip", message: "Created", color: "green" });
      setCreateModal(false);
      setNewTrip({ routeId: "", busId: "", departureTime: "", arrivalTime: "", price: 0, availableSeats: 0 });
      await fetchTrips();
    } catch (err: any) {
      notifications.show({ title: "Trip", message: err.message || "Create failed", color: "red" });
    }
  };

  const confirmDeleteTrip = async (id?: string) => {
    if (!id) return;
    try {
      const res = await apiClientFetch(`/api/Trip/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notifications.show({ title: "Trip", message: "Deleted", color: "green" });
      setConfirmDelete({ open: false });
      await fetchTrips();
    } catch (err: any) {
      notifications.show({ title: "Trip", message: err.message || "Delete failed", color: "red" });
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
        <Text fw={700}>Trips ({trips.length})</Text>
        <Group>
          <Button size="xs" onClick={() => setCreateModal(true)} leftSection={<IconPlus size={16} />}>Add Trip</Button>
          <Button size="xs" variant="outline" onClick={fetchTrips} leftSection={<IconRefresh size={16} />}>Refresh</Button>
        </Group>
      </Group>

      <div style={{ overflowX: "auto" }}>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Route</Table.Th>
              <Table.Th>Departure</Table.Th>
              <Table.Th>Price (JOD)</Table.Th>
              <Table.Th>Available Seats</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {trips.map((t, idx) => (
              <Table.Tr key={t.tripId || idx}>
                <Table.Td>{t.originName} → {t.destinationName}</Table.Td>
                <Table.Td>
                  {editingId === t.tripId ? (
                    <TextInput type="datetime-local" value={editValues.departureTime} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, departureTime: value });
                    }} size="xs" />
                  ) : (
                    t.departureTime ? new Date(t.departureTime).toLocaleString() : t.departureDate
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === t.tripId ? (
                    <TextInput type="number" value={editValues.priceJod || editValues.price} onChange={(e) => {
                      const value = parseFloat(e.currentTarget.value);
                      setEditValues({ ...editValues, priceJod: value, price: value });
                    }} size="xs" step="0.01" />
                  ) : (
                    (t.priceJod || t.price || 0).toFixed(2)
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === t.tripId ? (
                    <TextInput type="number" value={editValues.availableSeats} onChange={(e) => {
                      const value = parseInt(e.currentTarget.value);
                      setEditValues({ ...editValues, availableSeats: value });
                    }} size="xs" />
                  ) : (
                    (t.availableSeats || 0)
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === t.tripId ? (
                    <Group gap="xs">
                      <Button size="xs" onClick={() => saveEdit(t.tripId)}>Save</Button>
                      <Button size="xs" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </Group>
                  ) : (
                    <Group gap="xs">
                      <ActionIcon color="blue" onClick={() => startEdit(t)} title="Edit"><IconPencil size={16} /></ActionIcon>
                      <ActionIcon color="red" onClick={() => setConfirmDelete({ open: true, id: t.tripId })} title="Delete"><IconTrash size={16} /></ActionIcon>
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Modal opened={createModal} onClose={() => setCreateModal(false)} title="Add New Trip">
        <Stack gap="sm">
          <TextInput label="Route ID" value={newTrip.routeId} onChange={(e) => setNewTrip({ ...newTrip, routeId: e.currentTarget.value })} />
          <TextInput label="Bus ID" value={newTrip.busId} onChange={(e) => setNewTrip({ ...newTrip, busId: e.currentTarget.value })} />
          <TextInput label="Departure Time" type="datetime-local" value={newTrip.departureTime} onChange={(e) => setNewTrip({ ...newTrip, departureTime: e.currentTarget.value })} />
          <TextInput label="Arrival Time" type="datetime-local" value={newTrip.arrivalTime} onChange={(e) => setNewTrip({ ...newTrip, arrivalTime: e.currentTarget.value })} />
          <TextInput label="Price" type="number" value={newTrip.price} onChange={(e) => setNewTrip({ ...newTrip, price: parseFloat(e.currentTarget.value) })} />
          <TextInput label="Available Seats" type="number" value={newTrip.availableSeats} onChange={(e) => setNewTrip({ ...newTrip, availableSeats: parseInt(e.currentTarget.value) })} />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={createTrip}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm delete">
        <Stack gap="sm">
          <Text>Are you sure you want to delete this trip?</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
            <Button color="red" onClick={() => confirmDeleteTrip(confirmDelete.id)}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
