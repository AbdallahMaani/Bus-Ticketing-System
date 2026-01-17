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
  const [newBus, setNewBus] = useState({ licensePlate: "", model: "", capacity: 0, totalSeats: 0, operator: "", type: "", modelYear: 0, driverName: "", features: "" });

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
    try {
      const res = await apiClientFetch("/api/Bus", {
        method: "POST",
        body: JSON.stringify(newBus),
      });
      if (!res.ok) throw new Error("Create failed");
      notifications.show({ title: "Bus", message: "Created", color: "green" });
      setCreateModal(false);
      setNewBus({ licensePlate: "", model: "", capacity: 0, totalSeats: 0 });
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
      <Paper withBorder p="md">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Text fw={700}>Buses ({buses.length})</Text>
        <Group>
          <Button size="xs" onClick={() => setCreateModal(true)} leftSection={<IconPlus size={16} />}>Add Bus</Button>
          <Button size="xs" variant="outline" onClick={fetchBuses} leftSection={<IconRefresh size={16} />}>Refresh</Button>
        </Group>
      </Group>

      <div style={{ overflowX: "auto" }}>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Operator</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Model</Table.Th>
              <Table.Th>Year</Table.Th>
              <Table.Th>Capacity</Table.Th>
              <Table.Th>Driver</Table.Th>
              <Table.Th>Features</Table.Th>
              <Table.Th style={{ width: 100 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {buses.map((b, idx) => (
              <Table.Tr key={b.busId || idx}>
                <Table.Td>
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.operator ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, operator: value });
                    }} size="xs" />
                  ) : (
                    b.operator
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.type ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, type: value });
                    }} size="xs" />
                  ) : (
                    b.type
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.model ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, model: value });
                    }} size="xs" />
                  ) : (
                    b.model
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === b.busId ? (
                    <TextInput type="number" value={editValues.modelYear} onChange={(e) => {
                      const value = parseInt(e.currentTarget.value);
                      setEditValues({ ...editValues, modelYear: value });
                    }} size="xs" />
                  ) : (
                    b.modelYear
                  )}
                </Table.Td>
                <Table.Td>{b.capacity || 0}</Table.Td>
                <Table.Td>
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.driverName ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, driverName: value });
                    }} size="xs" />
                  ) : (
                    b.driverName
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === b.busId ? (
                    <TextInput value={String(editValues.features ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, features: value });
                    }} size="xs" />
                  ) : (
                    <Text size="xs">{b.features}</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === b.busId ? (
                    <Group gap="xs">
                      <Button size="xs" onClick={() => saveEdit(b.busId)}>Save</Button>
                      <Button size="xs" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </Group>
                  ) : (
                    <Group gap="xs">
                      <ActionIcon color="blue" onClick={() => startEdit(b)} title="Edit"><IconPencil size={16} /></ActionIcon>
                      <ActionIcon color="red" onClick={() => setConfirmDelete({ open: true, id: b.busId })} title="Delete"><IconTrash size={16} /></ActionIcon>
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
          <TextInput label="License Plate" value={newBus.licensePlate} onChange={(e) => setNewBus({ ...newBus, licensePlate: e.currentTarget.value })} />
          <TextInput label="Model" value={newBus.model} onChange={(e) => setNewBus({ ...newBus, model: e.currentTarget.value })} />
          <TextInput label="Capacity" type="number" value={newBus.capacity} onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.currentTarget.value) })} />
          <TextInput label="Total Seats" type="number" value={newBus.totalSeats} onChange={(e) => setNewBus({ ...newBus, totalSeats: parseInt(e.currentTarget.value) })} />
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
