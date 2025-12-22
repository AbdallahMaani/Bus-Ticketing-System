"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, ActionIcon } from "@mantine/core";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import TicketForm, { Trip } from "../Components/TicketForm";
import TicketsResults from "@/Components/TicketsResults";
import BusMap, { BusMapRef } from "@/Components/BusMap";
import AdvancedFilters from "@/Components/AdvancedFilters"; // Keep AdvancedFilters import
import { Areas } from "@/Components/TicketForm"; // Import Areas type

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [unfilteredTrips, setUnfilteredTrips] = useState<Trip[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [fromCity, setFromCity] = useState<string | null>(null); // Lifted state for 'From' city
  const [toCity, setToCity] = useState<string | null>(null);     // Lifted state for 'To' city
  const [balance, setBalance] = useState(0);
  const [allAreas, setAllAreas] = useState<Areas[]>([]); // New state for all areas
  const mapRef = useRef<BusMapRef>(null); // Ref for BusMap component mapRef is created using useRef hook with type BusMapRef
  
  /* How useRef all connects and why it's used:
      In page.tsx, mapRef is created.
      mapRef is passed to the BusMap component: <BusMap ref={mapRef} trips={trips} />.
      Because BusMap is wrapped in forwardRef, it receives mapRef as its ref prop.
      Inside BusMap, useImperativeHandle takes this ref and attaches an object containing zoomTo and clearRoutes methods to its .current property.
      Now, back in page.tsx, the Home component can call these methods directly:
      mapRef.current?.zoomTo(lat, lng); (e.g., when a user clicks "Show on map" for a trip).
      mapRef.current?.clearRoutes(); (e.g., when the search results are reset).
 */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/jordan_bus_data.json");
        const data = await res.json();
        setAllAreas(data.areas || []); // Store all areas
        
        // Get balance from logged-in user or default
        const currentUserJson = localStorage.getItem("currentUser");
        if (currentUserJson) {
          const currentUser = JSON.parse(currentUserJson);
          setBalance(currentUser.balance || 0);
        } else {
          // Default to U1001 if no user logged in
          const user = data.users.find((u: { user_id: string; balance: number }) => u.user_id === 'U1001'); //replace any with specific type
          // const user = data.users.find((u: any) => u.user_id === 'U1001'); 

          setBalance(user ? user.balance : 1000);
        }
      } catch (err) {
        console.error("Error loading bus data:", err);
        setBalance(1000);
      }
    };
    fetchData();
  }, []);

  const handleResults = (foundTrips: Trip[]) => {
    setTrips(foundTrips);
    setUnfilteredTrips(foundTrips);
  };

  const handleReset = () => {
    setResetKey((k) => k + 1); // k is an anonymous variable representing the previous key value
    // we increment it to let useEffect in TicketForm detect the change and reset its internal state like a counter
    setTrips([]);
    setUnfilteredTrips([]);
    // Clear map routes and markers
    mapRef.current?.clearRoutes(); // clearRoutes is defined in BusMap component
  };

  const handleShowOnMap = (trip: Trip) => { // Now receives the full trip object
    if (mapRef.current) {
      mapRef.current.showTripRoute(trip); // Call the new method in BusMap
    } else {
      console.warn("Map reference not available to show trip route.");
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
    // MantineProvider and ColorSchemeScript are removed as dark mode is removed
    // If you need MantineProvider for other reasons (e.g., custom theme, notifications),
    // you can re-add it without colorScheme props.
    // For now, assuming it's only for color scheme.
    <>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100%",
          backgroundColor: '#f8f9fa', // Hardcoded light background
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
          h={{ base: "auto", lg: "calc(100vh - 120px)" }} // Assuming header/footer take 120px
          mih={{ base: "auto", lg: 600 }}
          w="100%"
        >
          {/* Left sidebar - Fixed 25% width */}
          <Box
            w={{ base: "100%", lg: "23%" }}
            bg="#f8f9fa" // Hardcoded light background
            p={{ base: "1rem", lg: "1.5rem" }}
            style={{
              borderRight: "1px solid #e9ecef", // Hardcoded border
              borderBottom: "1px solid #e9ecef", // Hardcoded border
              overflowY: "auto",
              boxShadow: "2px 0 5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <TicketForm onResults={handleResults} resetKey={resetKey} onReset={() => { setTrips([]); setFromCity(null); setToCity(null); }} from={fromCity} setFrom={setFromCity} to={toCity} setTo={setToCity} />
            <div style={{ marginTop: "3rem" }}>
              <TicketsResults trips={trips} onShowOnMap={handleShowOnMap} balance={balance} onBook={handleBook} />
            </div>
          </Box>
          {/* Right content area - Fixed 75% width */}
          <Box
            w={{ base: "100%", lg: "77%" }}
            bg="white" // Hardcoded light background
            p={{ base: "1rem", lg: "1rem" }}
            mih={{ base: 400, lg: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid #e9ecef", // Hardcoded border
            }}
          >
            <Box
              w="100%"
              h="100%"
              bg="#f8f9fa" // Hardcoded light background
              p=".1rem"
              style={{
                border: "2px dashed #dee2e6",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#666", // Hardcoded color
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