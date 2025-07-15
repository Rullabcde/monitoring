"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StatusCheck {
  id: string
  status: string
  responseTime: number | null
  statusCode: number | null
  errorMessage: string | null
  checkedAt: string
}

interface Website {
  id: string
  name: string
  url: string
}

interface HistoryDialogProps {
  website: Website | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoryDialog({ website, open, onOpenChange }: HistoryDialogProps) {
  const [history, setHistory] = useState<StatusCheck[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (website && open) {
      fetchHistory()
    }
  }, [website, open])

  const fetchHistory = async () => {
    if (!website) return

    setLoading(true)
    try {
      const response = await fetch(`/api/websites/${website.id}/history`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    return <Badge variant={status === "up" ? "default" : "destructive"}>{status.toUpperCase()}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>History for {website?.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading history...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Status Code</TableHead>
                <TableHead>Error Message</TableHead>
                <TableHead>Checked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((check) => (
                <TableRow key={check.id}>
                  <TableCell>{getStatusBadge(check.status)}</TableCell>
                  <TableCell>{check.responseTime ? `${check.responseTime}ms` : "-"}</TableCell>
                  <TableCell>{check.statusCode || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{check.errorMessage || "-"}</TableCell>
                  <TableCell>{formatDate(check.checkedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && history.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No history data available</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
