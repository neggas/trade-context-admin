"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Select,
  Text,
} from "@chakra-ui/react";
import type { ArticleListItem } from "types";

type Unit = "dollar" | "r" | "percent";
type BalanceMode = "initial" | "current";
type View = "month" | "year";

type DayData = {
  date: Date;
  inMonth: boolean;
  count: number;
  r: number;
  value: number;
  balance: number;
};

type MonthData = {
  month: number;
  year: number;
  count: number;
  r: number;
  value: number;
};

const LS_KEYS = {
  balance: "tj-admin-calendar-balance",
  risk: "tj-admin-calendar-risk",
  unit: "tj-admin-calendar-unit",
  mode: "tj-admin-calendar-mode",
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
const fromISO = (iso: string) => new Date(iso);

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
  const [balanceMode, setBalanceMode] = useState<BalanceMode>("initial");
  const [initialBalance, setInitialBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);

  useEffect(() => {
    setMounted(true);
    setView((localStorage.getItem(LS_KEYS.view) as View) || "month");
    setUnit((localStorage.getItem(LS_KEYS.unit) as Unit) || "dollar");
    setBalanceMode(
      (localStorage.getItem(LS_KEYS.mode) as BalanceMode) || "initial"
    );
    setInitialBalance(Number(localStorage.getItem(LS_KEYS.balance) || 10000));
    setRiskPercent(Number(localStorage.getItem(LS_KEYS.risk) || 1));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_KEYS.view, view);
    localStorage.setItem(LS_KEYS.unit, unit);
    localStorage.setItem(LS_KEYS.mode, balanceMode);
    localStorage.setItem(LS_KEYS.balance, String(initialBalance));
    localStorage.setItem(LS_KEYS.risk, String(riskPercent));
  }, [mounted, view, unit, balanceMode, initialBalance, riskPercent]);

  const trades = useMemo(
    () =>
      articles
        .filter(
          (a) =>
            a.type === "live" && a.closedAt && a.resultR !== null
        )
        .map((a) => ({
          day: toDateKey(fromISO(a.closedAt!)),
          r: a.resultR!,
        }))
        .sort((a, b) => a.day.localeCompare(b.day)),
    [articles]
  );

  const dayMap = useMemo(() => {
    const map = new Map<string, { count: number; r: number }>();
    for (const t of trades) {
      const existing = map.get(t.day) || { count: 0, r: 0 };
      existing.count += 1;
      existing.r += t.r;
      map.set(t.day, existing);
    }
    return map;
  }, [trades]);

  const valueMap = useMemo(() => {
    const sorted = Array.from(dayMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const result = new Map<string, { value: number; balance: number }>();
    let balance = initialBalance;

    for (const [day, data] of sorted) {
      const riskDollars =
        balanceMode === "initial"
          ? initialBalance * (riskPercent / 100)
          : balance * (riskPercent / 100);

      let value = 0;
      if (unit === "r") {
        value = data.r;
      } else if (unit === "dollar") {
        value = data.r * riskDollars;
      } else {
        value = data.r * riskPercent;
      }

      result.set(day, { value, balance });
      if (balanceMode === "current") {
        balance += value;
      }
    }

    return result;
  }, [dayMap, initialBalance, riskPercent, balanceMode, unit]);

  const monthDays = useMemo<DayData[]>(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const offset = (startOfMonth.getDay() + 6) % 7;
    const start = new Date(currentYear, currentMonth, 1 - offset);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: DayData[] = [];
    let balance = initialBalance;

    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toDateKey(d);
      const inMonth =
        d.getFullYear() === currentYear && d.getMonth() === currentMonth;

      if (!inMonth) {
        const prev = valueMap.get(key);
        if (prev && balanceMode === "current") {
          balance = prev.balance + prev.value;
        }
        days.push({
          date: d,
          inMonth: false,
          count: 0,
          r: 0,
          value: 0,
          balance,
        });
        continue;
      }

      const data = dayMap.get(key) || { count: 0, r: 0 };
      const computed = valueMap.get(key);

      if (computed) {
        balance = balanceMode === "current" ? computed.balance : initialBalance;
        days.push({
          date: d,
          inMonth: true,
          count: data.count,
          r: data.r,
          value: computed.value,
          balance: computed.balance,
        });
        if (balanceMode === "current") {
          balance = computed.balance + computed.value;
        }
      } else {
        if (balanceMode === "current") {
          const last = days[days.length - 1];
          if (last) balance = last.balance + last.value;
        }
        days.push({
          date: d,
          inMonth: true,
          count: 0,
          r: 0,
          value: 0,
          balance,
        });
      }
    }

    return days;
  }, [currentYear, currentMonth, dayMap, valueMap, initialBalance, balanceMode]);

  const yearMonths = useMemo<MonthData[]>(() => {
    const months: MonthData[] = [];

    for (let m = 0; m < 12; m++) {
      const start = new Date(currentYear, m, 1);
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      let count = 0;
      let r = 0;
      let dollarValue = 0;

      for (let d = 0; d < daysInMonth; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + d);
        const key = toDateKey(day);
        const data = dayMap.get(key);
        const computed = valueMap.get(key);
        if (data) {
          count += data.count;
          r += data.r;
        }
        if (computed) {
          dollarValue += computed.value;
        }
      }

      const value =
        unit === "r"
          ? r
          : unit === "dollar"
            ? dollarValue
            : r * riskPercent;

      months.push({ month: m, year: currentYear, count, r, value });
    }

    return months;
  }, [currentYear, dayMap, valueMap, riskPercent, unit]);

  const formatValue = (v: number) => {
    if (v === 0) return "0.00";
    const sign = v > 0 ? "+" : "";
    if (unit === "dollar") return `${sign}${v.toFixed(2)} $US`;
    if (unit === "r") return `${sign}${v.toFixed(2)}R`;
    return `${sign}${v.toFixed(2)}%`;
  };

  const valueColor = (v: number) =>
    v === 0 ? "text" : v > 0 ? "profit" : "loss";

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

  if (!mounted) {
    return (
      <Box minH="600px" color="muted">
        Chargement du calendrier...
      </Box>
    );
  }

  return (
    <Box>
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="16px"
        mb="24px"
      >
        <Select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          w="fit-content"
          bg="surface"
          borderColor="border"
          fontSize="13px"
        >
          <option value="dollar">Dollar Profit</option>
          <option value="r">R:R</option>
          <option value="percent">Pourcentage</option>
        </Select>

        <Flex
          align="center"
          gap="12px"
          flexWrap="wrap"
          direction={{ base: "column", sm: "row" }}
        >
          <Flex align="center" gap="8px">
            <Input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(Number(e.target.value))}
              w="110px"
              bg="surface"
              borderColor="border"
              fontSize="13px"
            />
            <Text fontSize="13px" color="muted">
              $
            </Text>
            <Input
              type="number"
              step={0.1}
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              w="70px"
              bg="surface"
              borderColor="border"
              fontSize="13px"
            />
            <Text fontSize="13px" color="muted">
              %
            </Text>
          </Flex>

          <Flex
            gap="8px"
            border="1px solid"
            borderColor="border"
            borderRadius="6px"
            p="4px"
          >
            <Button
              size="sm"
              variant={balanceMode === "initial" ? "primary" : "ghost"}
              onClick={() => setBalanceMode("initial")}
            >
              Solde initial
            </Button>
            <Button
              size="sm"
              variant={balanceMode === "current" ? "primary" : "ghost"}
              onClick={() => setBalanceMode("current")}
            >
              Solde actuel
            </Button>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        mb="24px"
        flexWrap="wrap"
        gap="12px"
      >
        <Flex align="center" gap="12px">
          <Button variant="icon" size="sm" onClick={handlePrev}>
            {"<"}
          </Button>
          <Text fontSize="18px" fontWeight={550} minW="140px" textAlign="center">
            {view === "month"
              ? `${monthLabels[currentMonth]} ${currentYear}`
              : `${currentYear}`}
          </Text>
          <Button variant="icon" size="sm" onClick={handleNext}>
            {">"}
          </Button>
        </Flex>

        <Flex
          gap="8px"
          border="1px solid"
          borderColor="border"
          borderRadius="6px"
          p="4px"
        >
          <Button
            size="sm"
            variant={view === "month" ? "primary" : "ghost"}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={view === "year" ? "primary" : "ghost"}
            onClick={() => setView("year")}
          >
            Year
          </Button>
        </Flex>
      </Flex>

      {view === "month" ? (
        <>
          <Grid templateColumns="repeat(7, 1fr)" gap="6px" mb="10px">
            {dayLabels.map((d) => (
              <Text
                key={d}
                textAlign="center"
                fontSize="12px"
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
              const bg = hasData
                ? d.value >= 0
                  ? "rgba(99,199,154,0.12)"
                  : "rgba(228,124,130,0.12)"
                : "surface";
              const border = hasData
                ? d.value >= 0
                  ? "rgba(99,199,154,0.25)"
                  : "rgba(228,124,130,0.25)"
                : "border";

              return (
                <Box
                  key={i}
                  minH="90px"
                  p="8px"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor={border}
                  bg={bg}
                  opacity={d.inMonth ? 1 : 0.35}
                >
                  <Text
                    fontSize="13px"
                    color={d.inMonth ? "text" : "muted"}
                    textAlign="right"
                    mb="6px"
                  >
                    {d.date.getDate()}
                  </Text>
                  {hasData && (
                    <>
                      <Text fontSize="10px" color="muted" mb="2px">
                        {d.count} trade{d.count > 1 ? "s" : ""}
                      </Text>
                      <Text
                        fontSize="13px"
                        fontWeight={600}
                        color={valueColor(d.value)}
                      >
                        {formatValue(d.value)}
                      </Text>
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
            const bg = hasData
              ? m.value >= 0
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
              >
                <Text fontSize="14px" fontWeight={550} mb="10px">
                  {monthLabels[m.month]}
                </Text>
                {hasData ? (
                  <>
                    <Text fontSize="12px" color="muted" mb="4px">
                      {m.count} trade{m.count > 1 ? "s" : ""}
                    </Text>
                    <Text
                      fontSize="16px"
                      fontWeight={600}
                      color={valueColor(m.value)}
                    >
                      {formatValue(m.value)}
                    </Text>
                  </>
                ) : (
                  <Text fontSize="12px" color="muted">
                    Aucun trade
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
