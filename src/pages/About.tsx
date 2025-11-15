import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Lightbulb, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About ExpenseClaim</h1>
          
          <div className="prose max-w-none mb-12">
            <p className="text-lg text-muted-foreground mb-4">
              ExpenseClaim is a modern expense management platform designed to simplify 
              the reimbursement process for both employees and managers. Our mission is to 
              eliminate the paperwork, reduce processing time, and provide complete transparency 
              in the expense claim workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To transform expense management into a seamless, automated process 
                  that saves time and reduces errors.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lightbulb className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leveraging OCR technology and AI to automate data extraction and 
                  detect anomalies in expense patterns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>User-Centric</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built with feedback from employees and finance teams to create 
                  an intuitive experience for everyone.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Automation</h3>
                <p className="text-muted-foreground">
                  Reduce manual data entry by using OCR to automatically extract information 
                  from receipts and invoices.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  Provide real-time status tracking so employees always know where their 
                  claims stand in the approval process.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Efficiency</h3>
                <p className="text-muted-foreground">
                  Enable managers to review and approve claims quickly with a comprehensive 
                  dashboard and analytics.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Fraud Prevention</h3>
                <p className="text-muted-foreground">
                  Implement AI-based anomaly detection to identify unusual spending patterns 
                  and potential fraud.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Digital Workflow</h3>
                <p className="text-muted-foreground">
                  Eliminate paper-based processes with a fully digital workflow from submission 
                  to reimbursement.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
