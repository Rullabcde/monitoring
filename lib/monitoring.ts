import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function checkWebsiteStatus(url: string, type: "HTTP" | "HTTPS" | "PING") {
  const startTime = Date.now()

  try {
    if (type === "PING") {
      return await pingCheck(url, startTime)
    } else {
      return await httpCheck(url, startTime)
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: "down" as const,
      statusCode: null,
      responseTime,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function httpCheck(url: string, startTime: number) {
  // Ensure URL has protocol
  const fullUrl = url.startsWith("http") ? url : `https://${url}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    const response = await fetch(fullUrl, {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    return {
      status: response.ok ? "up" : "down",
      statusCode: response.status,
      responseTime,
      errorMessage: response.ok ? null : `HTTP ${response.status}`,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    if (error.name === "AbortError") {
      return {
        status: "down" as const,
        statusCode: null,
        responseTime,
        errorMessage: "Request timeout",
      }
    }

    return {
      status: "down" as const,
      statusCode: null,
      responseTime,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function pingCheck(host: string, startTime: number) {
  try {
    // Remove protocol if present for ping
    const cleanHost = host.replace(/^https?:\/\//, "").split("/")[0]

    // Use ping command (works on both Windows and Unix)
    const isWindows = process.platform === "win32"
    const pingCmd = isWindows ? `ping -n 1 -w 10000 ${cleanHost}` : `ping -c 1 -W 10 ${cleanHost}`

    const { stdout, stderr } = await execAsync(pingCmd)
    const responseTime = Date.now() - startTime

    if (stderr) {
      return {
        status: "down" as const,
        statusCode: null,
        responseTime,
        errorMessage: stderr,
      }
    }

    // Parse ping response for actual response time
    const pingTimeMatch = stdout.match(/time[<=](\d+(?:\.\d+)?)ms/i)
    const actualResponseTime = pingTimeMatch ? Math.round(Number.parseFloat(pingTimeMatch[1])) : responseTime

    return {
      status: "up" as const,
      statusCode: null,
      responseTime: actualResponseTime,
      errorMessage: null,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: "down" as const,
      statusCode: null,
      responseTime,
      errorMessage: error instanceof Error ? error.message : "Ping failed",
    }
  }
}

export async function monitorWebsite(websiteId: string, url: string, type: "HTTP" | "HTTPS" | "PING") {
  const result = await checkWebsiteStatus(url, type)

  // Save to database
  const { prisma } = await import("./prisma")

  await prisma.statusCheck.create({
    data: {
      websiteId,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage,
    },
  })

  return result
}
