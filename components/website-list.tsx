"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Globe,
  Wifi,
  Activity,
  Zap,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface WebsiteListProps {
  websites: Website[];
  onEdit: (website: Website) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onViewHistory: (website: Website) => void;
  onCheckNow: (website: Website) => void;
}

export function WebsiteList({
  websites,
  onEdit,
  onDelete,
  onToggleActive,
  onViewHistory,
  onCheckNow,
}: WebsiteListProps) {
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());

  const handleCheckNow = async (website: Website) => {
    setCheckingIds((prev) => new Set(prev).add(website.id));
    await onCheckNow(website);
    setCheckingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(website.id);
      return newSet;
    });
  };

  const getStatusBadge = (website: Website) => {
    const latestCheck = website.statusChecks[0];
    if (!latestCheck) {
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
        >
          No Data
        </Badge>
      );
    }

    return (
      <Badge
        variant={latestCheck.status === "up" ? "outline" : "destructive"}
        className={`text-xs font-medium ${
          latestCheck.status === "up"
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full mr-1 ${
            latestCheck.status === "up" ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        {latestCheck.status.toUpperCase()}
        {latestCheck.responseTime && ` • ${latestCheck.responseTime}ms`}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "HTTP":
      case "HTTPS":
        return <Globe className="h-4 w-4" />;
      case "PING":
        return <Wifi className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatLastCheck = (website: Website) => {
    const latestCheck = website.statusChecks[0];
    if (!latestCheck) return "Never";

    const date = new Date(latestCheck.checkedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (websites.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
            No monitors configured
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Get started by adding your first website or server to monitor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {websites.map((website) => (
        <Card
          key={website.id}
          className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:scale-[1.01]"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {getTypeIcon(website.type)}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  >
                    {website.type}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {website.name}
                    </h3>
                    {!website.isActive && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                      >
                        Paused
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {website.url}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Last checked: {formatLastCheck(website)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(website)}

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCheckNow(website)}
                    disabled={checkingIds.has(website.id)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    title="Check now"
                  >
                    <Activity
                      className={`h-4 w-4 text-blue-600 ${
                        checkingIds.has(website.id) ? "animate-pulse" : ""
                      }`}
                    />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewHistory(website)}
                    className="h-8 w-8 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    title="View history"
                  >
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      onToggleActive(website.id, !website.isActive)
                    }
                    className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/30"
                    title={
                      website.isActive
                        ? "Pause monitoring"
                        : "Resume monitoring"
                    }
                  >
                    {website.isActive ? (
                      <Pause className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Play className="h-4 w-4 text-green-600" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(website)}
                    className="h-8 w-8 p-0 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title="Edit monitor"
                  >
                    <Edit className="h-4 w-4 text-slate-600" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Delete monitor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-white">
                          Delete Monitor
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                          Are you sure you want to delete "{website.name}"? This
                          action cannot be undone and will remove all historical
                          data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(website.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
