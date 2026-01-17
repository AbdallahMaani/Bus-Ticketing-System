"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container, Title, Paper, Stack, Text, Loader, Center, Tabs } from "@mantine/core";
import { IconUsers, IconBus, IconMapPin, IconRoute, IconTicket, IconTrain } from "@tabler/icons-react";
import AdminLayout from "./AdminLayout";
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
    <AdminLayout>
      <Container size="xl" py="xl">
        <Stack spacing="lg">
          <Paper withBorder p="md" radius="md">
            <Title order={2}>Admin Dashboard</Title>
            <Text c="dimmed" mt="xs">
              Manage all system resources: users, bookings, buses, stations, trips, routes, and cities.
            </Text>
          </Paper>

          <Tabs defaultValue="users" color="orange">
            <Tabs.List grow>
              <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>Users</Tabs.Tab>
              <Tabs.Tab value="bookings" leftSection={<IconTicket size={16} />}>Bookings</Tabs.Tab>
              <Tabs.Tab value="buses" leftSection={<IconBus size={16} />}>Buses</Tabs.Tab>
              <Tabs.Tab value="stations" leftSection={<IconMapPin size={16} />}>Stations</Tabs.Tab>
              <Tabs.Tab value="trips" leftSection={<IconTrain size={16} />}>Trips</Tabs.Tab>
              <Tabs.Tab value="cities" leftSection={<IconMapPin size={16} />}>Cities</Tabs.Tab>
              <Tabs.Tab value="routes" leftSection={<IconRoute size={16} />}>Routes</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="users" pt="xl"><UserList /></Tabs.Panel>
            <Tabs.Panel value="bookings" pt="xl"><BookingsList /></Tabs.Panel>
            <Tabs.Panel value="buses" pt="xl"><BusesList /></Tabs.Panel>
            <Tabs.Panel value="stations" pt="xl"><StationsList /></Tabs.Panel>
            <Tabs.Panel value="trips" pt="xl"><TripsList /></Tabs.Panel>
            <Tabs.Panel value="cities" pt="xl"><CitiesList /></Tabs.Panel>
            <Tabs.Panel value="routes" pt="xl"><RoutesList /></Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </AdminLayout>
  );
}