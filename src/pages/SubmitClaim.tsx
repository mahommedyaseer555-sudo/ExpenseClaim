import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OCRUpload } from "@/components/OCRUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const claimSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  expense_date: z.string().min(1, "Date is required"),
});

const SubmitClaim = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    purpose: "",
    expense_date: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to submit claims");
        navigate("/auth");
      } else {
        setUser(user);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleOCRData = (data: { amount?: string; date?: string; text: string }) => {
    if (data.amount) {
      setFormData(prev => ({ ...prev, amount: data.amount || "" }));
    }
    if (data.date) {
      // Try to parse the date
      try {
        const parsedDate = new Date(data.date);
        if (!isNaN(parsedDate.getTime())) {
          setFormData(prev => ({
            ...prev,
            expense_date: parsedDate.toISOString().split('T')[0]
          }));
        }
      } catch (e) {
        console.error("Date parsing error:", e);
      }
    }
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const validated = claimSchema.parse(formData);

      let receiptUrl = null;
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile);
        if (!receiptUrl) {
          throw new Error("Failed to upload receipt");
        }
      }

      const { error } = await supabase
        .from('expense_claims')
        .insert([{
          user_id: user.id,
          amount: parseFloat(validated.amount),
          category: validated.category as any,
          purpose: validated.purpose,
          expense_date: validated.expense_date,
          receipt_url: receiptUrl,
          status: 'pending' as any,
        }]);

      if (error) throw error;

      toast.success("Claim submitted successfully!");
      navigate("/claim-status");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to submit claim");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Submit Expense Claim</h1>
          <p className="text-muted-foreground mb-8">
            Upload your receipt and let our OCR technology automatically extract the details
          </p>

          <div className="space-y-6">
            <OCRUpload onDataExtracted={handleOCRData} onFileSelect={setReceiptFile} />

            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
                <CardDescription>
                  Fill in or verify the extracted information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Expense Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="meals">Meals</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Describe the purpose of this expense..."
                      rows={4}
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Claim"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitClaim;
