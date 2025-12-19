"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, ActionIcon } from "@mantine/core";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import TicketForm, { Trip } from "../Components/TicketForm";
import TicketsResults from "@/Components/TicketsResults";
import BusMap, { BusMapRef } from "@/Components/BusMap";
import AdvancedFilters from "@/Components/AdvancedFilters";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [unfilteredTrips, setUnfilteredTrips] = useState<Trip[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [busData, setBusData] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const mapRef = useRef<BusMapRef>(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const res = await fetch("/jordan_bus_data.json");
        const data = await res.json();
        setBusData(data);
        
        // Get balance from logged-in user or default
        const currentUserJson = localStorage.getItem("currentUser");
        if (currentUserJson) {
          const currentUser = JSON.parse(currentUserJson);
          setBalance(currentUser.balance || 0);
        } else {
          // Default to U1001 if no user logged in
          const user = data.users.find((u: any) => u.user_id === 'U1001');
          setBalance(user ? user.balance : 1000);
        }
      } catch (err) {
        console.error("Error loading bus data:", err);
        setBalance(1000);
      }
    };
    fetchBusData();
  }, []);
  const handleResults = (foundTrips: Trip[]) => {
    setTrips(foundTrips);
    setUnfilteredTrips(foundTrips);
    setSearched(true);
  };

  const handleReset = () => {
    setResetKey((k) => k + 1);
    setTrips([]);
    setUnfilteredTrips([]);
    setSearched(false);
    // Clear map routes and markers
    mapRef.current?.clearRoutes();
  };

  const handleShowOnMap = (lat?: number, lng?: number) => {
    if (lat && lng && mapRef.current) {
      mapRef.current.zoomTo(lat, lng);
    }
  };

  const handleBook = (price: number) => {
    setBalance(prev => {
      const newBalance = prev - price;
      // Update localStorage if user is logged in
      const currentUserJson = localStorage.getItem("currentUser");
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        currentUser.balance = newBalance;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
      return newBalance;
    });
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
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
          {/* Left sidebar - Fixed 25% width */}
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
            <TicketForm onResults={handleResults} resetKey={resetKey} onReset={() => { setTrips([]); setSearched(false); }} />
            <div style={{ marginTop: "3rem" }}>
              <TicketsResults trips={trips} onShowOnMap={handleShowOnMap} balance={balance} setBalance={setBalance} onBook={handleBook} />
            </div>
          </Box>

          {/* Right content area - Fixed 75% width */}
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
              <BusMap ref={mapRef} trips={trips} />
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

        {/* Results Section - Below the split screen */}
      </Box>

      <Footer />
    </Box>
  );
}