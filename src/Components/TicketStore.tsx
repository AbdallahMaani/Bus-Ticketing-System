"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface TicketRecord {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  price: number;
  quantity: number;
  total: number;
  status: "Confirmed" | "Cancelled";
}

interface TicketContextType {
  tickets: TicketRecord[];
  addTicket: (ticket: TicketRecord) => void;
  clearTickets: () => void;
}

const TicketContext = createContext<TicketContextType | null>(null);  

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("ticketHistory");
    if (stored) {
      setTickets(JSON.parse(stored));
    }
  }, []); // getting tickets from local storage on initial load

  useEffect(() => {
    localStorage.setItem("ticketHistory", JSON.stringify(tickets));
  }, [tickets]); // saving new tickets to local storage whenever tickets change

  const addTicket = (ticket: TicketRecord) => {
    setTickets((prev) => [ticket, ...prev]);
  }; // adding a new ticket to the beginning of the tickets array

  const clearTickets = () => {
    setTickets([]);
  };

  return (
    <TicketContext.Provider value={{ tickets, addTicket, clearTickets }}>
      {children}
    </TicketContext.Provider>
  ); // this is a wrapper component that provides the ticket context to its children
}

// Custom hook
export function useTickets() {
  const context = useContext(TicketContext); 
  if (!context) {
    throw new Error("useTickets must be used inside TicketProvider");
  } // this hook allows components to easily access the store
  return context;
}
