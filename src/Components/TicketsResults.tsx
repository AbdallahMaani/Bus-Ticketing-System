import React, { useState } from "react";
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  Badge,
  Collapse,
  Table,
  Center,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import type { Trip } from "./TicketForm";
import Booking from "./Booking";

export default function TicketsResults({ trips, onShowOnMap, balance, setBalance, onBook }: { trips: Trip[]; onShowOnMap?: (lat?: number, lng?: number) => void; balance: number; setBalance: (balance: number | ((prev: number) => number)) => void; onBook: (price: number) => void }) {
  // this line defines the component and its props the props are typed using TypeScript and they are expected to be an array of Trip objects
  const [expandedTripIds, setExpandedTripIds] = useState<string[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const router = useRouter();

  const toggleDetails = (id: string) => {
    setExpandedTripIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBookNow = (trip: Trip) => {
    const currentUserJson = localStorage.getItem("currentUser");
    if (!currentUserJson) {
      router.push("/auth/login");
      return;
    }
    setSelectedTrip(trip);
    setBookingOpen(true);
  };

  if (!trips || trips.length === 0) {
    return (
      <Paper shadow="md" p="xl" withBorder radius="lg" w="100%">
        <Center>
          <Stack align="center" gap="xs">
            <Title order={4} c="dimmed" ta="center">
              Search for trips to see available options.
            </Title>
            <Text c="dimmed" size="sm">
              Thanks for using Jordan Bus System.
            </Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Stack gap="md" w="100%">
      <Text size="xl" fw={700} mb="sm" ta="center">
        Available Trips ({trips.length})
      </Text>
      {trips.map((trip) => {
        const isExpanded = expandedTripIds.includes(trip.trip_id);
        return (
          <Paper key={trip.trip_id} shadow="md" p="lg" withBorder radius="lg">
            <Group justify="center" align="center" gap="xl">
              <Stack align="center" gap={5}>
                <Group justify="center" mb={5}>
                  <Text fw={700} size="lg">
                    {trip.origin_name} - {trip.destination_name}
                  </Text>
                  <Badge color={trip.available_seats > 5 ? "green" : "red"}>
                    {trip.available_seats} Seats Left
                  </Badge>
                </Group>
                <Text c="dimmed" size="sm">
                  Date: {trip.departure_date}
                </Text>
                <Text c="dimmed" size="sm">
                  Departure Time:{" "}
                  {trip.departure_time}
                </Text>
                <Text c="dimmed" size="sm">
                  Station: {trip.origin_station}
                </Text>
                <Text c="dimmed" size="sm">
                  Street: {trip.origin_street}
                </Text>
              </Stack>

              <Stack align="center" gap="xs">
                <Text size="xl" fw={800} c="blue" mb={5}>
                  {trip.price_JOD.toFixed(2)} JOD
                </Text>
                <Group justify="center" gap="xs">
                  <Button
                    variant="light"
                    color="blue"
                    onClick={() => toggleDetails(trip.trip_id)}
                    radius="md"
                    size="xs"
                  >
                    {isExpanded ? "Hide Details" : "Details"}
                  </Button>
                  <Button variant="outline" color="blue" radius="md" size="xs" onClick={() => onShowOnMap?.(trip.origin_lat, trip.origin_lng)}>
                    Show on map
                  </Button>
                  <Button color="blue" radius="md" size="xs" onClick={() => handleBookNow(trip)}>
                    Book Now
                  </Button>
                </Group>
              </Stack>
            </Group>
            <Collapse in={isExpanded} mt="md">
              <Table striped highlightOnHover withTableBorder>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td fw={700} w={150}>
                      Trip ID
                    </Table.Td>
                    <Table.Td>{trip.trip_id}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={700}>Driver</Table.Td>
                    <Table.Td>{trip.driver_name}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={700}>Features</Table.Td>
                    <Table.Td>{trip.features.join(", ")}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={700}>Rating</Table.Td>
                    <Table.Td>{trip.rating}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Collapse>
          </Paper>
        );
      })}
      <Booking
        opened={bookingOpen}
        onClose={() => setBookingOpen(false)}
        trip={selectedTrip}
        balance={balance}
        onBook={onBook}
      />
    </Stack>
  );
}
