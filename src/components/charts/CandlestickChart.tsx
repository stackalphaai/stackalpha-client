import { useEffect, useRef } from "react"
import { createChart, ColorType, CrosshairMode, type IChartApi, type ISeriesApi } from "lightweight-charts"

export interface Candle {
  t: number // timestamp ms
  o: string // open
  h: string // high
  l: string // low
  c: string // close
  v: string // volume
}

interface CandlestickChartProps {
  candles: Candle[]
  entryPrice?: number
  takeProfitPrice?: number
  stopLossPrice?: number
  height?: number
  direction?: "long" | "short"
}

export function CandlestickChart({
  candles,
  entryPrice,
  takeProfitPrice,
  stopLossPrice,
  height = 400,
  direction,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "hsl(var(--muted-foreground))",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "hsl(var(--border) / 0.3)" },
        horzLines: { color: "hsl(var(--border) / 0.3)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "hsl(var(--muted-foreground) / 0.4)", width: 1, style: 2 },
        horzLine: { color: "hsl(var(--muted-foreground) / 0.4)", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "hsl(var(--border) / 0.5)",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "hsl(var(--border) / 0.5)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height,
    })

    // Candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })

    // Convert candles to lightweight-charts format
    const chartData = candles
      .map((c) => ({
        time: Math.floor(c.t / 1000) as any, // seconds
        open: parseFloat(c.o),
        high: parseFloat(c.h),
        low: parseFloat(c.l),
        close: parseFloat(c.c),
      }))
      .sort((a, b) => a.time - b.time)

    candlestickSeries.setData(chartData)

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    })

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    const volumeData = candles
      .map((c) => {
        const close = parseFloat(c.c)
        const open = parseFloat(c.o)
        return {
          time: Math.floor(c.t / 1000) as any,
          value: parseFloat(c.v),
          color: close >= open ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
        }
      })
      .sort((a, b) => a.time - b.time)

    volumeSeries.setData(volumeData)

    // Price lines for Entry, TP, SL
    if (entryPrice && entryPrice > 0) {
      candlestickSeries.createPriceLine({
        price: entryPrice,
        color: "#3b82f6",
        lineWidth: 2,
        lineStyle: 2, // dashed
        axisLabelVisible: true,
        title: "Entry",
      })
    }

    if (takeProfitPrice && takeProfitPrice > 0) {
      candlestickSeries.createPriceLine({
        price: takeProfitPrice,
        color: "#22c55e",
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "TP",
      })
    }

    if (stopLossPrice && stopLossPrice > 0) {
      candlestickSeries.createPriceLine({
        price: stopLossPrice,
        color: "#ef4444",
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "SL",
      })
    }

    chart.timeScale().fitContent()

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width })
      }
    })
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [candles, entryPrice, takeProfitPrice, stopLossPrice, height, direction])

  if (candles.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground rounded-lg border border-dashed"
        style={{ height }}
      >
        No chart data available
      </div>
    )
  }

  return <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />
}
