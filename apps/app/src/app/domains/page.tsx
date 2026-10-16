import { Globe, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockDomains } from "@/data/domains";
import { AddDomainDialog } from "@/components/AddDomainDialog";

export default function Domains() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Domains</h1>
          <p className="text-muted-foreground">Connect custom domains for white labeling</p>
        </div>
        <AddDomainDialog />
      </div>

      <div className="grid gap-4">
        {mockDomains.map((d) => (
          <Card key={d.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">{d.domain}</CardTitle>
                  <CardDescription>{d.links} links</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={d.status === "verified" ? "default" : "secondary"}>
                  {d.status === "verified" ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <AlertCircle className="mr-1 h-3 w-3" />
                  )}
                  {d.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
