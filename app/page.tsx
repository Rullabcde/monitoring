"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebsiteForm } from "@/components/website-form";
import { WebsiteList } from "@/components/website-list";
import { HistoryDialog } from "@/components/history-dialog";
import { Header } from "@/components/header";
import { AuthWrapper } from "@/components/auth-wrapper";
import {
  Plus,
  RefreshCw,
  Activity,
  Globe,
  Wifi,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StatusCheck {
  id: string;
  status: string;
  responseTime: number | null;
  checkedAt: string;
}

interface Website {
  id: string;
  name: string;
  url: string;
  type: "HTTP" | "HTTPS" | "PING";
  isActive: boolean;
  statusChecks: StatusCheck[];
}

function DashboardContent() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [historyWebsite, setHistoryWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWebsites();
    const interval = setInterval(fetchWebsites, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show a welcome toast when the dashboard loads
    toast({
      title: "Welcome to Website Monitor",
      description: "Your monitoring dashboard is ready.",
    });
  }, [toast]);

  const fetchWebsites = async () => {
    try {
      const response = await fetch("/api/websites");
      if (response.ok) {
        const data = await response.json();
        setWebsites(data);
      }
    } catch (error) {
      console.error("Failed to fetch websites:", error);
    }
  };

  const handleSubmit = async (data: {
    name: string;
    url: string;
    type: "HTTP" | "HTTPS" | "PING";
    isActive: boolean;
  }) => {
    setLoading(true);
    try {
      const url = editingWebsite
        ? `/api/websites/${editingWebsite.id}`
        : "/api/websites";
      const method = editingWebsite ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: editingWebsite ? "Monitor updated" : "Monitor added",
          description: `${data.name} has been ${
            editingWebsite ? "updated" : "added"
          } successfully.`,
        });
        setShowForm(false);
        setEditingWebsite(null);
        fetchWebsites();
      } else {
        throw new Error("Failed to save monitor");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save monitor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Monitor deleted",
          description: "Monitor has been deleted successfully.",
        });
        fetchWebsites();
      } else {
        throw new Error("Failed to delete monitor");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete monitor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const website = websites.find((w) => w.id === id);
      if (!website) return;

      const response = await fetch(`/api/websites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...website, isActive }),
      });

      if (response.ok) {
        toast({
          title: isActive ? "Monitoring enabled" : "Monitoring paused",
          description: `${website.name} monitoring has been ${
            isActive ? "enabled" : "paused"
          }.`,
        });
        fetchWebsites();
      } else {
        throw new Error("Failed to update monitor");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update monitor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCheckNow = async (website: Website) => {
    try {
      const response = await fetch("/api/monitor/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteId: website.id,
          url: website.url,
          type: website.type,
        }),
      });

      if (response.ok) {
        toast({
          title: "Check completed",
          description: `${website.name} has been checked.`,
        });
        fetchWebsites();
      } else {
        throw new Error("Failed to check monitor");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check monitor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMonitorAll = async () => {
    setMonitoring(true);
    try {
      const response = await fetch("/api/monitor", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Monitoring completed",
          description: result.message,
        });
        fetchWebsites();
      } else {
        throw new Error("Failed to run monitoring");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run monitoring. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMonitoring(false);
    }
  };

  const getOverallStats = () => {
    const total = websites.length;
    const active = websites.filter((w) => w.isActive).length;
    const up = websites.filter(
      (w) => w.statusChecks.length > 0 && w.statusChecks[0].status === "up"
    ).length;
    const down = websites.filter(
      (w) => w.statusChecks.length > 0 && w.statusChecks[0].status === "down"
    ).length;
    const avgResponseTime =
      websites
        .filter(
          (w) => w.statusChecks.length > 0 && w.statusChecks[0].responseTime
        )
        .reduce((acc, w) => acc + (w.statusChecks[0].responseTime || 0), 0) /
        websites.filter(
          (w) => w.statusChecks.length > 0 && w.statusChecks[0].responseTime
        ).length || 0;

    return {
      total,
      active,
      up,
      down,
      avgResponseTime: Math.round(avgResponseTime),
    };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-600">
              Monitor your websites and servers in real-time
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleMonitorAll}
              disabled={monitoring}
              className="h-10 bg-transparent"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${monitoring ? "animate-spin" : ""}`}
              />
              {monitoring ? "Checking..." : "Check All"}
            </Button>
            <Button onClick={() => setShowForm(true)} className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add Monitor
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Monitors
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.active} active
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Online
              </CardTitle>
              <Globe className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.up}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Services running
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Offline
              </CardTitle>
              <Wifi className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.down}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Services down
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Response
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.avgResponseTime}ms
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <WebsiteForm
            website={editingWebsite}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingWebsite(null);
            }}
            isLoading={loading}
          />
        )}

        {/* Website List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Monitors</h3>
            <div className="text-sm text-slate-500">
              Auto-refresh every 10 seconds
            </div>
          </div>

          <WebsiteList
            websites={websites}
            onEdit={(website) => {
              setEditingWebsite(website);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onViewHistory={setHistoryWebsite}
            onCheckNow={handleCheckNow}
          />
        </div>

        {/* History Dialog */}
        <HistoryDialog
          website={historyWebsite}
          open={!!historyWebsite}
          onOpenChange={(open) => !open && setHistoryWebsite(null)}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthWrapper>
      <DashboardContent />
    </AuthWrapper>
  );
}
