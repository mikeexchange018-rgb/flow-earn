import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router"; // FIXED HERE
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newRefCode = generateReferralCode();

    let referrer_id = null;
    if(referralCode) {
      const { data: refUser } = await supabase.from('profiles').select('id').eq('referral_code', referralCode).single();
      if(refUser) referrer_id = refUser.id;
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { username } }
    });

    if(error) { 
      toast({ title: "Error", description: error.message }); 
      setLoading(false); 
      return; 
    }

    if(data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, 
        username, 
        referral_code: newRefCode, 
        referrer_id,
        is_active: false, 
        balance_naria: 0
      });
      toast({ title: "Success", description: "Account created. Please activate to start earning." });
      navigate({ to: '/activation' }); // Tanstack uses object
    }
    setLoading(false);
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input placeholder="Enter referral code if you have one" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
        <div className="relative">
          <Input placeholder="Password" type={showPassword? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
            {showPassword? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading? "Creating..." : "Sign Up"}
        </Button>
      </form>
    </div>
  )
}
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: Register,
})
