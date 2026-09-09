import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const ActivationBanner = () => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if(user) {
        const { data } = await supabase.from('profiles').select('is_active').eq('id', user.id).single();
        setIsActive(data?.is_active || false);
      }
    }
    getProfile();
  }, []);

  if(isActive) return null;

  return (
    <div className="bg-yellow-500 text-black p-3 flex justify-between items-center sticky top-0 z-50">
      <p>⚠️ Your account is not activated. Pay 1,000 NARIA to activate and start earning.</p>
      <Link to="/activation"><Button size="sm" variant="destructive">Activate Now</Button></Link>
    </div>
  )
}
