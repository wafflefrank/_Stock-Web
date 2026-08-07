<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GridComponent, LineChart, TooltipComponent, CanvasRenderer])

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  positive: {
    type: Boolean,
    default: true
  },
  range: {
    type: String,
    default: '1D'
  }
})

const chartElement = ref(null)
let chart = null
let resizeObserver = null

const chartRows = computed(() =>
  props.points
    .map((point) => ({
      date: String(point.date ?? ''),
      open: Number(point.open ?? point.close ?? point.value),
      high: Number(point.high ?? point.max ?? point.close ?? point.value),
      low: Number(point.low ?? point.min ?? point.close ?? point.value),
      close: Number(point.close ?? point.value)
    }))
    .filter((point) => point.date && Number.isFinite(point.close))
)

const seriesRows = computed(() => {
  const rows = chartRows.value

  if (props.range === '1D') {
    return rows.slice(-1).flatMap((row) => buildSessionRows(row, 5))
  }

  if (props.range === '5D') {
    return rows.slice(-5).flatMap((row) => buildSessionRows(row, 30))
  }

  return rows.map((row, index) => ({
    ...row,
    key: row.date,
    displayTime: row.date,
    tickLabel: formatDateTick(row.date),
    close: roundPrice(row.close),
    pointIndex: index
  }))
})

const chartColor = computed(() =>
  props.positive ? getCssColor('--color-up', '#c24d38') : getCssColor('--color-down', '#357a4a')
)
const chartAreaColor = computed(() => {
  const color = props.positive
    ? getCssColor('--color-up', '#c24d38')
    : getCssColor('--color-down', '#357a4a')

  return hexToRgba(color, 0.16)
})

const tradingSessionMinutes = 270

onMounted(async () => {
  await nextTick()
  initChart()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
})

watch(
  () => [chartRows.value, props.positive, props.range],
  () => {
    updateChart()
  },
  { deep: true }
)

function initChart() {
  if (shouldSkipChart() || chart) {
    return
  }

  chart = echarts.init(chartElement.value, null, {
    renderer: 'canvas'
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
    })
    resizeObserver.observe(chartElement.value)
  }

  updateChart()
}

function updateChart() {
  if (!chart) {
    initChart()
    return
  }

  const rows = seriesRows.value
  const labels = rows.map((point) => point.key)
  const values = rows.map((point) => point.close)

  chart.setOption(
    {
      animation: true,
      animationDuration: 850,
      animationEasing: 'cubicOut',
      grid: {
        top: 34,
        right: 22,
        bottom: 42,
        left: 58,
        containLabel: false
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: getCssColor('--color-surface', '#fffdf8'),
        borderColor: getCssColor('--color-border', '#d7ded4'),
        borderWidth: 1,
        padding: [8, 10],
        className: 'market-chart-tooltip-shell',
        textStyle: {
          color: getCssColor('--color-text', '#17352d'),
          fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, monospace',
          fontSize: 12
        },
        axisPointer: {
          lineStyle: {
            color: 'rgba(47, 91, 75, 0.3)',
            type: 'dashed'
          }
        },
        formatter(params) {
          const point = params?.[0]

          if (!point) {
            return ''
          }

          const row = rows[point.dataIndex]
          const price = point.data

          return `
            <div class="market-chart-tooltip">
              <strong>${formatPrice(price)} TWD</strong>
              <span>${row?.displayTime ?? ''}</span>
            </div>
          `
        }
      },
      xAxis: {
        type: 'category',
        name: '時間',
        nameGap: 20,
        nameLocation: 'end',
        boundaryGap: false,
        data: labels,
        axisLine: {
          lineStyle: {
            color: 'rgba(104, 118, 111, 0.35)'
          }
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          interval: (index) => shouldShowAxisTick(rows[index])
        },
        axisLabel: {
          color: getCssColor('--color-muted', '#68766f'),
          fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, monospace',
          fontSize: 11,
          hideOverlap: true,
          showMinLabel: true,
          showMaxLabel: true,
          interval: (index) => shouldShowAxisLabel(rows[index], index, rows.length),
          formatter: (_, index) => rows[index]?.tickLabel ?? ''
        },
        nameTextStyle: {
          color: getCssColor('--color-muted', '#68766f'),
          fontWeight: 700,
          padding: [0, 0, 0, 8]
        }
      },
      yAxis: {
        type: 'value',
        name: '股價',
        scale: true,
        splitNumber: 4,
        axisLine: {
          show: true,
          lineStyle: {
            color: 'rgba(104, 118, 111, 0.35)'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: getCssColor('--color-text', '#17352d'),
          fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, monospace',
          fontSize: 11,
          formatter: (value) => formatAxisPrice(value)
        },
        nameTextStyle: {
          color: getCssColor('--color-muted', '#68766f'),
          fontWeight: 700,
          padding: [0, 26, 0, 0]
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(215, 222, 212, 0.85)'
          }
        }
      },
      series: [
        {
          type: 'line',
          data: values,
          smooth: false,
          symbol: 'circle',
          symbolSize: 7,
          showSymbol: false,
          lineStyle: {
            width: 2.5,
            color: chartColor.value,
            cap: 'butt',
            join: 'miter'
          },
          itemStyle: {
            color: chartColor.value,
            borderColor: getCssColor('--color-surface', '#fffdf8'),
            borderWidth: 2
          },
          areaStyle: {
            color: chartAreaColor.value
          },
          emphasis: {
            focus: 'series',
            scale: true
          }
        }
      ]
    },
    true
  )
}

function shouldSkipChart() {
  return !chartElement.value || typeof window === 'undefined' || import.meta.env.MODE === 'test'
}

function getCssColor(variable, fallback) {
  if (typeof document === 'undefined') {
    return fallback
  }

  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback
}

function hexToRgba(color, alpha) {
  const normalized = color.replace('#', '').trim()

  if (![3, 6].includes(normalized.length)) {
    return color
  }

  const expanded = normalized.length === 3
    ? normalized.split('').map((value) => `${value}${value}`).join('')
    : normalized
  const numeric = Number.parseInt(expanded, 16)

  if (!Number.isFinite(numeric)) {
    return color
  }

  const red = (numeric >> 16) & 255
  const green = (numeric >> 8) & 255
  const blue = numeric & 255

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function buildSessionRows(row, intervalMinutes) {
  const rows = []

  for (let minute = 0; minute <= tradingSessionMinutes; minute += intervalMinutes) {
    const price = estimateSessionPrice(row, minute, rows.length)

    rows.push({
      ...row,
      key: `${row.date}-${minute}`,
      close: price,
      displayTime: `${row.date} ${formatSessionMinute(minute, true)}`,
      tickLabel: formatSessionMinute(minute),
      sessionMinute: minute
    })
  }

  return rows
}

function estimateSessionPrice(row, minute, index) {
  const open = Number.isFinite(row.open) ? row.open : row.close
  const high = Number.isFinite(row.high) ? Math.max(row.high, open, row.close) : Math.max(open, row.close)
  const low = Number.isFinite(row.low) ? Math.min(row.low, open, row.close) : Math.min(open, row.close)
  const close = row.close
  const isRising = close >= open
  const anchors = isRising
    ? [
        [0, open],
        [70, low],
        [190, high],
        [tradingSessionMinutes, close]
      ]
    : [
        [0, open],
        [70, high],
        [190, low],
        [tradingSessionMinutes, close]
      ]
  const base = interpolateAnchors(anchors, minute)
  const range = Math.max(high - low, Math.abs(close) * 0.004, 1)
  const wave = Math.sin(index * 1.72) * range * 0.06

  return roundPrice(clamp(base + wave, low, high))
}

function interpolateAnchors(anchors, minute) {
  const nextIndex = anchors.findIndex(([anchorMinute]) => anchorMinute >= minute)

  if (nextIndex <= 0) {
    return anchors[0][1]
  }

  const [startMinute, startPrice] = anchors[nextIndex - 1]
  const [endMinute, endPrice] = anchors[nextIndex]
  const progress = (minute - startMinute) / (endMinute - startMinute || 1)

  return startPrice + (endPrice - startPrice) * progress
}

function shouldShowAxisTick(row) {
  if (!row) {
    return false
  }

  if (props.range === '1D') {
    return true
  }

  if (props.range === '5D') {
    return row.sessionMinute % 30 === 0
  }

  return true
}

function shouldShowAxisLabel(row, index, total) {
  if (!row) {
    return false
  }

  if (props.range === '1D') {
    return row.sessionMinute % 30 === 0 || index === total - 1
  }

  if (props.range === '5D') {
    return row.sessionMinute === 0 || index === total - 1
  }

  if (props.range === '1M') {
    return true
  }

  return index === 0 || index === total - 1 || index % Math.ceil(total / 6) === 0
}

function formatSessionMinute(value, withPeriod = false) {
  const totalMinutes = Math.min(Math.max(Number(value) || 0, 0), tradingSessionMinutes)
  const hour = 9 + Math.floor(totalMinutes / 60)
  const minute = Math.round(totalMinutes % 60)
  const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  if (!withPeriod) {
    return label
  }

  return `${hour < 12 ? '上午' : '下午'}${hour > 12 ? hour - 12 : hour}:${String(minute).padStart(2, '0')}`
}

function formatDateTick(value) {
  const [, month, day] = String(value).split('-')

  return month && day ? `${Number(month)}/${Number(day)}` : value
}

function formatAxisPrice(value) {
  const number = Number(value)
  const decimals = Math.abs(number) < 100 ? 2 : Math.abs(number) < 1000 ? 1 : 0

  return number.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

function formatPrice(value) {
  return Number(value).toLocaleString('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function roundPrice(value) {
  return Number(value.toFixed(2))
}
</script>

<template>
  <div
    ref="chartElement"
    class="market-chart"
    :class="{ 'market-chart--negative': !positive }"
    role="img"
    aria-label="Selected stock price chart with time and price axes"
  ></div>
</template>
