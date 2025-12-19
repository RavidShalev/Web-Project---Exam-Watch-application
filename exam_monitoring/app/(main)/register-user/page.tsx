"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterUserPage() {
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("currentUser");
    if (!raw) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(raw);
    if (user.role !== "admin") {
      router.push("/home");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[84vh] bg-[#1b2430]">
      <div className="bg-[#232d3b] p-8 rounded-xl shadow w-full max-w-sm text-white">
        <h2 className="text-2xl font-bold text-[#17cf97] mb-6 text-center">
          Register New User
        </h2>

        <p className="text-center text-gray-300">
          Only admin can be here 
        </p>
      </div>
    </div>
  );
}
