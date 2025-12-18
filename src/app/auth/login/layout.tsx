"use client";

import React from "react";
import { AppShell } from "@mantine/core";
// import Header from "@/components/Header";
//import Footer from "../../components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        {/* <Header /> */}
        <div style={{ padding: 15 }}></div>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>

      {/* <Footer /> */}
    </AppShell>
  );
}
