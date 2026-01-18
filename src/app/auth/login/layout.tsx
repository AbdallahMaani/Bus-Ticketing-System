"use client";

import React from "react";
import { AppShell } from "@mantine/core";
// import Header from "@/components/Header";
import Footer from "@/Components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell >
      <AppShell.Main>{children}</AppShell.Main>

       <Footer /> 
    </AppShell>
  );
}
