import React, { useState } from "react";
import type { Trip } from "./types";
import { 
  Button, 
  Text, 
  Paper, 
  Group, 
  Badge, 
  Collapse, 
  Stack, 
  Divider, 
  Grid 
} from "@mantine/core";

export default function TicketsResults({
  trips,
  balance = 0,
  onShowOnMap,
  onBook,
}: {
  trips: Trip[];
  balance?: number;
  onShowOnMap?: (trip: Trip) => void;
  onBook?: (trip: Trip) => void;
}) {
  if (trips.length === 0) {
    return (
      <Paper p="xl" withBorder style={{ textAlign: "center" }}>
        <Text c="dimmed">No trips match your criteria.</Text>
      </Paper>
    );
  }

  return (
    <div>
      {trips.map((trip) => (
        <TicketItem
          key={trip.trip_id}
          trip={trip}
          balance={balance}
          onShowOnMap={onShowOnMap}
          onBook={onBook}
        />
      ))}
    </div>
  );
}

function TicketItem({
  trip,
  balance,
  onShowOnMap,
  onBook,
}: {
  trip: Trip;
  balance: number;
  onShowOnMap?: (trip: Trip) => void;
  onBook?: (trip: Trip) => void;
}) {
  const [detailsOpened, setDetailsOpened] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Paper withBorder p="md" radius="md" mb="md">
      <Group justify="space-between">
        <div>
          <Text fw={500}>
            {trip.origin_name} to {trip.destination_name}
          </Text>
          <Text size="sm" c="dimmed">
            Departure: {trip.departure_date} at {trip.departure_time}
          </Text>
        </div>
        <Badge color="blue" variant="light">
          {trip.price_JOD.toFixed(2)} JOD
        </Badge>
      </Group>

      <Group justify="space-between" mt="md">
        <div>
          <Text size="sm">Seats available: {trip.available_seats}</Text>
          <Badge color={trip.status === "Scheduled" ? "green" : "orange"} variant="light" size="sm">
            {trip.status}
          </Badge>
        </div>
        <div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setDetailsOpened(!detailsOpened)}
          >
            {detailsOpened ? "Hide Details" : "View Details"}
          </Button>
          {onShowOnMap && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onShowOnMap(trip)}
              ml="xs"
            >
              Show on map
            </Button>
          )}
          {onBook &&
            (isLoggedIn ? (
              balance >= trip.price_JOD ? (
                <Button size="xs" ml="xs" onClick={() => onBook(trip)}>
                  Book
                </Button>
              ) : (
                <Button size="xs" ml="xs" disabled>
                  Insufficient balance
                </Button>
              )
            ) : (
              <Button size="xs" ml="xs" disabled>
                Login to book
              </Button>
            ))}
        </div>
      </Group>

      <Collapse in={detailsOpened}>
        <Stack gap="md" mt="md">
          <Divider />
          <div>
            <Text size="xs" c="dimmed" fw={500}>
              Trip Details
            </Text>
            <Grid gutter="sm" mt="xs">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Departure City
                  </Text>
                  <Text size="sm" fw={600}>
                    {trip.origin_name}
                  </Text>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Destination City
                  </Text>
                  <Text size="sm" fw={600}>
                    {trip.destination_name}
                  </Text>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Departure Station
                  </Text>
                  <Text size="sm" fw={600}>
                    {trip.origin_station_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {trip.origin_station_name_en}
                  </Text>
                </div>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Destination Station
                  </Text>
                  <Text size="sm" fw={600}>
                    {trip.destination_station_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {trip.destination_station_name_en}
                  </Text>
                </div>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Departure Street
                  </Text>
                  <Text size="sm" fw={600}>
                    {trip.origin_street}
                  </Text>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Destination Street
                  </Text>
                  <Text size="sm" fw={600}>
                    {trip.destination_street}
                  </Text>
                </div>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Bus Type
                  </Text>
                  <Text size="sm" fw={600}>
                    {trip.bus_type}
                  </Text>
                </div>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <div>
                  <Text size="xs" c="dimmed">
                    Driver
                  </Text>
                  <Text size="sm" fw={600}>
                    {trip.driver_name}
                  </Text>
                </div>
              </Grid.Col>
              
              {trip.features.length > 0 && (
                <Grid.Col span={12}>
                  <div>
                    <Text size="xs" c="dimmed">
                      Bus Features
                    </Text>
                    <Group gap="xs" mt={4}>
                      {trip.features.map((feature, index) => (
                        <Badge key={index} variant="outline" size="xs">
                          {feature}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                </Grid.Col>
              )}
            </Grid>
          </div>
        </Stack>
      </Collapse>
    </Paper>
  );
}