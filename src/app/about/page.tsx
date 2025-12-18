"use client";

import React from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Stack,
  List,
  ThemeIcon,
} from "@mantine/core";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

export default function AboutPage() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <main style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <Container size="lg" py={60}>
          <Stack gap="xl">
            {/* Hero Section */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <Title order={1} mb="sm" style={{ color: "#222" }}>
                About Jordan Bus System
              </Title>
              <Text c="dimmed" size="lg" maw={800} mx="auto">
                Connecting Jordan's cities with reliable, comfortable, and
                affordable bus travel.
              </Text>
            </div>

            {/* Content Grid */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={50}>
              {/* Mission Statement */}
              <div>
                <Title order={2} mb="md" size="h3" style={{ color: "#333" }}>
                  Our Mission
                </Title>
                <Text c="dimmed" style={{ lineHeight: 1.6 }}>
                  We aim to revolutionize intercity travel in Jordan by
                  providing a unified platform for booking bus tickets. Whether
                  you are commuting between Amman and Irbid or planning a trip
                  to Aqaba, our system ensures a seamless experience from
                  booking to boarding.
                </Text>
                <List
                  mt="lg"
                  spacing="sm"
                  size="sm"
                  center
                  icon={
                    <ThemeIcon color="blue" size={24} radius="xl">
                      <svg
                        style={{ width: 12, height: 12 }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </ThemeIcon>
                  }
                >
                  <List.Item>Real-time schedules and availability</List.Item>
                  <List.Item>Secure and instant booking confirmation</List.Item>
                  <List.Item>Wide network of trusted bus operators</List.Item>
                </List>
              </div>

              {/* Feature Cards */}
              <Stack gap="md">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Text fw={700} size="lg" mb="xs" c="blue">
                    Reliability
                  </Text>
                  <Text size="sm" c="dimmed">
                    We partner with top-rated operators to ensure punctual and
                    safe journeys for all passengers.
                  </Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Text fw={700} size="lg" mb="xs" c="blue">
                    Convenience
                  </Text>
                  <Text size="sm" c="dimmed">
                    Book your tickets from the comfort of your home. No more
                    waiting in lines at the station.
                  </Text>
                </Card>
              </Stack>
            </SimpleGrid>
          </Stack>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
