import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, FileText, Home, Info, Phone, LayoutDashboard, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isManager, setIsManager] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (rolesData) {
          setIsManager(rolesData.some(r => r.role === 'manager' || r.role === 'admin'));
        }
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData();
      } else {
        setUser(null);
        setProfile(null);
        setIsManager(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Receipt className="h-8 w-8" />
            <span>ExpenseClaim</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link to="/about" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Info className="h-4 w-4" />
              About
            </Link>
            {user && (
              <>
                <Link to="/submit-claim" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <FileText className="h-4 w-4" />
                  Submit Claim
                </Link>
                <Link to="/claim-status" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                  <Receipt className="h-4 w-4" />
                  My Claims
                </Link>
                {isManager && (
                  <Link to="/dashboard" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
              </>
            )}
            <Link to="/contact" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")}>Login</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
