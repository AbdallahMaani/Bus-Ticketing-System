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

type BusDto = {
  busId: string;
  licensePlate?: string;
  model: string;
  capacity: number;
  totalSeats?: number;
  operator?: string;
  type?: string;
  modelYear?: number;
  driverName?: string;
  features?: string;
};

export default function BusesTable() {
  const [buses, setBuses] = useState<BusDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<BusDto>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const [createModal, setCreateModal] = useState(false);
  const [newBus, setNewBus] = useState({ operator: "", type: "", capacity: 0, model: "", modelYear: 0, driverName: "", features: "" });

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await apiClientFetch("/api/Bus");
      if (!res.ok) throw new Error(`Failed to load buses (${res.status})`);
      const data = await res.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notifications.show({ title: "Buses", message: err.message || "Failed to load buses", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const startEdit = (b: BusDto) => {
    setEditingId(b.busId);
    setEditValues({ 
      licensePlate: b.licensePlate, 
      model: b.model, 
      capacity: b.capacity, 
      totalSeats: b.totalSeats,
      operator: b.operator,
      type: b.type,
      modelYear: b.modelYear,
      driverName: b.driverName,
      features: b.features
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await apiClientFetch(`/api/Bus/${id}`, {
        method: "PUT",
        body: JSON.stringify(editValues),
      });
      if (!res.ok) throw new Error("Update failed");
      notifications.show({ title: "Bus", message: "Updated", color: "green" });
      setEditingId(null);
      await fetchBuses();
    } catch (err: any) {
      notifications.show({ title: "Bus", message: err.message || "Update failed", color: "red" });
    }
  };

  const createBus = async () => {
    // Validate required fields
    if (!newBus.operator?.trim() || !newBus.type?.trim() || !newBus.model?.trim() || newBus.capacity <= 0 || newBus.modelYear <= 0) {
      notifications.show({ title: "Bus", message: "Please fill in all required fields (Operator, Type, Model, Capacity, Model Year)", color: "orange" });
      return;
    }

    try {
      const busPayload = {
        operator: newBus.operator,
        type: newBus.type,
        capacity: newBus.capacity,
        model: newBus.model,
        modelYear: newBus.modelYear,
        driverName: newBus.driverName || "",
        features: newBus.features || "",
      };

      const res = await apiClientFetch("/api/Bus", {
        method: "POST",
        body: JSON.stringify(busPayload),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Create failed");
      }
      notifications.show({ title: "Bus", message: "Created successfully", color: "green" });
      setCreateModal(false);
      setNewBus({ operator: "", type: "", capacity: 0, model: "", modelYear: 0, driverName: "", features: "" });
      await fetchBuses();
    } catch (err: any) {
      notifications.show({ title: "Bus", message: err.message || "Create failed", color: "red" });
    }
  };

  const confirmDeleteBus = async (id?: string) => {
    if (!id) return;
    try {
      const res = await apiClientFetch(`/api/Bus/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notifications.show({ title: "Bus", message: "Deleted", color: "green" });
      setConfirmDelete({ open: false });
      await fetchBuses();
    } catch (err: any) {
      notifications.show({ title: "Bus", message: err.message || "Delete failed", color: "red" });
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
        <Text fw={800} size="xl">Buses ({buses.length})</Text>
        <Group>
          <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={() => setCreateModal(true)} leftSection={<IconPlus size={16} />} fw={600}>Add Bus</Button>
          <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={fetchBuses} leftSection={<IconRefresh size={16} />} fw={600}>Refresh</Button>
        </Group>
      </Group>

      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(217, 119, 6, 0.1)" }}>
        <Table verticalSpacing="lg" striped highlightOnHover fontSize="md">
          <Table.Thead style={{ background: "rgba(0, 113, 219, 0.12)" }}>
            <Table.Tr>
              <Table.Th ta="center" fw={700}>Operator</Table.Th>
              <Table.Th ta="center" fw={700}>Type</Table.Th>
              <Table.Th ta="center" fw={700}>Model</Table.Th>
              <Table.Th ta="center" fw={700}>Year</Table.Th>
              <Table.Th ta="center" fw={700}>Capacity</Table.Th>
              <Table.Th ta="center" fw={700}>Driver</Table.Th>
              <Table.Th ta="center" fw={700}>Features</Table.Th>
              <Table.Th ta="center" fw={700} style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {buses.map((b, idx) => (
              <Table.Tr key={b.busId || idx}>
                <Table.Td ta="center">
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.operator ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, operator: value });
                    }} size="xs" />
                  ) : (
                    b.operator
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.type ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, type: value });
                    }} size="xs" />
                  ) : (
                    b.type
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.model ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, model: value });
                    }} size="xs" />
                  ) : (
                    b.model
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === b.busId ? (
                    <TextInput type="number" value={editValues.modelYear} onChange={(e) => {
                      const value = parseInt(e.currentTarget.value);
                      setEditValues({ ...editValues, modelYear: value });
                    }} size="xs" />
                  ) : (
                    b.modelYear
                  )}
                </Table.Td>
                <Table.Td ta="center">{b.capacity || 0}</Table.Td>
                <Table.Td ta="center">
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.driverName ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, driverName: value });
                    }} size="xs" />
                  ) : (
                    b.driverName
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.features ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, features: value });
                    }} size="xs" />
                  ) : (
                    <Text size="xs">{b.features}</Text>
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === b.busId ? (
                    <Group gap="xs">
                      <Button size="xs" onClick={() => saveEdit(b.busId)}>Save</Button>
                      <Button size="xs" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </Group>
                  ) : (
                    <Group gap="xs">
                      <ActionIcon color="blue" variant="light" size="lg" onClick={() => startEdit(b)} title="Edit"><IconPencil size={16} /></ActionIcon>
                      <ActionIcon color="red" variant="light" size="lg" onClick={() => setConfirmDelete({ open: true, id: b.busId })} title="Delete"><IconTrash size={16} /></ActionIcon>
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Modal opened={createModal} onClose={() => setCreateModal(false)} title="Add New Bus">
        <Stack gap="sm">
          <TextInput label="Operator" value={newBus.operator} onChange={(e) => {
            const value = e.currentTarget.value;
            setNewBus({ ...newBus, operator: value });
          }} />
          <TextInput label="Type" value={newBus.type} onChange={(e) => {
            const value = e.currentTarget.value;
            setNewBus({ ...newBus, type: value });
          }} />
          <TextInput label="Model" value={newBus.model} onChange={(e) => {
            const value = e.currentTarget.value;
            setNewBus({ ...newBus, model: value });
          }} />
          <TextInput label="Model Year" type="number" value={newBus.modelYear} onChange={(e) => {
            const value = parseInt(e.currentTarget.value);
            setNewBus({ ...newBus, modelYear: value });
          }} />
          <TextInput label="Capacity" type="number" value={newBus.capacity} onChange={(e) => {
            const value = parseInt(e.currentTarget.value);
            setNewBus({ ...newBus, capacity: value });
          }} />
          <TextInput label="Driver Name" value={newBus.driverName} onChange={(e) => {
            const value = e.currentTarget.value;
            setNewBus({ ...newBus, driverName: value });
          }} />
          <TextInput label="Features" value={newBus.features} onChange={(e) => {
            const value = e.currentTarget.value;
            setNewBus({ ...newBus, features: value });
          }} placeholder="e.g., WiFi,AC,USB Charger" />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={createBus}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm delete">
        <Stack gap="sm">
          <Text>Are you sure you want to delete this bus?</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
            <Button color="red" onClick={() => confirmDeleteBus(confirmDelete.id)}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
