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
      <Paper withBorder p="md">
        <Center><Loader /></Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Text fw={700}>Users ({users.length})</Text>
        <Group>
          <Button size="xs" variant="outline" onClick={fetchUsers} leftSection={<IconRefresh size={16} />}>Refresh</Button>
        </Group>
      </Group>

      <Table verticalSpacing="sm" striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Username</Table.Th>
            <Table.Th>Full name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Balance</Table.Th>
            <Table.Th style={{ width: 180 }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u, idx) => (
            <Table.Tr key={u.userId || idx}>
              <Table.Td>{u.username}</Table.Td>
              <Table.Td>
                {editingId === u.userId ? (
                  <TextInput
                    value={String(editValues.fullName ?? "")}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues((s) => ({ ...s, fullName: value }));
                    }}
                    size="xs"
                  />
                ) : (
                  u.fullName
                )}
              </Table.Td>
              <Table.Td>
                {editingId === u.userId ? (
                  <TextInput
                    value={String(editValues.email ?? "")}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues((s) => ({ ...s, email: value }));
                    }}
                    size="xs"
                  />
                ) : (
                  u.email
                )}
              </Table.Td>
              <Table.Td>
                {editingId === u.userId ? (
                  <TextInput
                    value={String(editValues.phone ?? "")}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setEditValues((s) => ({ ...s, phone: value }));
                    }}
                    size="xs"
                  />
                ) : (
                  u.phone
                )}
              </Table.Td>
              <Table.Td>
                {editingId === u.userId ? (
                  <Select
                    value={editValues.role || u.role}
                    onChange={(val) => setEditValues((s) => ({ ...s, role: val || u.role }))}
                    data={[
                      { label: "Customer", value: "customer" },
                      { label: "Admin", value: "Admin" },
                    ]}
                    size="xs"
                    searchable
                  />
                ) : (
                  u.role
                )}
              </Table.Td>
              <Table.Td>{u.balance.toFixed(2)} JOD</Table.Td>
              <Table.Td>
                {editingId === u.userId ? (
                  <Group gap="xs">
                    <Button size="xs" onClick={() => saveEdit(u.userId)}>Save</Button>
                    <Button size="xs" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </Group>
                ) : (
                  <Group gap="xs">
                    <ActionIcon color="blue" onClick={() => startEdit(u)} title="Edit"><IconPencil size={16} /></ActionIcon>
                    <ActionIcon color="orange" onClick={() => setResetModal({ open: true, id: u.userId })} title="Reset Password"><IconRefresh size={16} /></ActionIcon>
                    <ActionIcon color="red" onClick={() => setConfirmDelete({ open: true, id: u.userId })} title="Delete"><IconTrash size={16} /></ActionIcon>
                  </Group>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })} title="Confirm delete">
        <Stack gap="sm">
          <Text>Are you sure you want to delete this user? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
            <Button color="red" onClick={() => confirmDeleteUser(confirmDelete.id)}>Delete</Button>
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

      <Modal opened={roleChangeConfirm.open} onClose={() => setRoleChangeConfirm({ open: false })} title="Confirm role change">
        <Stack gap="sm">
          <Text>Are you sure you want to change this user's role to <strong>{roleChangeConfirm.newRole}</strong>?</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setRoleChangeConfirm({ open: false })}>Cancel</Button>
            <Button color="green" onClick={() => {
              saveEdit(roleChangeConfirm.id || "");
              setRoleChangeConfirm({ open: false });
            }}>Confirm</Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}