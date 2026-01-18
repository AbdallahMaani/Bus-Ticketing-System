"use client";

import React, { useEffect, useState } from "react";
import { apiClientFetch } from "@/lib/apiClient";
import {
  Table,
  Paper,
  Text,
  Loader,
  Center,
  Group,
  ActionIcon,
  Modal,
  Button,
  TextInput,
  Stack,
} from "@mantine/core";
import { IconTrash, IconPencil, IconRefresh, IconCheck, IconX } from "@tabler/icons-react";
import { Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import ResetPasswordModal from "../ResetPasswordModal";

type UserDto = {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  balance: number;
};

export default function UserList() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<UserDto>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
  const [resetModal, setResetModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<{ open: boolean; id?: string; newRole?: string }>({ open: false });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClientFetch("/api/User");
      if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      notifications.show({ title: "Users", message: err.message || "Failed to load users", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (u: UserDto) => {
    setEditingId(u.userId);
    setEditValues({ fullName: u.fullName, email: u.email, phone: u.phone });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await apiClientFetch(`/api/User/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          userId: id,
          fullName: editValues.fullName,
          email: editValues.email,
          phone: editValues.phone,
          role: editValues.role,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Update failed");
      }
      notifications.show({ title: "User", message: "Updated successfully", color: "green" });
      setEditingId(null);
      await fetchUsers();
    } catch (err: any) {
      notifications.show({ title: "User", message: err.message || "Update failed", color: "red" });
    }
  };

  const confirmDeleteUser = async (id?: string) => {
    if (!id) return;
    try {
      const res = await apiClientFetch(`/api/User/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Delete failed");
      }
      notifications.show({ title: "User", message: "Deleted", color: "green" });
      setConfirmDelete({ open: false });
      await fetchUsers();
    } catch (err: any) {
      notifications.show({ title: "User", message: err.message || "Delete failed", color: "red" });
    }
  };

  if (loading) {
    return (
      <Paper withBorder p="lg" radius="lg">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="lg">
      <Group justify="space-between" mb="lg">
        <Text fw={800} size="lg">Users ({users.length})</Text>
        <Group>
          <Button size="md" variant="gradient" gradient={{ from: "#0685d9ff", to: "#0b8cf5ff", deg: 90 }} onClick={fetchUsers} leftSection={<IconRefresh size={18} />} fw={600}>Refresh</Button>
        </Group>
      </Group>

      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(6, 150, 217, 0.1)" }}>
        <Table verticalSpacing="lg" striped highlightOnHover fontSize="md">
          <Table.Thead style={{ background: "rgba(0, 113, 219, 0.12)" }}>
            <Table.Tr>
              <Table.Th ta="center" fw={700}>Username</Table.Th>
              <Table.Th ta="center" fw={700}>Full name</Table.Th>
              <Table.Th ta="center" fw={700}>Email</Table.Th>
              <Table.Th ta="center" fw={700}>Phone</Table.Th>
              <Table.Th ta="center" fw={700}>Role</Table.Th>
              <Table.Th ta="center" fw={700}>Balance</Table.Th>
              <Table.Th ta="center" fw={700} style={{ width: 180 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((u, idx) => (
              <Table.Tr key={u.userId || idx}>
                <Table.Td ta="center" fw={500}>{u.username}</Table.Td>
                <Table.Td ta="center" fw={500}>
                  {editingId === u.userId ? (
                    <TextInput
                      value={String(editValues.fullName ?? "")}
                      onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues((s) => ({ ...s, fullName: value }));
                    }}
                    size="sm"
                    fw={600}
                  />
                ) : (
                  u.fullName
                )}
              </Table.Td>
              <Table.Td ta="center" fw={500}>
                {editingId === u.userId ? (
                  <TextInput
                    value={String(editValues.email ?? "")}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues((s) => ({ ...s, email: value }));
                    }}
                    size="sm"
                    fw={600}
                  />
                ) : (
                  u.email
                )}
              </Table.Td>
              <Table.Td ta="center" fw={500}>
                {editingId === u.userId ? (
                  <TextInput
                    value={String(editValues.phone ?? "")}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues((s) => ({ ...s, phone: value }));
                    }}
                    size="sm"
                    fw={600}
                  />
                ) : (
                  u.phone
                )}
              </Table.Td>
              <Table.Td ta="center" fw={600}>
                {editingId === u.userId ? (
                  <Select
                    value={editValues.role || u.role}
                    onChange={(val) => setEditValues((s) => ({ ...s, role: val || u.role }))}
                    data={[
                      { label: "Customer", value: "customer" },
                      { label: "Admin", value: "Admin" },
                    ]}
                    size="sm"
                    searchable
                  />
                ) : (
                  u.role
                )}
              </Table.Td>
              <Table.Td ta="center" fw={700} c="#0685d9ff">{u.balance.toFixed(2)} JOD</Table.Td>
              <Table.Td ta="center">
                {editingId === u.userId ? (
                  <Group gap="xs" justify="center">
                    <Button size="sm" fw={600} onClick={() => saveEdit(u.userId)}>Save</Button>
                    <Button size="sm" fw={600} variant="light" onClick={cancelEdit}>Cancel</Button>
                  </Group>
                ) : (
                  <Group gap="xs" justify="center">
                    <ActionIcon color="orange" variant="light" size="lg" onClick={() => startEdit(u)} title="Edit"><IconPencil size={18} /></ActionIcon>
                    <ActionIcon color="blue" variant="light" size="lg" onClick={() => setResetModal({ open: true, id: u.userId })} title="Reset Password"><IconRefresh size={18} /></ActionIcon>
                    <ActionIcon color="red" variant="light" size="lg" onClick={() => setConfirmDelete({ open: true, id: u.userId })} title="Delete"><IconTrash size={18} /></ActionIcon>
                  </Group>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      </div>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm delete" radius="lg" centered>
        <Stack gap="md">
          <Text size="lg" fw={600}>Are you sure you want to delete this user? This action cannot be undone.</Text>
          <Group justify="flex-end" gap="md">
            <Button variant="light" fw={600} size="md" onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
            <Button variant="gradient" gradient={{ from: "#dc2626", to: "#ef4444", deg: 90 }} fw={700} size="md" onClick={() => confirmDeleteUser(confirmDelete.id)}>Delete</Button>
          </Group>
        </Stack>
      </Modal>

      <ResetPasswordModal
        opened={resetModal.open}
        onClose={() => setResetModal({ open: false })}
        userId={resetModal.id}
        onDone={async () => {
          setResetModal({ open: false });
          notifications.show({ title: "Password", message: "Password reset", color: "green" });
        }}
      />

      <Modal opened={roleChangeConfirm.open} onClose={() => setRoleChangeConfirm({ open: false })} title="Confirm role change" radius="lg" centered>
        <Stack gap="md">
          <Text size="lg" fw={600}>Are you sure you want to change this user&apos;s role to <Text span fw={700} c="#0685d9ff">{roleChangeConfirm.newRole}</Text>?</Text>
          <Group justify="flex-end" gap="md">
            <Button variant="light" fw={600} size="md" onClick={() => setRoleChangeConfirm({ open: false })}>Cancel</Button>
            <Button variant="gradient" gradient={{ from: "#22c55e", to: "#16a34a", deg: 90 }} fw={700} size="md" onClick={() => {
              saveEdit(roleChangeConfirm.id || "");
              setRoleChangeConfirm({ open: false });
            }}>Confirm</Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}