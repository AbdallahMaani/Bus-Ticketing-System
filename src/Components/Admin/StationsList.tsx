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

type StationDto = {
  stationId?: string;
  id?: string;
  nameEn?: string;
  stationName?: string;
  streetEn?: string;
  street?: string;
};

export default function StationsTable() {
  const [stations, setStations] = useState<StationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<StationDto>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const [createModal, setCreateModal] = useState(false);
  const [newStation, setNewStation] = useState({ nameEn: "", streetEn: "" });

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await apiClientFetch("/api/Station");
      if (!res.ok) throw new Error(`Failed to load stations (${res.status})`);
      const data = await res.json();
      setStations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notifications.show({ title: "Stations", message: err.message || "Failed to load stations", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const startEdit = (s: StationDto) => {
    setEditingId(s.stationId);
    setEditValues({ nameEn: s.nameEn, streetEn: s.streetEn });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await apiClientFetch(`/api/Station/${id}`, {
        method: "PUT",
        body: JSON.stringify(editValues),
      });
      if (!res.ok) throw new Error("Update failed");
      notifications.show({ title: "Station", message: "Updated", color: "green" });
      setEditingId(null);
      await fetchStations();
    } catch (err: any) {
      notifications.show({ title: "Station", message: err.message || "Update failed", color: "red" });
    }
  };

  const createStation = async () => {
    try {
      const res = await apiClientFetch("/api/Station", {
        method: "POST",
        body: JSON.stringify(newStation),
      });
      if (!res.ok) throw new Error("Create failed");
      notifications.show({ title: "Station", message: "Created", color: "green" });
      setCreateModal(false);
      setNewStation({ nameEn: "", streetEn: "" });
      await fetchStations();
    } catch (err: any) {
      notifications.show({ title: "Station", message: err.message || "Create failed", color: "red" });
    }
  };

  const confirmDeleteStation = async (id?: string) => {
    if (!id) return;
    try {
      const res = await apiClientFetch(`/api/Station/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      notifications.show({ title: "Station", message: "Deleted", color: "green" });
      setConfirmDelete({ open: false });
      await fetchStations();
    } catch (err: any) {
      notifications.show({ title: "Station", message: err.message || "Delete failed", color: "red" });
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
        <Text fw={700}>Stations ({stations.length})</Text>
        <Group>
          <Button size="xs" onClick={() => setCreateModal(true)} leftSection={<IconPlus size={16} />}>Add Station</Button>
          <Button size="xs" variant="outline" onClick={fetchStations} leftSection={<IconRefresh size={16} />}>Refresh</Button>
        </Group>
      </Group>

      <div style={{ overflowX: "auto" }}>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Street</Table.Th>
              <Table.Th style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {stations.map((s, idx) => (
              <Table.Tr key={s.stationId || s.id || idx}>
                <Table.Td>
                  {editingId === s.stationId ? (
                    <TextInput value={String(editValues.nameEn ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, nameEn: value });
                    }} size="xs" />
                  ) : (
                    s.nameEn || s.stationName
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === s.stationId ? (
                    <TextInput value={String(editValues.streetEn ?? "")} onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues({ ...editValues, streetEn: value });
                    }} size="xs" />
                  ) : (
                    s.streetEn || s.street
                  )}
                </Table.Td>
                <Table.Td>
                  {editingId === s.stationId ? (
                    <Group gap="xs">
                      <Button size="xs" onClick={() => saveEdit(s.stationId || "")}>Save</Button>
                      <Button size="xs" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </Group>
                  ) : (
                    <Group gap="xs">
                      <ActionIcon color="blue" onClick={() => startEdit(s)} title="Edit"><IconPencil size={16} /></ActionIcon>
                      <ActionIcon color="red" onClick={() => setConfirmDelete({ open: true, id: s.stationId })} title="Delete"><IconTrash size={16} /></ActionIcon>
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Modal opened={createModal} onClose={() => setCreateModal(false)} title="Add New Station">
        <Stack gap="sm">
          <TextInput label="Station Name (English)" value={newStation.nameEn} onChange={(e) => {
            const value = e.currentTarget.value;
            setNewStation({ ...newStation, nameEn: value });
          }} />
          <TextInput label="Street (English)" value={newStation.streetEn} onChange={(e) => {
            const value = e.currentTarget.value;
            setNewStation({ ...newStation, streetEn: value });
          }} />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button onClick={createStation}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm delete">
        <Stack gap="sm">
          <Text>Are you sure you want to delete this station?</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
            <Button color="red" onClick={() => confirmDeleteStation(confirmDelete.id)}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
