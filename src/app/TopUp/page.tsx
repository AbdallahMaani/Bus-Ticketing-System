"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Title,
  Text,
  NumberInput,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  ThemeIcon,
  Grid,
  Badge,
  Card,
  Divider,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconWallet, IconCreditCard, IconAlertCircle, IconCheck, IconArrowUp } from "@tabler/icons-react";
import Header from "@/Components/Header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

// Quick amount options
const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

export default function TopUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [topupAmount, setTopupAmount] = useState<number | string>("");
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      try {
        if (!token) {
          router.push("/auth/login");
          return;
        }
        const res = await fetch(`${API_BASE}/api/user/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          localStorage.clear();
          router.push("/auth/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setBalance(data.balance);
      } catch (err) {
        console.error(err);
        notifications.show({ 
          title: "Error", 
          message: "Unable to load balance", 
          color: "red",
          icon: <IconAlertCircle size={18} />
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [token, router]);

  const handleQuickAmount = (amount: number) => {
    setTopupAmount(amount);
    setSelectedQuick(amount);
  };

  const handleTopUp = async () => {
    const amount = typeof topupAmount === 'string' ? parseFloat(topupAmount) : topupAmount;
    
    if (!amount || amount <= 0) {
      notifications.show({ 
        title: "Invalid Amount", 
        message: "Please enter a positive amount", 
        color: "yellow",
        icon: <IconAlertCircle size={18} />
      });
      return;
    }

    if (amount > 1000) {
      notifications.show({ 
        title: "Amount Too Large", 
        message: "Maximum top-up amount is 1000 JOD", 
        color: "yellow",
        icon: <IconAlertCircle size={18} />
      });
      return;
    }

    setTopupLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(amount),
      });

      if (res.status === 401) {
        localStorage.clear();
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Top up failed");
      }

      notifications.show({ 
        title: "Success!", 
        message: `${amount} JOD added to your balance`, 
        color: "green",
        icon: <IconCheck size={18} />
      });
      
      // Refresh balance
      const refreshed = await fetch(`${API_BASE}/api/user/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (refreshed.ok) {
        const data = await refreshed.json();
        setBalance(data.balance);
        setTopupAmount("");
        setSelectedQuick(null);
        
        // Update local storage cache if it exists
        const cached = localStorage.getItem("currentUser");
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.balance = data.balance;
          localStorage.setItem("currentUser", JSON.stringify(parsed));
        }
      }
    } catch (err: any) {
      notifications.show({ 
        title: "Error", 
        message: err.message || "Top up failed", 
        color: "red",
        icon: <IconAlertCircle size={18} />
      });
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Center style={{ minHeight: "60vh" }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading your balance...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  const newBalance = typeof topupAmount === 'number' && topupAmount > 0 
    ? balance + topupAmount 
    : balance;

  return (
    <>
      <Header />
      
    <Container size="md" py={50}>
      <Stack gap="xl">
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <ThemeIcon size={70} radius="xl" color="orange" variant="light" mb="md" mx="auto">
            <IconWallet size={40} />
          </ThemeIcon>
          <Title order={1} mb="xs">Top Up Your Balance</Title>
          <Text c="dimmed" size="lg">
            Add funds to your wallet and book your next trip
          </Text>
        </div>

        <Grid gutter="lg">
          {/* Current Balance Card */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                    Current Balance
                  </Text>
                  <Badge color="blue" variant="light">Active</Badge>
                </Group>
                <Text size="2.5rem" fw={700} c="blue">
                  {balance.toFixed(2)}
                  <Text component="span" size="xl" c="dimmed" ml="xs">JOD</Text>
                </Text>
                <Text size="xs" c="dimmed">
                  Available for booking bus tickets
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          {/* New Balance Preview */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%" bg="orange.0">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                    New Balance
                  </Text>
                  <Badge color="orange" variant="light">After Top-Up</Badge>
                </Group>
                <Text size="2.5rem" fw={700} c="orange">
                  {newBalance.toFixed(2)}
                  <Text component="span" size="xl" c="dimmed" ml="xs">JOD</Text>
                </Text>
                {topupAmount && typeof topupAmount === 'number' && topupAmount > 0 && (
                  <Group gap="xs">
                    <IconArrowUp size={16} color="green" />
                    <Text size="sm" c="green" fw={500}>
                      +{topupAmount.toFixed(2)} JOD
                    </Text>
                  </Group>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Top-Up Form */}
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <div>
              <Text size="lg" fw={600} mb="xs">
                Select Amount
              </Text>
              <Text size="sm" c="dimmed">
                Choose a quick amount or enter a custom value
              </Text>
            </div>

            {/* Quick Amount Buttons */}
            <SimpleGrid cols={{ base: 3, xs: 5 }} spacing="sm">
              {QUICK_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedQuick === amount ? "filled" : "light"}
                  color="orange"
                  size="lg"
                  onClick={() => handleQuickAmount(amount)}
                  styles={{
                    root: {
                      height: '70px',
                    },
                  }}
                >
                  <Stack gap={2} align="center">
                    <Text size="xl" fw={700}>{amount}</Text>
                    <Text size="xs">JOD</Text>
                  </Stack>
                </Button>
              ))}
            </SimpleGrid>

            <Divider label="OR" labelPosition="center" />

            {/* Custom Amount Input */}
            <NumberInput
              label="Custom Amount"
              placeholder="Enter amount"
              value={topupAmount}
              onChange={(val) => {
                setTopupAmount(val);
                setSelectedQuick(null);
              }}
              min={0}
              max={1000}
              precision={2}
              hideControls
              leftSection={<Text size="sm" fw={500}>JOD</Text>}
              size="lg"
              styles={{
                input: {
                  fontSize: '1.25rem',
                  fontWeight: 600,
                },
              }}
            />

            <Alert icon={<IconCreditCard size={18} />} color="blue" variant="light">
              <Text size="sm">
                <strong>Secure Payment:</strong> All transactions are encrypted and secure. 
                Minimum: 1 JOD • Maximum: 1000 JOD
              </Text>
            </Alert>

            {/* Action Buttons */}
            <Group grow>
              <Button 
                size="lg" 
                color="orange"
                onClick={handleTopUp} 
                loading={topupLoading}
                disabled={!topupAmount || topupAmount <= 0}
                leftSection={<IconWallet size={20} />}
              >
                Add {topupAmount && typeof topupAmount === 'number' && topupAmount > 0 
                  ? `${topupAmount.toFixed(2)} JOD` 
                  : 'Funds'}
              </Button>
              <Button 
                size="lg" 
                variant="light" 
                color="gray"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Info Section */}
        <Paper p="md" radius="md" withBorder bg="gray.0">
          <Stack gap="xs">
            <Text size="sm" fw={600}>💡 Quick Tips</Text>
            <Text size="xs" c="dimmed">
              • Top-up amounts are instantly added to your balance
            </Text>
            <Text size="xs" c="dimmed">
              • Use your balance to book bus tickets across Jordan
            </Text>
            <Text size="xs" c="dimmed">
              • Your balance never expires and can be used anytime
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
    </>
  );
}