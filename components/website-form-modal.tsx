"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Wifi, Activity, Zap } from "lucide-react";

interface Website {
  id: string;
  name: string;
  url: string;
  type: "HTTP" | "HTTPS" | "PING";
  isActive: boolean;
}

interface WebsiteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  website?: Website | null;
  onSubmit: (data: {
    name: string;
    url: string;
    type: "HTTP" | "HTTPS" | "PING";
    isActive: boolean;
  }) => void;
  isLoading?: boolean;
}

export function WebsiteFormModal({
  open,
  onOpenChange,
  website,
  onSubmit,
  isLoading,
}: WebsiteFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    type: "HTTP" as const,
    isActive: true,
  });

  useEffect(() => {
    if (website) {
      setFormData({
        name: website.name,
        url: website.url,
        type: website.type,
        isActive: website.isActive,
      });
    } else {
      setFormData({
        name: "",
        url: "",
        type: "HTTP" as const,
        isActive: true,
      });
    }
  }, [website, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "HTTP":
        return "Monitor HTTP websites";
      case "HTTPS":
        return "Monitor HTTPS websites (recommended)";
      case "PING":
        return "Ping IP addresses or domains";
      default:
        return "";
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {website ? "Edit Monitor" : "Add New Monitor"}
            <Badge variant="outline" className="ml-auto">
              {getTypeIcon(formData.type)}
              <span className="ml-1">{formData.type}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Monitor Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Website"
                required
                className="h-11 bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="type"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Monitor Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "HTTP" | "HTTPS" | "PING") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="h-11 bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                  <SelectItem value="HTTP" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      HTTP
                    </div>
                  </SelectItem>
                  <SelectItem value="HTTPS" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      HTTPS
                    </div>
                  </SelectItem>
                  <SelectItem value="PING" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      PING
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {getTypeDescription(formData.type)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="url"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {formData.type === "PING" ? "IP Address or Domain" : "URL"}
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder={
                formData.type === "PING"
                  ? "192.168.1.1 or example.com"
                  : "https://example.com"
              }
              required
              className="h-11 bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-lg border border-blue-100 dark:border-slate-600">
            <div>
              <Label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Active Monitoring
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enable automatic monitoring for this target
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg"
            >
              {isLoading ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  {website ? "Update Monitor" : "Add Monitor"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
