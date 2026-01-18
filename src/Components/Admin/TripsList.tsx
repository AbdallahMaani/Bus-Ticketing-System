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

type RouteDto = {
  routeId: string;
  fromStation?: string;
  toStation?: string;
  originId?: string;
  destinationId?: string;
};

type BusDto = {
  busId: string;
  model: string;
  type?: string;
};

type CityDto = {
  id: string;
  nameEn?: string;
  name?: string;
  busStations?: Array<{ id: string; nameEn?: string; stationName?: string }>;
};

type TripDto = {
  tripId: string;
  routeId: string;
  busId: string;
  originStationId?: string;
  destinationStationId?: string;
  departureTime?: string;
  departureDate?: string;
  arrivalTime?: string;
  priceJod?: number;
  price?: number;
  availableSeats: number;
  status?: string;
  originName?: string;
  destinationName?: string;
  busType?: string;
};

export default function TripsTable() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [buses, setBuses] = useState<BusDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<TripDto>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const [createModal, setCreateModal] = useState(false);
  const [newTrip, setNewTrip] = useState({ routeId: "", busId: "", originStationId: "", destinationStationId: "", departureDate: "", departureTime: "", availableSeats: 0, priceJod: 0, status: "Scheduled" });
  const [departureCityId, setDepartureCityId] = useState("");
  const [destinationCityId, setDestinationCityId] = useState("");

  const fetchRoutes = async () => {
    try {
      const res = await apiClientFetch("/api/Routes");
      if (res.ok) {
        const data = await res.json();
        setRoutes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch routes:", err);
    }
  };

  const fetchBuses = async () => {
    try {
      const res = await apiClientFetch("/api/Bus");
      if (res.ok) {
        const data = await res.json();
        setBuses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch buses:", err);
    }
  };

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
    fetchRoutes();
    fetchBuses();
    fetchCities();
    fetchTrips();
  }, []);

  const startEdit = (t: TripDto) => {
    setEditingId(t.tripId);
    setEditValues({ 
      routeId: t.routeId,
      busId: t.busId,
      originStationId: t.originStationId,
      destinationStationId: t.destinationStationId,
      departureDate: t.departureDate,
      departureTime: t.departureTime,
      availableSeats: t.availableSeats,
      priceJod: t.priceJod || t.price,
      status: t.status,
    });
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

  const handleRouteChange = (routeId: string) => {
    setNewTrip((prev) => ({ ...prev, routeId, originStationId: "", destinationStationId: "" }));
    
    const selectedRoute = routes.find((r) => r.routeId === routeId);
    if (selectedRoute && selectedRoute.originId && selectedRoute.destinationId) {
      setDepartureCityId(selectedRoute.originId);
      setDestinationCityId(selectedRoute.destinationId);
    }
  };

  const createTrip = async () => {
    if (!newTrip.routeId || !newTrip.busId || !newTrip.originStationId || !newTrip.destinationStationId || !newTrip.departureDate || !newTrip.departureTime || newTrip.availableSeats <= 0 || newTrip.priceJod <= 0) {
      notifications.show({ title: "Trip", message: "Please fill in all required fields", color: "orange" });
      return;
    }

    try {
      const formattedTime = newTrip.departureTime.includes(":") && newTrip.departureTime.split(":").length === 2
        ? `${newTrip.departureTime}:00`
        : newTrip.departureTime;

      const tripPayload = {
        routeId: newTrip.routeId,
        busId: newTrip.busId,
        originStationId: newTrip.originStationId,
        destinationStationId: newTrip.destinationStationId,
        departureDate: newTrip.departureDate,
        departureTime: formattedTime,
        availableSeats: newTrip.availableSeats,
        priceJod: newTrip.priceJod,
        status: newTrip.status || "Scheduled",
      };

      const res = await apiClientFetch("/api/Trip", {
        method: "POST",
        body: JSON.stringify(tripPayload),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Create failed");
      }
      notifications.show({ title: "Trip", message: "Created successfully", color: "green" });
      setCreateModal(false);
      setNewTrip({ routeId: "", busId: "", originStationId: "", destinationStationId: "", departureDate: "", departureTime: "", availableSeats: 0, priceJod: 0, status: "Scheduled" });
      setDepartureCityId("");
      setDestinationCityId("");
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
      <Paper withBorder p="lg" radius="lg">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="space-between" mb="lg">
        <Text fw={800} size="xl">Trips ({trips.length})</Text>
        <Group>
          <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={() => setCreateModal(true)} leftSection={<IconPlus size={16} />} fw={600}>Add Trip</Button>
          <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={fetchTrips} leftSection={<IconRefresh size={16} />} fw={600}>Refresh</Button>
        </Group>
      </Group>

      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(6, 150, 217, 0.1)" }}>
        <Table verticalSpacing="lg" striped highlightOnHover fontSize="md">
          <Table.Thead style={{ background: "rgba(0, 113, 219, 0.12)" }}>
            <Table.Tr>
              <Table.Th ta="center" fw={700}>Route</Table.Th>
              <Table.Th ta="center" fw={700}>Departure</Table.Th>
              <Table.Th ta="center" fw={700}>Price (JOD)</Table.Th>
              <Table.Th ta="center" fw={700}>Seats</Table.Th>
              <Table.Th ta="center" fw={700} style={{ width: 120 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {trips.map((t, idx) => (
              <Table.Tr key={t.tripId || idx}>
                <Table.Td ta="center">{t.originName} → {t.destinationName}</Table.Td>
                <Table.Td ta="center">
                  {editingId === t.tripId ? (
                    <TextInput type="datetime-local" value={editValues.departureTime} onChange={(e) => setEditValues({ ...editValues, departureTime: e.currentTarget.value })} size="xs" />
                  ) : (
                    t.departureTime ? new Date(t.departureTime).toLocaleString() : t.departureDate
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === t.tripId ? (
                    <TextInput type="number" value={editValues.priceJod || editValues.price} onChange={(e) => setEditValues({ ...editValues, priceJod: parseFloat(e.currentTarget.value), price: parseFloat(e.currentTarget.value) })} size="xs" step="0.01" style={{ width: 80, margin: 'auto' }} />
                  ) : (
                    (t.priceJod || t.price || 0).toFixed(2)
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === t.tripId ? (
                    <TextInput type="number" value={editValues.availableSeats} onChange={(e) => setEditValues({ ...editValues, availableSeats: parseInt(e.currentTarget.value) })} size="xs" style={{ width: 60, margin: 'auto' }} />
                  ) : (
                    (t.availableSeats || 0)
                  )}
                </Table.Td>
                <Table.Td ta="center">
                  {editingId === t.tripId ? (
                    <Group gap="xs" justify="center">
                      <Button size="xs" onClick={() => saveEdit(t.tripId)} variant="light">Save</Button>
                      <Button size="xs" variant="subtle" color="gray" onClick={() => setEditingId(null)}>Cancel</Button>
                    </Group>
                  ) : (
                    <Group gap="xs" justify="center">
                      <ActionIcon color="blue" variant="light" size="lg" onClick={() => startEdit(t)} title="Edit"><IconPencil size={18} /></ActionIcon>
                      <ActionIcon color="red" variant="light" size="lg" onClick={() => setConfirmDelete({ open: true, id: t.tripId })} title="Delete"><IconTrash size={18} /></ActionIcon>
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Modal opened={createModal} onClose={() => setCreateModal(false)} title="Add New Trip" radius="lg" centered>
        <Stack gap="sm">
          <Select
            label="Route"
            placeholder="Select a route"
            data={routes.map((r) => {
              const originCity = cities.find((c) => c.id === r.originId);
              const destCity = cities.find((c) => c.id === r.destinationId);
              return {
                label: `${originCity?.nameEn || r.originId} → ${destCity?.nameEn || r.destinationId}`,
                value: r.routeId,
              };
            })}
            value={newTrip.routeId}
            onChange={(val) => handleRouteChange(val || "")}
            searchable
          />
          <Select
            label="Bus"
            placeholder="Select a bus"
            data={buses.map((b) => ({ label: `${b.type || "Bus"} - ${b.model}`, value: b.busId }))}
            value={newTrip.busId}
            onChange={(val) => setNewTrip({ ...newTrip, busId: val || "" })}
            searchable
          />
          {departureCityId && (
            <Select
              label={`From: ${cities.find((c) => c.id === departureCityId)?.nameEn || departureCityId}`}
              placeholder="Select departure station"
              data={(cities.find((c) => c.id === departureCityId)?.busStations || [])
                .filter((s, idx, arr) => arr.findIndex((station) => station.id === s.id) === idx)
                .map((s) => ({
                  label: `${s.nameEn || s.stationName || s.id}`,
                  value: s.id,
                }))}
              value={newTrip.originStationId}
              onChange={(val) => setNewTrip({ ...newTrip, originStationId: val || "" })}
              searchable
            />
          )}
          {destinationCityId && (
            <Select
              label={`To: ${cities.find((c) => c.id === destinationCityId)?.nameEn || destinationCityId}`}
              placeholder="Select destination station"
              data={(cities.find((c) => c.id === destinationCityId)?.busStations || [])
                .filter((s, idx, arr) => arr.findIndex((station) => station.id === s.id) === idx)
                .map((s) => ({
                  label: `${s.nameEn || s.stationName || s.id}`,
                  value: s.id,
                }))}
              value={newTrip.destinationStationId}
              onChange={(val) => setNewTrip({ ...newTrip, destinationStationId: val || "" })}
              searchable
            />
          )}
          <Group grow>
            <TextInput label="Date" type="date" value={newTrip.departureDate} onChange={(e) => setNewTrip({ ...newTrip, departureDate: e.currentTarget.value })} />
            <TextInput label="Time" type="time" value={newTrip.departureTime} onChange={(e) => setNewTrip({ ...newTrip, departureTime: e.currentTarget.value })} />
          </Group>
          <Group grow>
             <TextInput label="Price (JOD)" type="number" step="0.01" value={newTrip.priceJod} onChange={(e) => setNewTrip({ ...newTrip, priceJod: parseFloat(e.currentTarget.value) })} />
             <TextInput label="Seats" type="number" value={newTrip.availableSeats} onChange={(e) => setNewTrip({ ...newTrip, availableSeats: parseInt(e.currentTarget.value) })} />
          </Group>
          <TextInput label="Status" value={newTrip.status} onChange={(e) => setNewTrip({ ...newTrip, status: e.currentTarget.value })} />
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={createTrip}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm delete" radius="lg" centered>
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