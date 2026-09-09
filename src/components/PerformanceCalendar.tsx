"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Flex, Grid, Select, Text } from "@chakra-ui/react";
import type { ArticleListItem } from "types";

type Unit = "dollar" | "r";
type View = "month" | "year";

type DayTrade = {
  id: string;
  symbol: string;
  r: number | null;
  pnlUsd: number | null;
};

type DayData = {
  date: Date;
  inMonth: boolean;
  trades: DayTrade[];
  count: number;
  totalR: number;
  totalPnl: number;
};

type MonthData = {
  month: number;
  year: number;
  count: number;
  totalR: number;
  totalPnl: number;
};

const LS_KEYS = {
  unit: "tj-admin-calendar-unit",
  view: "tj-admin-calendar-view",
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const pad = (n: number) => String(n).padStart(2, "0");
const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Prefer closedAt, then openedAt, then publishedAt */
function tradeDateKey(a: ArticleListItem): string | null {
  const iso = a.closedAt || a.openedAt || a.publishedAt;
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return toDateKey(d);
}

export default function PerformanceCalendar({
  articles,
}: {
  articles: ArticleListItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [view, setView] = useState<View>("month");
  const [unit, setUnit] = useState<Unit>("dollar");

  useEffect(() => {
    setMounted(true);
    setView((localStorage.getItem(LS_KEYS.view) as View) || "month");
    setUnit((localStorage.getItem(LS_KEYS.unit) as Unit) || "dollar");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_KEYS.view, view);
    localStorage.setItem(LS_KEYS.unit, unit);
  }, [mounted, view, unit]);

  const dayMap = useMemo(() => {
    const map = new Map<string, DayTrade[]>();

    for (const a of articles) {
      if (a.type !== "live") continue;
      const hasR = a.resultR !== null && a.resultR !== undefined;
      const hasPnl = a.pnlUsd !== null && a.pnlUsd !== undefined;
      if (!hasR && !hasPnl) continue;

      const day = tradeDateKey(a);
      if (!day) continue;

      const list = map.get(day) || [];
      list.push({
        id: a.id,
        symbol: a.symbol || "—",
        r: hasR ? Number(a.resultR) : null,
        pnlUsd: hasPnl ? Number(a.pnlUsd) : null,
      });
      map.set(day, list);
    }

    return map;
  }, [articles]);

  const getDayTotals = (trades: DayTrade[]) => {
    const totalR = trades.reduce((s, t) => s + (t.r ?? 0), 0);
    const totalPnl = trades.reduce((s, t) => s + (t.pnlUsd ?? 0), 0);
    return { totalR, totalPnl };
  };

  const monthDays = useMemo<DayData[]>(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const offset = (startOfMonth.getDay() + 6) % 7;
    const start = new Date(currentYear, currentMonth, 1 - offset);
    const days: DayData[] = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toDateKey(d);
      const inMonth =
        d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      const trades = dayMap.get(key) ?? [];
      const { totalR, totalPnl } = getDayTotals(trades);

      days.push({
        date: d,
        inMonth,
        trades,
        count: trades.length,
        totalR,
        totalPnl,
      });
    }

    return days;
  }, [currentYear, currentMonth, dayMap]);

  const yearMonths = useMemo<MonthData[]>(() => {
    const months: MonthData[] = [];

    for (let m = 0; m < 12; m++) {
      const start = new Date(currentYear, m, 1);
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      let count = 0;
      let totalR = 0;
      let totalPnl = 0;

      for (let d = 0; d < daysInMonth; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + d);
        const key = toDateKey(day);
        const trades = dayMap.get(key) ?? [];
        if (trades.length) {
          count += trades.length;
          const t = getDayTotals(trades);
          totalR += t.totalR;
          totalPnl += t.totalPnl;
        }
      }

      months.push({ month: m, year: currentYear, count, totalR, totalPnl });
    }

    return months;
  }, [currentYear, dayMap]);

  const displayValue = (r: number, pnl: number) => (unit === "dollar" ? pnl : r);

  const formatValue = (v: number) => {
    const sign = v > 0 ? "+" : "";
    if (unit === "dollar") {
      return `${sign}${v.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} $`;
    }
    return `${sign}${v.toFixed(2)}R`;
  };

  const formatTradeValue = (t: DayTrade) => {
    if (unit === "dollar") {
      if (t.pnlUsd === null) return "—";
      return formatValue(t.pnlUsd);
    }
    if (t.r === null) return "—";
    return formatValue(t.r);
  };

  const valueColor = (v: number) =>
    v > 0 ? "profit" : v < 0 ? "loss" : "muted";

  const handlePrev = () => {
    if (view === "month") {
      const d = new Date(currentYear, currentMonth - 1, 1);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    } else {
      setCurrentYear((y) => y - 1);
    }
  };

  const handleNext = () => {
    if (view === "month") {
      const d = new Date(currentYear, currentMonth + 1, 1);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    } else {
      setCurrentYear((y) => y + 1);
    }
  };

  const tradeCount = useMemo(() => {
    let n = 0;
    dayMap.forEach((list) => {
      n += list.length;
    });
    return n;
  }, [dayMap]);

  if (!mounted) {
    return (
      <Box minH="400px" color="muted" fontSize="13px">
        Chargement du calendrier...
      </Box>
    );
  }

  return (
    <Box>
      <Flex
        justify="space-between"
        align="center"
        gap="16px"
        mb="18px"
        flexWrap="wrap"
      >
        <Select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          w="fit-content"
          minW="160px"
          bg="surface"
          borderColor="border"
          fontSize="13px"
        >
          <option value="dollar">Dollar Profit</option>
          <option value="r">R:R</option>
        </Select>

        <Text fontSize="12px" color="muted">
          {tradeCount} trade{tradeCount !== 1 ? "s" : ""} daté
          {tradeCount !== 1 ? "s" : ""}
          {tradeCount === 0
            ? " · Renseigne PnL ($) et/ou Result (R) + une date sur tes trades."
            : ""}
        </Text>
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        mb="20px"
        flexWrap="wrap"
        gap="12px"
      >
        <Flex align="center" gap="12px">
          <Button variant="icon" size="sm" onClick={handlePrev}>
            {"<"}
          </Button>
          <Text
            fontSize="18px"
            fontWeight={550}
            minW="140px"
            textAlign="center"
          >
            {view === "month"
              ? `${monthLabels[currentMonth]} ${currentYear}`
              : `${currentYear}`}
          </Text>
          <Button variant="icon" size="sm" onClick={handleNext}>
            {">"}
          </Button>
        </Flex>

        <Flex
          gap="6px"
          border="1px solid"
          borderColor="border"
          borderRadius="6px"
          p="4px"
        >
          <Button
            size="sm"
            variant={view === "month" ? "primary" : "secondary"}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={view === "year" ? "primary" : "secondary"}
            onClick={() => setView("year")}
          >
            Year
          </Button>
        </Flex>
      </Flex>

      {view === "month" ? (
        <>
          <Grid templateColumns="repeat(7, 1fr)" gap="6px" mb="8px">
            {dayLabels.map((d) => (
              <Text
                key={d}
                textAlign="center"
                fontSize="11px"
                color="muted"
                fontWeight={500}
              >
                {d}
              </Text>
            ))}
          </Grid>

          <Grid templateColumns="repeat(7, 1fr)" gap="6px">
            {monthDays.map((d, i) => {
              const hasData = d.count > 0;
              const dayValue = displayValue(d.totalR, d.totalPnl);
              const bg = hasData
                ? dayValue >= 0
                  ? "rgba(99,199,154,0.12)"
                  : "rgba(228,124,130,0.12)"
                : "surface";
              const border = hasData
                ? dayValue >= 0
                  ? "rgba(99,199,154,0.35)"
                  : "rgba(228,124,130,0.35)"
                : "border";

              return (
                <Box
                  key={i}
                  minH="108px"
                  p="8px"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor={border}
                  bg={bg}
                  opacity={d.inMonth ? 1 : 0.35}
                >
                  <Text
                    fontSize="12px"
                    color={d.inMonth ? "text" : "muted"}
                    textAlign="right"
                    mb="6px"
                    fontWeight={500}
                  >
                    {d.date.getDate()}
                  </Text>
                  {hasData && (
                    <>
                      <Text fontSize="10px" color="muted" mb="4px">
                        {d.count} position{d.count > 1 ? "s" : ""}
                      </Text>
                      <Text
                        fontSize="13px"
                        fontWeight={650}
                        color={valueColor(dayValue)}
                        mb="6px"
                        lineHeight="1.2"
                      >
                        {formatValue(dayValue)}
                      </Text>
                      <Box>
                        {d.trades.slice(0, 3).map((t) => {
                          const tv =
                            unit === "dollar" ? (t.pnlUsd ?? 0) : (t.r ?? 0);
                          return (
                            <Flex
                              key={t.id}
                              justify="space-between"
                              gap="4px"
                              mb="2px"
                            >
                              <Text
                                fontSize="9px"
                                color="muted"
                                noOfLines={1}
                                maxW="55%"
                              >
                                {t.symbol}
                              </Text>
                              <Text
                                fontSize="9px"
                                color={valueColor(tv)}
                                fontWeight={600}
                                whiteSpace="nowrap"
                              >
                                {formatTradeValue(t)}
                              </Text>
                            </Flex>
                          );
                        })}
                        {d.trades.length > 3 && (
                          <Text fontSize="9px" color="muted">
                            +{d.trades.length - 3} more
                          </Text>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              );
            })}
          </Grid>
        </>
      ) : (
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap="12px"
        >
          {yearMonths.map((m) => {
            const hasData = m.count > 0;
            const monthValue = displayValue(m.totalR, m.totalPnl);
            const bg = hasData
              ? monthValue >= 0
                ? "rgba(99,199,154,0.12)"
                : "rgba(228,124,130,0.12)"
              : "surface";

            return (
              <Box
                key={m.month}
                p="16px"
                borderRadius="10px"
                border="1px solid"
                borderColor="border"
                bg={bg}
                cursor="pointer"
                onClick={() => {
                  setCurrentMonth(m.month);
                  setView("month");
                }}
                _hover={{ borderColor: "borderHover" }}
              >
                <Text fontSize="14px" fontWeight={550} mb="10px">
                  {monthLabels[m.month]}
                </Text>
                {hasData ? (
                  <>
                    <Text fontSize="12px" color="muted" mb="4px">
                      {m.count} position{m.count > 1 ? "s" : ""}
                    </Text>
                    <Text
                      fontSize="16px"
                      fontWeight={650}
                      color={valueColor(monthValue)}
                    >
                      {formatValue(monthValue)}
                    </Text>
                  </>
                ) : (
                  <Text fontSize="12px" color="muted">
                    Aucune position
                  </Text>
                )}
              </Box>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
