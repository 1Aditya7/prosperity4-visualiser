"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  IconChartLine,
  IconDatabase,
  IconFileUpload,
  IconLayoutDashboard,
} from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { parseProsperityActivitiesLog } from "@/lib/parse-prosperity-log"

type PnlPoint = {
  ts: string
  timestamp: number
  pnl: number
}

const chartConfig = {
  pnl: {
    label: "PnL",
    color: "hsl(var(--chart-1))",
  },
}

function buildPnlSeries(fileText: string): PnlPoint[] {
  const rows = parseProsperityActivitiesLog(fileText)

  const tomatoRows = rows.filter((row) => row.product === "TOMATOES")

  return tomatoRows.map((row) => ({
    ts: `${row.timestamp}`,
    timestamp: row.timestamp,
    pnl: row.profitAndLoss ?? 0,
  }))
}

function AppSidebar({
  fileName,
  onUpload,
}: {
  fileName: string
  onUpload: (file: File) => void
}) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <IconDatabase className="h-4 w-4" />
          </div>
          <div className="font-semibold">Prosperity Visualizer</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Upload</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <IconFileUpload className="h-4 w-4" />
                Upload log
              </label>

              <Input
                type="file"
                accept=".log,.json,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onUpload(file)
                }}
              />

              <p className="mt-3 text-xs text-muted-foreground">
                {fileName ? `Loaded: ${fileName}` : "No file uploaded"}
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <IconLayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <IconChartLine />
                  <span>PnL</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="px-2 py-3 text-xs text-muted-foreground">
          Prosperity4Visualiser
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function Page() {
  const [fileName, setFileName] = React.useState("")
  const [chartData, setChartData] = React.useState<PnlPoint[]>([])
  const [error, setError] = React.useState("")

  async function handleUpload(file: File) {
    try {
      setError("")
      setFileName(file.name)

      const text = await file.text()
      const pnlSeries = buildPnlSeries(text)

      setChartData(pnlSeries)
      console.log("PnL series:", pnlSeries)
    } catch (err) {
      console.error(err)
      setChartData([])
      setError(err instanceof Error ? err.message : "Failed to parse log")
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar fileName={fileName} onUpload={handleUpload} />

      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Upload a log on the left and view PnL in the center.
            </p>
          </div>

          {error ? (
            <Card>
              <CardContent className="pt-6 text-sm text-red-500">
                {error}
              </CardContent>
            </Card>
          ) : null}

          <Card className="min-h-[520px]">
            <CardHeader>
              <CardTitle>PnL Performance</CardTitle>
              <CardDescription>
                Showing TOMATOES product PnL over timestamp
              </CardDescription>
            </CardHeader>

            <CardContent>
              {chartData.length ? (
                <ChartContainer config={chartConfig} className="h-[420px] w-full">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="fillPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-pnl)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-pnl)"
                          stopOpacity={0.08}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="ts"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={24}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />

                    <Area
                      dataKey="pnl"
                      type="monotone"
                      fill="url(#fillPnl)"
                      stroke="var(--color-pnl)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[420px] items-center justify-center rounded-xl border border-dashed">
                  <p className="text-sm text-muted-foreground">
                    No data yet. Upload a log from the left sidebar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}