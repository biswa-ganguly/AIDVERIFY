// src/components/SyncUser.jsx
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export default function SyncUser() {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/clerk/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.publicMetadata?.role,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ User synced:", data);
        })
        .catch((err) => {
          console.error("❌ Sync error:", err);
        });
    }
  }, [isLoaded, user]);

  return null;
}
