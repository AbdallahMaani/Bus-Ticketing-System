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
  Flex,
  Box,
  Title,
} from "@mantine/core";
import { Transition } from '@mantine/core'; // Import Transition
import { useRouter } from "next/navigation";
import type { Trip } from "./TicketForm";
import Booking from "./Booking";

export default function TicketsResults({ trips, onShowOnMap, balance, onBook }: { trips: Trip[]; onShowOnMap?: (trip: Trip) => void; balance: number; onBook: (price: number) => void }) {
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
      {trips.map((trip) => {
        const isExpanded = expandedTripIds.includes(trip.trip_id);
        return (
          <Transition mounted={true} transition="fade" duration={400} key={trip.trip_id}>
            {(styles) => (
              <Paper shadow="md" p="lg" withBorder radius="lg" style={styles}>
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                  <Box>
                    <Group align="center" gap="xs" mb="xs">
                      <Text fw={700} size="xl">
                        {trip.origin_name}
                      </Text>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      <Text fw={700} size="xl">
                        {trip.destination_name}
                      </Text>
                    </Group>

                    <Group gap="md" mb="xs">
                      <Text c="dimmed" size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        {trip.departure_date}
                      </Text>
                      <Text c="dimmed" size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {trip.departure_time}
                      </Text>
                    </Group>
                    <Text c="dimmed" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {trip.origin_station}, {trip.origin_street}
                    </Text>
                  </Box>

                  <Stack align="flex-end" gap="xs">
                    <Badge color={trip.available_seats > 5 ? "green" : "red"} size="lg" radius="xl">
                      {trip.available_seats} Seats Left
                    </Badge>
                    <Text size="3rem" fw={700} c="green" lh={1}> {/*lh for line height*/ }
                      {trip.price_JOD.toFixed(2)}
                    </Text>
                    <Text size="md" fw={600} c="green" mt={-10}>JOD</Text> {/*mt is for margin top*/ }
                    <Group gap="xs" mt="sm" justify="center" style={{ alignSelf: "center" }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => toggleDetails(trip.trip_id)}
                        radius="md"
                        size="xs"
                      >
                        {isExpanded ? "Hide Details" : "Details"}
                      </Button>
                      <Button
                        variant="outline"
                        color="blue"
                        radius="md"
                        size="xs"
                        onClick={() => onShowOnMap?.(trip)}
                      >
                        Show on map
                      </Button>
                      <Button
                        color="blue"
                        radius="md"
                        size="xs"
                        onClick={() => handleBookNow(trip)}
                      >
                        Book Now
                      </Button>
                    </Group>
                  </Stack>
                </Flex>
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
                  {trip.distance_km && (
                    <Table.Tr>
                      <Table.Td fw={700}>Distance</Table.Td>
                      <Table.Td>{trip.distance_km} km</Table.Td>
                    </Table.Tr>
                  )}
                  {trip.duration_hrs && (
                    <Table.Tr>
                      <Table.Td fw={700}>Estimated Time</Table.Td>
                      <Table.Td>{trip.duration_hrs} hours</Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
              </Collapse>
              </Paper>
            )}
          </Transition>
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
