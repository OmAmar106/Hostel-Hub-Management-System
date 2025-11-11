import React from "react";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Hostel Hub
            </Link>
            {/* optionally add nav links */}
          </div>

          <div className="flex items-center gap-4">
            <ProfileAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}
