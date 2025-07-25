"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebsiteFormModal } from "@/components/website-form-modal";
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
  Zap,
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
  const [showFormModal, setShowFormModal] = useState(false);
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
      title: "🚀 Welcome to Website Monitor",
      description: "Your monitoring dashboard is ready and running!",
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
          title: editingWebsite ? "✅ Monitor Updated!" : "🎉 Monitor Added!",
          description: `${data.name} has been ${
            editingWebsite ? "updated" : "added"
          } successfully.`,
        });
        setShowFormModal(false);
        setEditingWebsite(null);
        fetchWebsites();
      } else {
        throw new Error("Failed to save monitor");
      }
    } catch (error) {
      toast({
        title: "❌ Error",
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
          title: "🗑️ Monitor Deleted",
          description: "Monitor has been deleted successfully.",
        });
        fetchWebsites();
      } else {
        throw new Error("Failed to delete monitor");
      }
    } catch (error) {
      toast({
        title: "❌ Error",
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
          title: isActive ? "▶️ Monitoring Enabled" : "⏸️ Monitoring Paused",
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
        title: "❌ Error",
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
          title: "🔍 Check Completed",
          description: `${website.name} has been checked successfully.`,
        });
        fetchWebsites();
      } else {
        throw new Error("Failed to check monitor");
      }
    } catch (error) {
      toast({
        title: "❌ Error",
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
          title: "🔄 Monitoring Completed",
          description: result.message,
        });
        fetchWebsites();
      } else {
        throw new Error("Failed to run monitoring");
      }
    } catch (error) {
      toast({
        title: "❌ Error",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />

      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor your websites and servers in real-time
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleMonitorAll}
              disabled={monitoring}
              className="h-11 bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${monitoring ? "animate-spin" : ""}`}
              />
              {monitoring ? "Checking..." : "Check All"}
            </Button>
            <Button
              onClick={() => setShowFormModal(true)}
              className="h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Monitor
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Monitors
              </CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stats.active} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Online
              </CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.up}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Services running
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Offline
              </CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Wifi className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.down}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Services down
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Avg Response
              </CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.avgResponseTime}ms
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Website List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Monitors
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Auto-refresh every 10 seconds
            </div>
          </div>

          <WebsiteList
            websites={websites}
            onEdit={(website) => {
              setEditingWebsite(website);
              setShowFormModal(true);
            }}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onViewHistory={setHistoryWebsite}
            onCheckNow={handleCheckNow}
          />
        </div>

        {/* Form Modal */}
        <WebsiteFormModal
          open={showFormModal}
          onOpenChange={setShowFormModal}
          website={editingWebsite}
          onSubmit={handleSubmit}
          isLoading={loading}
        />

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
