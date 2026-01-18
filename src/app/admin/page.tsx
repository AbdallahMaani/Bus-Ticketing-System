"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container, Title, Paper, Stack, Text, Loader, Center, Tabs } from "@mantine/core";
import { IconUsers, IconBus, IconMapPin, IconRoute, IconTicket, IconTrain } from "@tabler/icons-react";
import Header from "@/Components/Header";
import UserList from "@/Components/Admin/UserList";
import BookingsList from "@/Components/Admin/BookingsList";
import BusesList from "@/Components/Admin/BusesList";
import StationsList from "@/Components/Admin/StationsList";
import TripsList from "@/Components/Admin/TripsList";
import CitiesList from "@/Components/Admin/CitiesList";
import RoutesList from "@/Components/Admin/RoutesList";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "Admin") {
      router.push("/");
      return;
    }

    setAuthorized(true);
  }, [session, status, router]);

  if (status === "loading" || !authorized) {
    return (
      <Container size="lg" py="xl">
        <Center style={{ minHeight: "60vh" }}>
          <Loader />
        </Center>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Paper 
            withBorder 
            p="xl" 
            radius="lg" 
            ta="center"
            style={{
              background: "linear-gradient(135deg, rgba(6, 140, 217, 0.04) 0%, rgba(11, 140, 245, 0.04) 100%)",
              border: "2px solid rgba(6, 133, 217, 0.2)",
              boxShadow: "0 4px 12px rgba(6, 150, 217, 0.08)",
            }}
          >
            <Title order={2} size="2.5rem" fw={800} c="#5595d1ff" mb="md">Admin Dashboard</Title>
            <Text c="dimmed" mt="xs" size="lg" fw={500}>
              Manage all system resources: users, bookings, buses, stations, trips, routes, and cities.
            </Text>
          </Paper>

          <Paper 
            withBorder 
            p="lg"
            radius="lg"
            style={{
              border: "1px solid rgba(6, 150, 217, 0.15)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Tabs defaultValue="users" color="blue" variant="pills" radius="md">
              <Tabs.List grow>
                <Tabs.Tab value="users" leftSection={<IconUsers size={20} />} fw={600} size="lg">Users</Tabs.Tab>
                <Tabs.Tab value="bookings" leftSection={<IconTicket size={20} />} fw={600} size="lg">Bookings</Tabs.Tab>
                <Tabs.Tab value="buses" leftSection={<IconBus size={20} />} fw={600} size="lg">Buses</Tabs.Tab>
                <Tabs.Tab value="stations" leftSection={<IconMapPin size={20} />} fw={600} size="lg">Stations</Tabs.Tab>
                <Tabs.Tab value="trips" leftSection={<IconTrain size={20} />} fw={600} size="lg">Trips</Tabs.Tab>
                <Tabs.Tab value="cities" leftSection={<IconMapPin size={20} />} fw={600} size="lg">Cities</Tabs.Tab>
                <Tabs.Tab value="routes" leftSection={<IconRoute size={20} />} fw={600} size="lg">Routes</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="users" pt="xl"><UserList /></Tabs.Panel>
              <Tabs.Panel value="bookings" pt="xl"><BookingsList /></Tabs.Panel>
              <Tabs.Panel value="buses" pt="xl"><BusesList /></Tabs.Panel>
              <Tabs.Panel value="stations" pt="xl"><StationsList /></Tabs.Panel>
              <Tabs.Panel value="trips" pt="xl"><TripsList /></Tabs.Panel>
              <Tabs.Panel value="cities" pt="xl"><CitiesList /></Tabs.Panel>
              <Tabs.Panel value="routes" pt="xl"><RoutesList /></Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}