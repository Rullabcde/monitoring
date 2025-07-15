"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Play, Pause, BarChart3, Globe, Wifi, Activity } from "lucide-react"
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
} from "@/components/ui/alert-dialog"

interface StatusCheck {
  id: string
  status: string
  responseTime: number | null
  checkedAt: string
}

interface Website {
  id: string
  name: string
  url: string
  type: "HTTP" | "HTTPS" | "PING"
  isActive: boolean
  statusChecks: StatusCheck[]
}

interface WebsiteListProps {
  websites: Website[]
  onEdit: (website: Website) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onViewHistory: (website: Website) => void
  onCheckNow: (website: Website) => void
}

export function WebsiteList({
  websites,
  onEdit,
  onDelete,
  onToggleActive,
  onViewHistory,
  onCheckNow,
}: WebsiteListProps) {
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set())

  const handleCheckNow = async (website: Website) => {
    setCheckingIds((prev) => new Set(prev).add(website.id))
    await onCheckNow(website)
    setCheckingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(website.id)
      return newSet
    })
  }

  const getStatusBadge = (website: Website) => {
    const latestCheck = website.statusChecks[0]
    if (!latestCheck) {
      return (
        <Badge variant="secondary" className="text-xs">
          No Data
        </Badge>
      )
    }

    return (
      <Badge
        variant={latestCheck.status === "up" ? "default" : "destructive"}
        className={`text-xs ${latestCheck.status === "up" ? "bg-green-100 text-green-800 border-green-200" : ""}`}
      >
        {latestCheck.status.toUpperCase()}
        {latestCheck.responseTime && ` • ${latestCheck.responseTime}ms`}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "HTTP":
      case "HTTPS":
        return <Globe className="h-4 w-4" />
      case "PING":
        return <Wifi className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatLastCheck = (website: Website) => {
    const latestCheck = website.statusChecks[0]
    if (!latestCheck) return "Never"

    const date = new Date(latestCheck.checkedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (websites.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="text-center py-12">
          <Activity className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-slate-700">No monitors configured</h3>
          <p className="text-slate-500 mb-6">Get started by adding your first website or server to monitor.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {websites.map((website) => (
        <Card key={website.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  {getTypeIcon(website.type)}
                  <Badge variant="outline" className="text-xs">
                    {website.type}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{website.name}</h3>
                    {!website.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Paused
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{website.url}</p>
                  <p className="text-xs text-slate-400 mt-1">Last checked: {formatLastCheck(website)}</p>
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
                    className="h-8 w-8 p-0"
                  >
                    <Activity className={`h-4 w-4 ${checkingIds.has(website.id) ? "animate-pulse" : ""}`} />
                  </Button>

                  <Button size="sm" variant="ghost" onClick={() => onViewHistory(website)} className="h-8 w-8 p-0">
                    <BarChart3 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleActive(website.id, !website.isActive)}
                    className="h-8 w-8 p-0"
                  >
                    {website.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button size="sm" variant="ghost" onClick={() => onEdit(website)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{website.name}"? This action cannot be undone and will remove
                          all historical data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(website.id)} className="bg-red-600 hover:bg-red-700">
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
  )
}
