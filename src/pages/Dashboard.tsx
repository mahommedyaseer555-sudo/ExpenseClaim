import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isManager = roles?.some(r => r.role === 'manager' || r.role === 'admin');
      if (!isManager) {
        toast.error("Access denied. Manager role required.");
        navigate("/");
        return;
      }

      fetchClaims();
    };

    checkAccess();
  }, [navigate]);

  const fetchClaims = async () => {
    const { data } = await supabase
      .from('expense_claims')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (data) {
      setClaims(data);
      setStats({
        pending: data.filter(c => c.status === 'pending').length,
        approved: data.filter(c => c.status === 'approved' || c.status === 'reimbursed').length,
        rejected: data.filter(c => c.status === 'rejected').length,
        total: data.reduce((sum, c) => sum + c.amount, 0),
      });
    }
  };

  const handleUpdateStatus = async (claimId: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('expense_claims')
      .update({
        status: status as any,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', claimId);

    if (error) {
      toast.error("Failed to update claim");
    } else {
      toast.success(`Claim ${status}`);
      fetchClaims();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Manager Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.total.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{claim.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground capitalize">{claim.category}</p>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-sm mb-2">{claim.purpose}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">${claim.amount.toFixed(2)}</span>
                    {claim.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateStatus(claim.id, 'approved')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(claim.id, 'rejected')}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
