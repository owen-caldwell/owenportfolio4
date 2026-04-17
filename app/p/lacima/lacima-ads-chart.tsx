"use client";

import { useMemo } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { line as d3line, curveMonotoneX } from "d3-shape";
import { timeMonth } from "d3-time";
import { timeFormat } from "d3-time-format";
import { campaignData, type CampaignDatum } from "./campaign-data";

type Metric = {
  key: keyof Pick<CampaignDatum, "clicks" | "reach" | "impressions">;
  label: string;
  priorAvg: number;
  testAvg: number;
};

const METRICS: Metric[] = [
  { key: "clicks", label: "Clicks", priorAvg: 61, testAvg: 132 },
  { key: "reach", label: "Reach", priorAvg: 2058, testAvg: 6357 },
  { key: "impressions", label: "Impressions", priorAvg: 2210, testAvg: 8143 },
];

const VISIBLE_START = new Date("2025-08-01");
const PRIOR_END = new Date("2025-09-15");
const TEST_START = new Date("2025-09-24");
const TEST_END = new Date("2025-10-21");

const COLOR_PRIOR = "#aaa";
const COLOR_TEST = "#16a34a";
const COLOR_TEST_LIGHT = "#16a34a20";

const WIDTH = 640;
const ROW_HEIGHT = 200;
const ROW_GAP = 56;
const MARGIN = { top: 52, right: 16, bottom: 52, left: 48 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;

const fmtMonth = timeFormat("%b");
const fmtNum = (n: number) => n.toLocaleString();

type ParsedDatum = CampaignDatum & { dateObj: Date };

export default function LaCimaAdsChart() {
  const parsed: ParsedDatum[] = useMemo(
    () =>
      campaignData
        .filter((d) => new Date(d.date) >= VISIBLE_START)
        .map((d) => ({ ...d, dateObj: new Date(d.date) })),
    [],
  );

  const dateExtent: [Date, Date] = [VISIBLE_START, new Date(parsed[parsed.length - 1].date)];
  const x = scaleTime().domain(dateExtent).range([0, INNER_W]);

  const totalHeight =
    MARGIN.top +
    METRICS.length * ROW_HEIGHT +
    (METRICS.length - 1) * ROW_GAP +
    MARGIN.bottom;

  const gapMidX = (x(PRIOR_END) + x(TEST_START)) / 2;

  return (
    <figure
      style={{
        margin: "0",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
        color: "#111",
      }}
    >
      <figcaption
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#666",
          marginBottom: 12,
        }}
      >
        Meta ads — daily performance, Aug 1 – Oct 22, 2025
      </figcaption>

      <svg
        viewBox={`0 0 ${WIDTH} ${totalHeight}`}
        width="100%"
        style={{ display: "block", overflow: "visible" }}
        role="img"
        aria-label="Three stacked line charts comparing daily Meta ad performance before and during an optimized test flight, for clicks, reach, and impressions."
      >
        <defs>
          <pattern
            id="lacima-gap-hatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#ddd" strokeWidth="1" />
          </pattern>
        </defs>

        {METRICS.map((m, i) => {
          const rowTop = MARGIN.top + i * (ROW_HEIGHT + ROW_GAP);
          const maxVal = Math.max(...parsed.map((d) => d[m.key])) * 1.15;
          const y = scaleLinear().domain([0, maxVal]).range([ROW_HEIGHT, 0]);

          const priorSeries = parsed.filter((d) => d.phase === "prior");
          const testSeries = parsed.filter((d) => d.phase === "test");
          const afterSeries = parsed.filter((d) => d.phase === "after");

          const linePath = d3line<ParsedDatum>()
            .x((d) => x(d.dateObj))
            .y((d) => y(d[m.key]))
            .curve(curveMonotoneX);

          const isFirst = i === 0;
          const isLast = i === METRICS.length - 1;

          const priorPct = Math.round(
            ((m.testAvg - m.priorAvg) / m.priorAvg) * 100,
          );

          return (
            <g key={m.key} transform={`translate(${MARGIN.left}, ${rowTop})`}>
              {/* Background regions */}
              <rect
                x={x(PRIOR_END)}
                y={0}
                width={x(TEST_START) - x(PRIOR_END)}
                height={ROW_HEIGHT}
                fill="url(#lacima-gap-hatch)"
              />
              <rect
                x={x(TEST_START)}
                y={0}
                width={x(TEST_END) - x(TEST_START)}
                height={ROW_HEIGHT}
                fill={COLOR_TEST_LIGHT}
              />

              {/* Y-axis ticks and gridlines */}
              {y.ticks(4).map((tick) => (
                <g key={tick}>
                  <line
                    x1={0}
                    x2={INNER_W}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke="#e5e5e5"
                    strokeWidth="1"
                  />
                  <text
                    x={-8}
                    y={y(tick)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="#999"
                  >
                    {fmtNum(tick)}
                  </text>
                </g>
              ))}

              {/* Data lines */}
              <path
                d={linePath(priorSeries) ?? undefined}
                fill="none"
                stroke={COLOR_PRIOR}
                strokeWidth="1.5"
              />
              <path
                d={linePath(testSeries) ?? undefined}
                fill="none"
                stroke={COLOR_TEST}
                strokeWidth="1.75"
                strokeOpacity={0.5}
              />
              {afterSeries.length > 0 && (
                <path
                  d={linePath(afterSeries) ?? undefined}
                  fill="none"
                  stroke="#ccc"
                  strokeWidth="1.25"
                  strokeDasharray="3 3"
                />
              )}

              {/* Metric label */}
              <text
                x={0}
                y={-10}
                textAnchor="start"
                fontSize="12"
                fontWeight="600"
                letterSpacing="0.1em"
                style={{ textTransform: "uppercase" }}
                fill="#111"
              >
                {m.label}
              </text>

              {/* % increase in the gap between phases, at test avg Y */}
              <text
                x={gapMidX}
                y={y(m.testAvg)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="13"
                fontWeight="700"
                fill={COLOR_TEST}
              >
                +{priorPct}%
              </text>

              {/* Phase label on first row only */}
              {isFirst && (
                <text
                  x={(x(TEST_START) + x(TEST_END)) / 2}
                  y={-36}
                  textAnchor="middle"
                  fontSize="10"
                  letterSpacing="0.12em"
                  fontWeight="600"
                  fill={COLOR_TEST}
                  style={{ textTransform: "uppercase" }}
                >
                  Test flight
                </text>
              )}

              {/* Monthly x-axis ticks on last row */}
              {isLast && (
                <g transform={`translate(0, ${ROW_HEIGHT + 12})`}>
                  {timeMonth
                    .range(dateExtent[0], dateExtent[1])
                    .map((d) => (
                      <g
                        key={d.toISOString()}
                        transform={`translate(${x(d)}, 0)`}
                      >
                        <line y1={-8} y2={0} stroke="#999" strokeWidth="1" />
                        <text
                          y={16}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#666"
                        >
                          {fmtMonth(d)}
                        </text>
                      </g>
                    ))}
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "#666",
          letterSpacing: "0.04em",
          lineHeight: 1.6,
        }}
      >
        Grey line: prior boosted-post strategy. Green line: optimized test
        flight with new creative and targeted audiences. Dashed: brief extension
        past the planned end date. Hatched region marks the gap between phases.
      </div>
    </figure>
  );
}
