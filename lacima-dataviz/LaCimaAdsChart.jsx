"use client";

import { useMemo } from "react";
import { scaleLinear, scaleTime } from "d3-scale";
import { line as d3line, curveMonotoneX } from "d3-shape";
import { timeDay } from "d3-time";
import { timeFormat } from "d3-time-format";
import { campaignData } from "./campaignData";

/**
 * La Cima Meta Ads — Prior boosted posts vs. optimized test flight.
 * Minimalist annotated chart: three stacked small multiples (one per metric),
 * shared time axis, phase regions shaded, averages drawn as faint horizontal
 * rules, and key handoff points annotated.
 *
 * Drop into a Next.js / React page. No external chart library.
 */

const METRICS = [
  { key: "clicks", label: "Clicks", priorAvg: 61, testAvg: 132 },
  { key: "reach", label: "Reach", priorAvg: 2058, testAvg: 6357 },
  { key: "impressions", label: "Impressions", priorAvg: 2210, testAvg: 8143 },
];

const PRIOR_END = new Date("2025-09-15");
const TEST_START = new Date("2025-09-24");
const TEST_END = new Date("2025-10-21");

// Layout
const WIDTH = 880;
const ROW_HEIGHT = 140;
const ROW_GAP = 36;
const MARGIN = { top: 48, right: 24, bottom: 56, left: 80 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;

const fmtMonthDay = timeFormat("%b %-d");
const fmtNum = (n) => n.toLocaleString();

export default function LaCimaAdsChart() {
  const parsed = useMemo(
    () => campaignData.map((d) => ({ ...d, dateObj: new Date(d.date) })),
    []
  );

  const dateExtent = [
    new Date(parsed[0].date),
    new Date(parsed[parsed.length - 1].date),
  ];
  const x = scaleTime().domain(dateExtent).range([0, INNER_W]);

  const totalHeight =
    MARGIN.top +
    METRICS.length * ROW_HEIGHT +
    (METRICS.length - 1) * ROW_GAP +
    MARGIN.bottom;

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
        Meta ads — daily performance, Jun 10 – Oct 22, 2025
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
          const maxVal = Math.max(...parsed.map((d) => d[m.key])) * 1.1;
          const y = scaleLinear().domain([0, maxVal]).range([ROW_HEIGHT, 0]);

          // Split into prior and test series (skip gap for the line)
          const priorSeries = parsed.filter((d) => d.phase === "prior");
          const testSeries = parsed.filter((d) => d.phase === "test");
          const afterSeries = parsed.filter((d) => d.phase === "after");

          const linePath = d3line()
            .x((d) => x(d.dateObj))
            .y((d) => y(d[m.key]))
            .curve(curveMonotoneX);

          const isFirst = i === 0;
          const isLast = i === METRICS.length - 1;

          const priorPct = Math.round(
            ((m.testAvg - m.priorAvg) / m.priorAvg) * 100
          );

          return (
            <g key={m.key} transform={`translate(${MARGIN.left}, ${rowTop})`}>
              {/* Gap region (hatched) */}
              <rect
                x={x(PRIOR_END)}
                y={0}
                width={x(TEST_START) - x(PRIOR_END)}
                height={ROW_HEIGHT}
                fill="url(#lacima-gap-hatch)"
              />

              {/* Test flight region (soft tint) */}
              <rect
                x={x(TEST_START)}
                y={0}
                width={x(TEST_END) - x(TEST_START)}
                height={ROW_HEIGHT}
                fill="#111"
                fillOpacity="0.04"
              />

              {/* Average reference lines */}
              <line
                x1={0}
                x2={x(PRIOR_END)}
                y1={y(m.priorAvg)}
                y2={y(m.priorAvg)}
                stroke="#999"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <line
                x1={x(TEST_START)}
                x2={x(TEST_END)}
                y1={y(m.testAvg)}
                y2={y(m.testAvg)}
                stroke="#111"
                strokeWidth="1"
                strokeDasharray="2 3"
              />

              {/* Data lines */}
              <path
                d={linePath(priorSeries)}
                fill="none"
                stroke="#999"
                strokeWidth="1.25"
              />
              <path
                d={linePath(testSeries)}
                fill="none"
                stroke="#111"
                strokeWidth="1.5"
              />
              {afterSeries.length > 0 && (
                <path
                  d={linePath(afterSeries)}
                  fill="none"
                  stroke="#bbb"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Y-axis: min and max tick labels */}
              <text
                x={-10}
                y={y(0)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="10"
                fill="#999"
              >
                0
              </text>
              <text
                x={-10}
                y={y(maxVal)}
                textAnchor="end"
                dominantBaseline="hanging"
                fontSize="10"
                fill="#999"
              >
                {fmtNum(Math.round(maxVal))}
              </text>

              {/* Metric label (top-left of row) */}
              <text
                x={-10}
                y={-14}
                textAnchor="end"
                fontSize="11"
                fontWeight="600"
                letterSpacing="0.1em"
                style={{ textTransform: "uppercase" }}
                fill="#111"
              >
                {m.label}
              </text>

              {/* Average value annotations */}
              <text
                x={x(PRIOR_END) - 6}
                y={y(m.priorAvg) - 6}
                textAnchor="end"
                fontSize="10"
                fill="#666"
              >
                avg {fmtNum(m.priorAvg)}
              </text>
              <text
                x={x(TEST_END) - 6}
                y={y(m.testAvg) - 6}
                textAnchor="end"
                fontSize="10"
                fontWeight="600"
                fill="#111"
              >
                avg {fmtNum(m.testAvg)}  (+{priorPct}%)
              </text>

              {/* Phase labels on top row only */}
              {isFirst && (
                <>
                  <text
                    x={x(new Date("2025-07-28"))}
                    y={-28}
                    textAnchor="middle"
                    fontSize="10"
                    letterSpacing="0.15em"
                    fill="#666"
                    style={{ textTransform: "uppercase" }}
                  >
                    Prior — boosted posts
                  </text>
                  <text
                    x={(x(TEST_START) + x(TEST_END)) / 2}
                    y={-28}
                    textAnchor="middle"
                    fontSize="10"
                    letterSpacing="0.15em"
                    fontWeight="600"
                    fill="#111"
                    style={{ textTransform: "uppercase" }}
                  >
                    Test flight — optimized
                  </text>
                </>
              )}

              {/* Bottom row: date ticks */}
              {isLast && (
                <g transform={`translate(0, ${ROW_HEIGHT + 8})`}>
                  {timeDay.every(14).range(dateExtent[0], dateExtent[1]).map((d) => (
                    <g key={d.toISOString()} transform={`translate(${x(d)}, 0)`}>
                      <line y1={-4} y2={0} stroke="#999" strokeWidth="1" />
                      <text
                        y={14}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#666"
                      >
                        {fmtMonthDay(d)}
                      </text>
                    </g>
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend / footer note */}
      <div
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "#666",
          letterSpacing: "0.04em",
          lineHeight: 1.6,
        }}
      >
        Solid line, lighter grey: prior boosted-post strategy. Solid line, black:
        optimized test flight with new creative and targeted audiences. Dashed:
        brief extension past the planned end date. The 8-day gap between the two
        periods is unshaded. Averages are simple daily means across each phase.
      </div>
    </figure>
  );
}
