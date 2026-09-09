import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router"; // Changed to Tanstack
import { useToast } from "@/hooks/use-toast";

const Activation = () => {
  const [activationCode, setActivationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // FIXED: Added the missing }
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({ title: "Error", description: "You must be logged in" });
      setLoading(false);
      return;
    }

    // Check if code is valid
    const { data: codeData, error: codeError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', activationCode)
      .eq('is_used', false)
      .single();

    if (codeError || !codeData) {
      toast({ title: "Error", description: "Invalid activation code" });
      setLoading(false);
      return;
    }

    // Activate user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', user.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message });
      setLoading(false);
      return;
    }

    // Mark code as used
    await supabase
      .from('activation_codes')
      .update({ is_used: true, used_by: user.id })
      .eq('id', codeData.id);

    toast({ title: "Success", description: "Account activated! Welcome to Flow Earn." });
    navigate({ to: '/dashboard' });
    setLoading(false);
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Activate Account</h1>
      <p className="text-sm text-gray-600 mb-4">Enter your activation code to start earning</p>
      <form onSubmit={handleActivate} className="space-y-4">
        <Input 
          placeholder="Enter activation code" 
          value={activationCode} 
          onChange={e => setActivationCode(e.target.value)} 
          required 
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Activating..." : "Activate"}
        </Button>
      </form>
    </div>
  )
}import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/activation')({
  component: Activation,
})
