"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, ActionIcon, Text, Badge, Group, Paper } from "@mantine/core";
import { useSession } from "next-auth/react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import TicketForm from "../Components/TicketForm";
import type { Trip, Areas, City } from "../Components/types";
import TicketsResults from "@/Components/TicketsResults";
import BusMap, { BusMapRef } from "@/Components/BusMap";
import Booking from "@/Components/Booking";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import AdvancedFilters from "@/Components/AdvancedFilters";
import { apiClientFetch } from "@/lib/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

export default function Home() {
  const { data: session, status, update } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [unfilteredTrips, setUnfilteredTrips] = useState<Trip[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [fromCity, setFromCity] = useState<string | null>(null);
  const [toCity, setToCity] = useState<string | null>(null);
  const [allAreas, setAllAreas] = useState<Areas[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const mapRef = useRef<BusMapRef>(null);

  // Fetch balance from API when user is logged in
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const fetchBalance = async () => {
      try {
        const res = await apiClientFetch("/api/User/me");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance || 0);
        } else {
          console.error("Failed to fetch balance:", res.status);
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    fetchBalance();
  }, [status, session?.user?.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cityRes = await fetch(`${API_BASE_URL}/api/City`);
        const cityData: City[] = await cityRes.json();
        
        const allStations: Areas[] = cityData.flatMap((city: City) => 
          city.busStations.map((station: Areas) => ({
            ...station,
            city_id: city.id
          }))
        );
        setAllAreas(allStations);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };
    fetchData();
  }, []);

  const handleResults = (foundTrips: Trip[]) => {
    setTrips(foundTrips);
    setUnfilteredTrips(foundTrips);
  };

  const handleReset = () => {
    setResetKey((k) => k + 1);
    setTrips([]);
    setUnfilteredTrips([]);
    mapRef.current?.clearRoutes();
  };

  const handleShowOnMap = (trip: Trip) => {
    if (mapRef.current) {
      mapRef.current.showTripRoute(trip);
    } else {
      console.warn("Map reference not available to show trip route.");
    }
  };

  const handleBook = (trip: Trip) => {
    setSelectedTrip(trip);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = async (totalPrice: number) => {
    notifications.show({
      title: 'Booking Successful',
      message: 'Your trip has been booked! You can view it in your history.',
      color: 'green',
      icon: <IconCheck />,
    });
    
    // Update local balance state
    const newBalance = balance - totalPrice;
    setBalance(newBalance);
    
    // Update session
    await update({ balance: newBalance });
    
    setBookingModalOpen(false);
    setSelectedTrip(null);
  };

  return (
    <>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100%",
          backgroundColor: '#f8f9fa', 
        }}
      >
        <Header />

        <Box
          component="main"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            h={{ base: "auto", lg: "calc(100vh - 120px)" }} 
            mih={{ base: "auto", lg: 600 }}
            w="100%"
          >
            <Box
              w={{ base: "100%", lg: "23%" }}
              bg="#f8f9fa" 
              p={{ base: "1rem", lg: "1.5rem" }}
              style={{
                borderRight: "1px solid #e9ecef", 
                borderBottom: "1px solid #e9ecef", 
                overflowY: "auto",
                boxShadow: "2px 0 5px rgba(0, 0, 0, 0.05)",
              }}
            >
              <TicketForm 
                onResults={handleResults} 
                resetKey={resetKey} 
                onReset={() => { 
                  setTrips([]); 
                  setFromCity(null); 
                  setToCity(null); 
                }} 
                from={fromCity} 
                setFrom={setFromCity} 
                to={toCity} 
                setTo={setToCity} 
              />
              <div style={{ marginTop: "3rem" }}>
                {trips.length > 0 && (
                  <Group justify="center" mb="lg">
                    <Paper withBorder radius="xl" px="xl" py="sm" shadow="md">
                      <Group gap="sm">
                        <Text fw={600} size="lg">Available Trips</Text>
                        <Badge size="lg" radius="xl" variant="light" color="blue">
                          {trips.length}
                        </Badge>
                      </Group>
                    </Paper>
                  </Group>
                )}
                <Paper p="xs" style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}>
                  <TicketsResults 
                    trips={trips} 
                    onShowOnMap={handleShowOnMap} 
                    balance={balance} 
                    onBook={handleBook} 
                  />
                </Paper>
              </div>
            </Box>

            <Booking 
              opened={bookingModalOpen} 
              onClose={() => { 
                setBookingModalOpen(false); 
                setSelectedTrip(null); 
              }} 
              trip={selectedTrip} 
              balance={balance} 
              onBooked={handleBookingSuccess} 
            />
            
            <Box
              w={{ base: "100%", lg: "77%" }}
              bg="white" 
              p={{ base: "1rem", lg: "1rem" }}
              mih={{ base: 400, lg: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <Box
                w="100%"
                h="100%"
                bg="#f8f9fa" 
                p=".1rem"
                style={{
                  border: "2px dashed #dee2e6",
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "#666", 
                  position: "relative",
                }}
              >
                <BusMap ref={mapRef} allAreas={allAreas} fromCityId={fromCity} toCityId={toCity} />
                {!showAdvancedFilters && (
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    size="xl"
                    radius="xl"
                    onClick={() => setShowAdvancedFilters(true)}
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "20px",
                      zIndex: 10,
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                  </ActionIcon>
                )}
                {showAdvancedFilters && (
                  <Box
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "20px",
                      zIndex: 10,
                      maxWidth: "320px",
                    }}
                  >
                    <AdvancedFilters
                      onResults={setTrips}
                      onClose={() => setShowAdvancedFilters(false)}
                      onReset={handleReset}
                      currentTrips={unfilteredTrips}
                      onClearMapRoutes={() => mapRef.current?.clearRoutes()}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Flex>
        </Box>

        <Footer />
      </Box>
    </>
  );
}