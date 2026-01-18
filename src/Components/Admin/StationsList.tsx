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
  TextInput,
  Select,
} from "@mantine/core";
import { IconTrash, IconPencil, IconRefresh, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { apiClientFetch } from "@/lib/apiClient";

type CityDto = {
  id: string;
  nameEn?: string;
  name?: string;
};

type StationDto = {
  stationId?: string;
  id?: string;
  nameEn?: string;
  stationName?: string;
  streetEn?: string;
  street?: string;
  lat?: number;
  lng?: number;
};

export default function StationsTable() {
  const [stations, setStations] = useState<StationDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<StationDto>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const [createModal, setCreateModal] = useState(false);
  const [newStation, setNewStation] = useState({ cityId: "", nameEn: "", stationName: "", streetEn: "", lat: 0, lng: 0 });

  const fetchCities = async () => {
    try {
      const res = await apiClientFetch("/api/City");
      if (res.ok) {
        const data = await res.json();
        setCities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    }
  };

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
    fetchCities();
    fetchStations();
  }, []);

  const startEdit = (s: StationDto) => {
    setEditingId(s.stationId || s.id);
    setEditValues({ 
      nameEn: s.nameEn || "",
      stationName: s.stationName || "",
      streetEn: s.streetEn || "",
      lat: s.lat || 0,
      lng: s.lng || 0,
    });
  };

  const saveEdit = async (id: string) => {
    if (!editValues.nameEn?.trim() || !editValues.stationName?.trim() || !editValues.streetEn?.trim()) {
      notifications.show({ title: "Station", message: "Please fill in all required fields", color: "orange" });
      return;
    }

    try {
      const stationPayload = {
        nameEn: editValues.nameEn,
        stationName: editValues.stationName,
        streetEn: editValues.streetEn,
        lat: editValues.lat || 0,
        lng: editValues.lng || 0,
      };

      const res = await apiClientFetch(`/api/Station/${id}`, {
        method: "PUT",
        body: JSON.stringify(stationPayload),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Update failed");
      }
      notifications.show({ title: "Station", message: "Updated successfully", color: "green" });
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
      setNewStation({ cityId: "", nameEn: "", stationName: "", streetEn: "", lat: 0, lng: 0 });
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
      <Paper withBorder p="lg" radius="lg">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="space-between" mb="lg">
        <Text fw={800} size="xl">Stations ({stations.length})</Text>
        <Group>
          <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={() => setCreateModal(true)} leftSection={<IconPlus size={16} />} fw={600}>Add Station</Button>
          <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={fetchStations} leftSection={<IconRefresh size={16} />} fw={600}>Refresh</Button>
        </Group>
      </Group>

      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(6, 150, 217, 0.1)" }}>
        <Table verticalSpacing="lg" striped highlightOnHover fontSize="md">
          <Table.Thead style={{ background: "rgba(0, 113, 219, 0.12)" }}>
            <Table.Tr>
              <Table.Th ta="center" fw={700}>Name</Table.Th>
              <Table.Th ta="center" fw={700}>Street</Table.Th>
              <Table.Th ta="center" fw={700}>Latitude</Table.Th>
              <Table.Th ta="center" fw={700}>Longitude</Table.Th>
              <Table.Th ta="center" fw={700} style={{ width: 150 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {stations.map((s, idx) => {
              const currentId = s.id || s.stationId;
              return (
              <Table.Tr key={currentId || idx}>
                <Table.Td ta="center">
                  {editingId === currentId ? (
                    <TextInput value={String(editValues.nameEn ?? "")} onChange={(e) => setEditValues({ ...editValues, nameEn: e.currentTarget.value })} size="xs" />
                  ) : (
                    s.nameEn || s.stationName
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === currentId ? (
                    <TextInput value={String(editValues.streetEn ?? "")} onChange={(e) => setEditValues({ ...editValues, streetEn: e.currentTarget.value })} size="xs" />
                  ) : (
                    s.streetEn || s.street
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === currentId ? (
                    <TextInput type="number" step="0.0001" value={String(editValues.lat ?? "")} onChange={(e) => setEditValues({ ...editValues, lat: parseFloat(e.currentTarget.value) })} size="xs" style={{ width: 80, margin: 'auto' }} />
                  ) : (
                    s.lat?.toFixed(4) || 0
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === currentId ? (
                    <TextInput type="number" step="0.0001" value={String(editValues.lng ?? "")} onChange={(e) => setEditValues({ ...editValues, lng: parseFloat(e.currentTarget.value) })} size="xs" style={{ width: 80, margin: 'auto' }} />
                  ) : (
                    s.lng?.toFixed(4) || 0
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === currentId ? (
                    <Group gap="xs" justify="center">
                      <Button size="xs" onClick={() => saveEdit(currentId!)} variant="light">Save</Button>
                      <Button size="xs" variant="subtle" color="gray" onClick={() => setEditingId(null)}>Cancel</Button>
                    </Group>
                  ) : (
                    <Group gap="xs" justify="center">
                      <ActionIcon color="blue" variant="light" size="lg" onClick={() => startEdit(s)} title="Edit"><IconPencil size={18} /></ActionIcon>
                      <ActionIcon color="red" variant="light" size="lg" onClick={() => setConfirmDelete({ open: true, id: currentId })} title="Delete"><IconTrash size={18} /></ActionIcon>
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            );
            })}
          </Table.Tbody>
        </Table>
      </div>

      <Modal opened={createModal} onClose={() => setCreateModal(false)} title="Add New Station" radius="lg" centered>
        <Stack gap="sm">
          <Select
            label="City"
            placeholder="Select a city"
            data={cities.map((c) => ({ label: c.nameEn || c.name || c.id, value: c.id }))}
            value={newStation.cityId}
            onChange={(val) => setNewStation({ ...newStation, cityId: val || "" })}
            searchable
          />
          <TextInput label="Station Name (English)" value={newStation.nameEn} onChange={(e) => setNewStation({ ...newStation, nameEn: e.currentTarget.value })} />
          <TextInput label="Display Name" value={newStation.stationName} onChange={(e) => setNewStation({ ...newStation, stationName: e.currentTarget.value })} />
          <TextInput label="Street" value={newStation.streetEn} onChange={(e) => setNewStation({ ...newStation, streetEn: e.currentTarget.value })} />
          <Group grow>
            <TextInput label="Latitude" type="number" step="0.01" value={newStation.lat} onChange={(e) => setNewStation({ ...newStation, lat: parseFloat(e.currentTarget.value) })} />
            <TextInput label="Longitude" type="number" step="0.01" value={newStation.lng} onChange={(e) => setNewStation({ ...newStation, lng: parseFloat(e.currentTarget.value) })} />
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={createStation}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm delete" radius="lg" centered>
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