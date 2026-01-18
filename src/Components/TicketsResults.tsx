import React, { useState, useEffect } from "react";
import type { Trip } from "./types";
import { useSession } from "next-auth/react";
import { 
  Button, 
  Text, 
  Paper, 
  Group, 
  Badge, 
  Collapse, 
  Stack, 
  Divider, 
  Grid,
  Box,
  Card,
  ThemeIcon,
} from "@mantine/core";
import { 
  IconMapPin, 
  IconClock, 
  IconUsers,
  IconBus,
  IconUser,
  IconWifi,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

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
      <Paper 
        p="xl" 
        withBorder 
        radius="lg"
        style={{ 
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(234, 179, 8, 0.05) 100%)",
          border: "1.5px solid rgba(239, 68, 68, 0.2)",
        }}
      >
        <Text size="lg" fw={600} c="dimmed">
          No trips match your criteria.
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          Try adjusting your search dates or locations
        </Text>
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
function TicketItem({trip,balance,onShowOnMap,onBook }: {trip: Trip;balance: number;onShowOnMap?: (trip: Trip) => void;onBook?: (trip: Trip) => void}) {
  const [detailsOpened, setDetailsOpened] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  return (
    <Paper 
      withBorder 
      p="lg" 
      radius="lg" 
      mb="md"
      style={{
        boxShadow: "0 4px 16px rgba(59, 130, 246, 0.12)",
        border: "1px solid rgba(59, 130, 246, 0.15)",
        background: "linear-gradient(135deg, #ffffff 0%, rgba(59, 130, 246, 0.03) 100%)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(59, 130, 246, 0.12)";
      }}
    >
      {/* Header Section */}
      <Group justify="space-between" mb="md">
        <Box>
          <Group gap="xs" mb="xs">
            <ThemeIcon size="lg" radius="lg" variant="light" color="blue">
              <IconBus size={24} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="lg" c="#1e40af">
                {trip.origin_name} → {trip.destination_name}
              </Text>
              <Group gap="xs" mt="4px">
                <Group gap="4px">
                  <IconClock size={14} color="#6b7280" />
                  <Text size="sm" c="dimmed" fw={500}>
                    {trip.departure_date} at {trip.departure_time}
                  </Text>
                </Group>
              </Group>
            </div>
          </Group>
        </Box>
        
        <Box ta="right">
          <Text size="xs" c="dimmed" fw={500} mb="4px">Price</Text>
          <Badge 
            size="xl"
            variant="gradient" 
            gradient={{ from: "blue", to: "cyan", deg: 90 }}
            fw={700}
          >
            {trip.price_JOD.toFixed(2)} JOD
          </Badge>
        </Box>
      </Group>

      {/* Status and Info Section */}
      <Group justify="space-between" mb="md">
        <Group gap="lg">
          <div>
            <Group gap="4px" mb="4px">
              <IconUsers size={16} color="#6b7280" />
              <Text size="sm" fw={500}>
                {trip.available_seats} seats available
              </Text>
            </Group>
            <Badge 
              color={trip.status === "Scheduled" ? "green" : trip.status === "Cancelled" ? "red" : "yellow"} 
              variant="light" 
              size="md"
              fw={600}
            >
              {trip.status}
            </Badge>
          </div>
        </Group>

        {/* Action Buttons */}
        <Group gap="xs">
          <Button
            variant={detailsOpened ? "filled" : "light"}
            size="sm"
            radius="lg"
            rightSection={detailsOpened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            onClick={() => setDetailsOpened(!detailsOpened)}
          >
            {detailsOpened ? "Hide" : "Details"}
          </Button>
          {onShowOnMap && (
            <Button
              variant="light"
              size="sm"
              radius="lg"
              leftSection={<IconMapPin size={16} />}
              onClick={() => onShowOnMap(trip)}
              color="blue"
            >
              Map
            </Button>
          )}
          {onBook &&
            (isLoggedIn ? (
              balance >= trip.price_JOD ? (
                <Button 
                  size="sm" 
                  radius="lg"
                  variant="gradient"
                  gradient={{ from: "green", to: "teal", deg: 90 }}
                  fw={600}
                  onClick={() => onBook(trip)}
                >
                  Book Now
                </Button>
              ) : (
                <Button size="sm" radius="lg" disabled>
                  Insufficient balance
                </Button>
              )
            ) : (
              <Button size="sm" radius="lg" disabled>
                Login to book
              </Button>
            ))}
        </Group>
      </Group>

      {/* Collapsible Details Section */}
      <Collapse in={detailsOpened}>
        <Divider my="md" />
        <Stack gap="lg">
          <div>
            <Text size="sm" fw={700} c="#1e40af" mb="md">
              Trip Information
            </Text>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box
                  p="sm"
                  style={{
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.05)",
                    border: "1px solid rgba(59, 130, 246, 0.1)",
                  }}
                >
                  <Group gap="xs" mb="4px">
                    <IconMapPin size={16} color="#3b82f6" />
                    <Text size="xs" c="dimmed" fw={500}>
                      Departure City
                    </Text>
                  </Group>
                  <Text size="sm" fw={700}>
                    {trip.origin_name}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box
                  p="sm"
                  style={{
                    borderRadius: "10px",
                    background: "rgba(34, 197, 94, 0.05)",
                    border: "1px solid rgba(34, 197, 94, 0.1)",
                  }}
                >
                  <Group gap="xs" mb="4px">
                    <IconMapPin size={16} color="#22c55e" />
                    <Text size="xs" c="dimmed" fw={500}>
                      Destination City
                    </Text>
                  </Group>
                  <Text size="sm" fw={700}>
                    {trip.destination_name}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box p="sm" style={{ borderRadius: "10px", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                  <Text size="xs" c="dimmed" fw={500} mb="4px">
                    Departure Station
                  </Text>
                  <Text size="sm" fw={700}>
                    {trip.origin_station_name}
                  </Text>
                  <Text size="xs" c="dimmed" mt="4px">
                    {trip.origin_station_name_en}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box p="sm" style={{ borderRadius: "10px", background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.1)" }}>
                  <Text size="xs" c="dimmed" fw={500} mb="4px">
                    Destination Station
                  </Text>
                  <Text size="sm" fw={700}>
                    {trip.destination_station_name}
                  </Text>
                  <Text size="xs" c="dimmed" mt="4px">
                    {trip.destination_station_name_en}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box p="sm" style={{ borderRadius: "10px", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                  <Text size="xs" c="dimmed" fw={500} mb="4px">
                    Departure Street
                  </Text>
                  <Text size="sm" fw={700}>
                    {trip.origin_street}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box p="sm" style={{ borderRadius: "10px", background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.1)" }}>
                  <Text size="xs" c="dimmed" fw={500} mb="4px">
                    Destination Street
                  </Text>
                  <Text size="sm" fw={700}>
                    {trip.destination_street}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box p="sm" style={{ borderRadius: "10px", background: "rgba(168, 85, 247, 0.05)", border: "1px solid rgba(168, 85, 247, 0.1)" }}>
                  <Group gap="xs" mb="4px">
                    <IconBus size={16} color="#a855f7" />
                    <Text size="xs" c="dimmed" fw={500}>
                      Bus Type
                    </Text>
                  </Group>
                  <Text size="sm" fw={700}>
                    {trip.bus_type}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Box p="sm" style={{ borderRadius: "10px", background: "rgba(249, 115, 22, 0.05)", border: "1px solid rgba(249, 115, 22, 0.1)" }}>
                  <Group gap="xs" mb="4px">
                    <IconUser size={16} color="#f97316" />
                    <Text size="xs" c="dimmed" fw={500}>
                      Driver
                    </Text>
                  </Group>
                  <Text size="sm" fw={700}>
                    {trip.driver_name}
                  </Text>
                </Box>
              </Grid.Col>
              {trip.features.length > 0 && (
                <Grid.Col span={12}>
                  <div>
                    <Text size="sm" fw={700} c="#1e40af" mb="md">
                      Bus Features
                    </Text>
                    <Group gap="md">
                      {trip.features.map((feature, index) => (
                        <Badge 
                          key={index} 
                          variant="gradient"
                          gradient={{ from: "blue", to: "cyan", deg: 90 }}
                          size="md"
                          fw={600}
                        >
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