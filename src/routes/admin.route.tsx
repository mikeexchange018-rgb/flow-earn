import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { 
        window.location.href = "/login"; 
        return; 
      }
      setEmail(user.email || "");
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("email", user.email).single();
      if (profile?.is_admin === true) { 
        setIsAdmin(true); 
      } else { 
        alert("You are not an admin"); 
        setTimeout(() => window.location.href = "/profile", 1500) 
      }
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) return <div className="p-6 text-center">Checking admin access...</div>;
  if (!isAdmin) return <div className="p-6 text-center">Access denied. You are not admin.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Console</h1>
      <p>Signed in as: {email}</p>
      <p className="mt-4">✅ Admin panel is working!</p>
      <p className="text-sm text-gray-500 mt-2">We will add Users, Tasks, etc here next</p>
    </div>
  );
}
