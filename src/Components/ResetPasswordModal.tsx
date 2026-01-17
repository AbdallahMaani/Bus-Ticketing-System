"use client";

import React, { useState } from "react";
import { Modal, PasswordInput, Button, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { apiClientFetch } from "@/lib/apiClient";

export default function ResetPasswordModal({ opened, onClose, userId, onDone }: { opened: boolean; onClose: () => void; userId?: string; onDone?: () => void; }) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!userId) return;
    if (!newPassword) {
      notifications.show({ title: "Reset", message: "Provide a new password", color: "yellow" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiClientFetch(`/api/User/${userId}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Reset failed");
      }
      notifications.show({ title: "Reset", message: "Password reset successfully", color: "green" });
      onDone?.();
      onClose();
    } catch (err: any) {
      notifications.show({ title: "Reset", message: err.message || "Reset failed", color: "red" });
    } finally {
      setLoading(false);
      setNewPassword("");
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Admin password reset" centered>
      <Stack>
        <PasswordInput label="New password" value={newPassword} onChange={(e) => setNewPassword(e.currentTarget.value)} />
        <Group position="right">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleReset} loading={loading}>Reset</Button>
        </Group>
      </Stack>
    </Modal>
  );
}