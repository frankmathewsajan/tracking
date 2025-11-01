"use client";

import React from "react";
import { useAuth } from "../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";

const MemberDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <DashboardNavbar user={user} />
      <main className="pt-20 p-8">
        <div>
          Member dashboard
        </div>
      </main>
    </div>
  );
};

export default MemberDashboardPage;