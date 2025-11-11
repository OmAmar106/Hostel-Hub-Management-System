import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function ProfileAvatar() {
  const { user, logout, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const handleSave = async () => {
    if (!name || !email) {
      toast({
        title: "Missing information",
        description: "Name and email cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:5000/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.msg || "Failed to update profile");
      }

      await refreshProfile();

      toast({
        title: "Profile updated",
        description: "Your details have been successfully updated.",
      });
      setEditOpen(false);
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Could not update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        title={user?.name ?? "User"}
      >
        <span className="text-sm font-medium text-gray-700">{initials}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 shadow-lg rounded py-2 z-50">
          <div className="px-3 py-2 border-b dark:border-slate-700">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-300 truncate">{user?.email}</div>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              setEditOpen(true);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Edit profile
          </button>

          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Log out
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-medium mb-4 text-slate-900 dark:text-slate-100">
              Edit Profile
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditOpen(false)}
                className="px-3 py-1 rounded border"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
