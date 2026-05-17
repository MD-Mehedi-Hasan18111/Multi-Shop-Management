"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";

const roles = ["customer", "shopkeeper", "admin"];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      setUsers(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }, [role, search]);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  async function updateRole(user: any, nextRole: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, role: nextRole }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } else {
      alert((await res.json()).error || "Failed to update user");
    }
  }

  async function toggleUser(user: any) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, isActive: user.isActive === false }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } else {
      alert((await res.json()).error || "Failed to update user");
    }
  }

  async function deleteUser(user: any) {
    if (!confirm(`Are you sure you want to permanently delete the user account for "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    const res = await fetch(`/api/admin/users?userId=${user._id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setUsers((current) => current.filter((item) => item._id !== user._id));
    } else {
      alert((await res.json()).error || "Failed to delete user");
    }
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage customers, shopkeepers, and administrators.</p>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>All Users</CardTitle>
          <div className="grid gap-2 md:grid-cols-[minmax(240px,1fr)_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by email or name..."
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {role || "All roles"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRole("")}>All roles</DropdownMenuItem>
                {roles.map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setRole(item)}>
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive === false ? "destructive" : "secondary"}>
                      {user.isActive === false ? "Inactive" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleUser(user)}>
                        {user.isActive === false ? "Activate" : "Deactivate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => deleteUser(user)}
                      >
                        Delete
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Set role <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {roles.map((item) => (
                            <DropdownMenuItem key={item} onClick={() => updateRole(user, item)}>
                              {item}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
