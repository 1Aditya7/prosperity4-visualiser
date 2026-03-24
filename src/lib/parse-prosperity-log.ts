export type ActivityRow = {
  day: number
  timestamp: number
  product: string
  bidPrice1: number | null
  bidVolume1: number | null
  bidPrice2: number | null
  bidVolume2: number | null
  bidPrice3: number | null
  bidVolume3: number | null
  askPrice1: number | null
  askVolume1: number | null
  askPrice2: number | null
  askVolume2: number | null
  askPrice3: number | null
  askVolume3: number | null
  midPrice: number | null
  profitAndLoss: number | null
}

function parseNullableNumber(value: string | undefined): number | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (trimmed === "") return null

  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

export function parseProsperityActivitiesLog(fileText: string): ActivityRow[] {
  const parsedOuter = JSON.parse(fileText)

  if (!parsedOuter.activitiesLog || typeof parsedOuter.activitiesLog !== "string") {
    throw new Error("activitiesLog not found in uploaded file")
  }

  const rawTable = parsedOuter.activitiesLog.trim()
  const lines = rawTable.split("\n").filter(Boolean)

  if (lines.length < 2) {
    return []
  }

  const header = lines[0].split(";").map((col: string) => col.trim())
  const rows = lines.slice(1)

  return rows.map((line: string) => {
    const cells = line.split(";")

    const row: Record<string, string> = {}
    header.forEach((key: string, index: number) => {
      row[key] = cells[index] ?? ""
    })

    return {
      day: Number(row.day),
      timestamp: Number(row.timestamp),
      product: row.product,

      bidPrice1: parseNullableNumber(row.bid_price_1),
      bidVolume1: parseNullableNumber(row.bid_volume_1),
      bidPrice2: parseNullableNumber(row.bid_price_2),
      bidVolume2: parseNullableNumber(row.bid_volume_2),
      bidPrice3: parseNullableNumber(row.bid_price_3),
      bidVolume3: parseNullableNumber(row.bid_volume_3),

      askPrice1: parseNullableNumber(row.ask_price_1),
      askVolume1: parseNullableNumber(row.ask_volume_1),
      askPrice2: parseNullableNumber(row.ask_price_2),
      askVolume2: parseNullableNumber(row.ask_volume_2),
      askPrice3: parseNullableNumber(row.ask_price_3),
      askVolume3: parseNullableNumber(row.ask_volume_3),

      midPrice: parseNullableNumber(row.mid_price),
      profitAndLoss: parseNullableNumber(row.profit_and_loss),
    }
  })
}