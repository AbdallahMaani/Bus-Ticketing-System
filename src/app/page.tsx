"use client";

import React, { useState, useRef } from "react";
import { Box, Flex, ActionIcon } from "@mantine/core";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import TicketForm, { Trip } from "../Components/TicketForm";
import TicketsResults from "@/Components/TicketsResults";
import BusMap from "@/Components/BusMap";
import AdvancedFilters from "@/Components/AdvancedFilters";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null); //the useRef hook will be used to reference the TicketResults component by scrolling to it when new results are available
  const formRef = useRef<HTMLDivElement | null>(null);
  const handleResults = (foundTrips: Trip[]) => {
    setTrips(foundTrips);
    setSearched(true);
    if (foundTrips.length > 0) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleReset = () => {
    setResetKey((k) => k + 1);
    setTrips([]);
    setSearched(false);
    // scroll back to form
    formRef.current?.scrollIntoView({ behavior: "smooth" });
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
            w={{ base: "100%", lg: "22%" }}
            bg="#f8f9fa"
            p={{ base: "1rem", lg: "1.5rem" }}
            style={{
              borderRight: "1px solid #e9ecef",
              borderBottom: "1px solid #e9ecef",
              overflowY: "auto",
              boxShadow: "2px 0 5px rgba(0, 0, 0, 0.05)",
            }}
          >
            <TicketForm onResults={handleResults} />
            <div ref={resultsRef} style={{ marginTop: "3rem" }}>
              <TicketsResults trips={trips} />
            </div>
          </Box>

          {/* Right content area - Fixed 75% width */}
          <Box
            w={{ base: "100%", lg: "80%" }}
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
              <BusMap />
              {!showAdvancedFilters && (
                <ActionIcon
                  variant="filled"
                  color="blue"
                  size="lg"
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
                    onResults={handleResults}
                    onClose={() => setShowAdvancedFilters(false)}
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