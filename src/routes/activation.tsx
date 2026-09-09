import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Activation() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if(!file) return toast({title: "Error", description: "Upload proof first"});
    setLoading(true);
    const { data: { user } = await supabase.auth.getUser();
    const filePath = `${user.id}/${Date.now()}.png`;
    const { data: upload } = await supabase.storage.from('activation_proofs').upload(filePath, file);
    if(upload) {
      await supabase.from('activations').insert({ user_id: user.id, proof_url: upload.path });
      toast({ title: "Submitted", description: "Waiting for admin approval" });
    }
    setLoading(false);
  }

  return (
    <div className="p-4 max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-2">Activate Your Account with 1,000 NARIA</h1>
      <div className="bg-yellow-100 p-4 rounded mb-4">
        <p><b>Bank:</b> Moniepoint</p>
        <p><b>Account Number:</b> 9135054964</p>
        <p><b>Account Name:</b> Seriki Tumnishe Mubarak</p>
      </div>
      <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4">Submit Activation</Button>
    </div>
  )
}
