"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Website {
  id: string;
  name: string;
  url: string;
  type: "HTTP" | "HTTPS" | "PING";
  isActive: boolean;
}

interface WebsiteFormProps {
  website?: Website;
  onSubmit: (data: {
    name: string;
    url: string;
    type: "HTTP" | "HTTPS" | "PING";
    isActive: boolean;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function WebsiteForm({
  website,
  onSubmit,
  onCancel,
  isLoading,
}: WebsiteFormProps) {
  const [formData, setFormData] = useState({
    name: website?.name || "",
    url: website?.url || "",
    type: website?.type || ("HTTP" as const),
    isActive: website?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "HTTP":
        return "Monitor HTTP websites";
      case "HTTPS":
        return "Monitor HTTPS websites";
      case "PING":
        return "Ping IP addresses or domains";
      default:
        return "";
    }
  };

  return (
    <Card className="border border-border/40 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {website ? "Edit Monitor" : "Add New Monitor"}
          <Badge variant="outline" className="text-xs">
            {formData.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
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
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Monitor Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "HTTP" | "HTTPS" | "PING") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HTTP">HTTP</SelectItem>
                  <SelectItem value="HTTPS">HTTPS</SelectItem>
                  <SelectItem value="PING">PING</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {getTypeDescription(formData.type)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
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
              className="h-10"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="isActive" className="text-sm font-medium">
                Active Monitoring
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable automatic monitoring for this target
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1 h-10">
              {isLoading
                ? "Saving..."
                : website
                ? "Update Monitor"
                : "Add Monitor"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-10 bg-transparent"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
