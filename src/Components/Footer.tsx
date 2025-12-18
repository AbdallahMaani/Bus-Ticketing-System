"use client";

import { Text, Group, Anchor, Container, Box } from "@mantine/core";

export default function Footer() {
  return (
    <Box
      component="footer"
      py="md"
      bg="white"
      style={{ borderTop: "1px solid #e9ecef" }}
    >
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} Jordan Bus System. All rights reserved.
          </Text>

          <Group gap="lg">
            <Anchor href="/history" c="dimmed" size="sm" underline="hover">
              Contact
            </Anchor>
            <Anchor href="/history" c="dimmed" size="sm" underline="hover">
              Privacy Policy
            </Anchor>
            <Anchor href="/history" c="dimmed" size="sm" underline="hover">
              Terms
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
