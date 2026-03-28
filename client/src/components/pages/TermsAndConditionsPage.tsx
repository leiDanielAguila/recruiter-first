import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LAST_UPDATED = "March 29, 2026";

export function TermsAndConditionsPage() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button variant="outline" asChild>
          <Link to={isDashboardRoute ? "/dashboard/settings" : "/"}>
            <ArrowLeft className="h-4 w-4" />
            {isDashboardRoute ? "Back to Settings" : "Back to Home"}
          </Link>
        </Button>
        <Badge variant="outline">Last updated: {LAST_UPDATED}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <CardDescription>
            Please review these terms before using Recruiter First.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              1. Scope
            </h2>
            <p>
              Recruiter First is currently a proof-of-concept application for
              evaluating AI-assisted recruiting workflows and productivity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              2. Acceptable Use
            </h2>
            <p>
              You agree not to misuse the service, attempt unauthorized access,
              upload harmful content, or use outputs for unlawful purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              3. Data Responsibility
            </h2>
            <p>
              You are responsible for ensuring uploaded resumes, job
              descriptions, and generated content comply with applicable privacy
              and employment laws in your jurisdiction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              4. Service Disclaimer
            </h2>
            <p>
              The service is provided "as is" with no warranties. AI-generated
              recommendations may be incomplete or inaccurate and should not be
              treated as legal or hiring advice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              5. Licensing Status
            </h2>
            <p>
              This project is currently distributed as a Proof of Concept. The
              project owner plans to adopt the MIT License in a future release.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              6. Changes to Terms
            </h2>
            <p>
              Terms may change as the platform evolves. Continued use after
              updates means you accept the latest published version.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
