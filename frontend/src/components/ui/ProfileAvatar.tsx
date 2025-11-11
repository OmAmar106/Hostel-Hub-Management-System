import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileAvatar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        title={user?.name ?? "User"}
      >
        {/* if you later provide avatarUrl in user, replace user.avatarUrl below */}
        {user?.["avatarUrl"] ? (
          // @ts-ignore maybe avatarUrl not typed yet
          <img src={(user as any).avatarUrl} alt={user?.name ?? "avatar"} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <span className="text-sm font-medium text-gray-700">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 shadow-lg rounded py-2 z-50">
          <div className="px-3 py-2 border-b dark:border-slate-700">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-300 truncate">{user?.email}</div>
          </div>

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
    </div>
  );
}
