import React, { useState, useMemo } from 'react';
import { 
  Clock, Calendar, CalendarDays, TrendingUp, DollarSign, 
  Banknote, CreditCard, Flame, ChevronLeft, ChevronRight, 
  ArrowUpRight, Users, Sparkles, Filter, CheckCircle2,
  Percent, BarChart2, Award
} from 'lucide-react';
import { Sale, Barber } from '../types';

interface SalesAnalyticsChartProps {
  sales: Sale[];
  barbers: Barber[];
}

type TimeframeMode = 'dia' | 'semana' | 'mes' | 'ano';

interface ParsedSale {
  sale: Sale;
  dateObj: Date;
  dateStr: string; // YYYY-MM-DD
  year: number;
  month: number; // 0-11
  dayOfMonth: number; // 1-31
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  hour: number; // 0-23
  isCash: boolean;
}

export const SalesAnalyticsChart: React.FC<SalesAnalyticsChartProps> = ({ sales, barbers }) => {
  const [timeframe, setTimeframe] = useState<TimeframeMode>('dia');
  
  // Selected reference date (Defaults to today 2026-11-01 or system date)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    // Look for latest sale date or use today
    if (sales.length > 0) {
      const dates = sales
        .map(s => s.date.slice(0, 10))
        .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort();
      if (dates.length > 0) {
        return dates[dates.length - 1];
      }
    }
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Parse all sales into structured date metadata
  const parsedSales = useMemo<ParsedSale[]>(() => {
    return sales.map(s => {
      let d = new Date(s.date.replace(' ', 'T'));
      if (isNaN(d.getTime())) {
        // Fallback for simple YYYY-MM-DD
        const parts = s.date.split(/[- :T]/);
        if (parts.length >= 3) {
          d = new Date(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[2], 10),
            parseInt(parts[3] || '12', 10),
            parseInt(parts[4] || '0', 10)
          );
        } else {
          d = new Date();
        }
      }

      const year = d.getFullYear();
      const month = d.getMonth();
      const dayOfMonth = d.getDate();
      const dayOfWeek = d.getDay();
      const hour = d.getHours();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;
      const isCash = s.paymentMethod === 'efectivo';

      return {
        sale: s,
        dateObj: d,
        dateStr,
        year,
        month,
        dayOfMonth,
        dayOfWeek,
        hour,
        isCash
      };
    });
  }, [sales]);

  // Selected date object
  const selectedDateObj = useMemo(() => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  }, [selectedDateStr]);

  // Navigation handlers
  const handleShiftDay = (days: number) => {
    const cur = new Date(selectedDateObj);
    cur.setDate(cur.getDate() + days);
    const newStr = cur.toISOString().split('T')[0];
    setSelectedDateStr(newStr);
  };

  const handleShiftWeek = (weeks: number) => {
    handleShiftDay(weeks * 7);
  };

  const handleShiftMonth = (months: number) => {
    const cur = new Date(selectedDateObj);
    cur.setMonth(cur.getMonth() + months);
    const newStr = cur.toISOString().split('T')[0];
    setSelectedDateStr(newStr);
  };

  const handleShiftYear = (years: number) => {
    const cur = new Date(selectedDateObj);
    cur.setFullYear(cur.getFullYear() + years);
    const newStr = cur.toISOString().split('T')[0];
    setSelectedDateStr(newStr);
  };

  const handleJumpToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDateStr(today);
  };

  // =========================================================================
  // 1. DÍA: Ventas por horas del día con detección de hora pico (mayor flujo)
  // =========================================================================
  const dayData = useMemo(() => {
    // Target hours: 8am to 9pm (21:00)
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    
    // Filter sales for the selected date
    const daySales = parsedSales.filter(p => p.dateStr === selectedDateStr);

    const hourSlots = hours.map(h => {
      const slotSales = daySales.filter(p => p.hour === h);
      const total = slotSales.reduce((sum, p) => sum + p.sale.total, 0);
      const cash = slotSales.filter(p => p.isCash).reduce((sum, p) => sum + p.sale.total, 0);
      const transfer = total - cash;
      const count = slotSales.length;

      // Group barbers in this hour
      const barberCounts: Record<string, number> = {};
      slotSales.forEach(p => {
        barberCounts[p.sale.barberName] = (barberCounts[p.sale.barberName] || 0) + 1;
      });
      const topBarber = Object.entries(barberCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

      const hourLabel = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
      const hourCode = `${String(h).padStart(2, '0')}:00`;

      return {
        hour: h,
        label: hourLabel,
        code: hourCode,
        total,
        cash,
        transfer,
        count,
        topBarber,
        sales: slotSales.map(p => p.sale)
      };
    });

    const totalDaySales = daySales.reduce((sum, p) => sum + p.sale.total, 0);
    const totalDayCash = daySales.filter(p => p.isCash).reduce((sum, p) => sum + p.sale.total, 0);
    const totalDayTransfer = totalDaySales - totalDayCash;
    const totalDayCount = daySales.length;
    const cashPercentage = totalDaySales > 0 ? Math.round((totalDayCash / totalDaySales) * 100) : 0;

    // Determine peak hours (horas de mayor flujo por número de servicios y monto)
    const maxHourTotal = Math.max(0, ...hourSlots.map(s => s.total));
    const maxHourCount = Math.max(0, ...hourSlots.map(s => s.count));
    const peakSlots = hourSlots.filter(s => 
      s.total > 0 && (s.total === maxHourTotal || (maxHourCount > 1 && s.count === maxHourCount))
    );

    return {
      hourSlots,
      totalDaySales,
      totalDayCash,
      totalDayTransfer,
      totalDayCount,
      cashPercentage,
      maxHourTotal,
      peakSlots
    };
  }, [parsedSales, selectedDateStr]);

  // =========================================================================
  // 2. SEMANA: Días de la semana (Lunes a Domingo) con ventas en efectivo
  // =========================================================================
  const weekData = useMemo(() => {
    // Calculate Monday of the current selected week
    const target = new Date(selectedDateObj);
    const day = target.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(target);
    monday.setDate(target.getDate() + diffToMonday);

    const weekDaysNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const weekShortNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const days = weekDaysNames.map((name, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      const shortName = weekShortNames[idx];
      const formattedDayNum = d.getDate();

      const daySales = parsedSales.filter(p => p.dateStr === dateStr);
      const total = daySales.reduce((sum, p) => sum + p.sale.total, 0);
      const cash = daySales.filter(p => p.isCash).reduce((sum, p) => sum + p.sale.total, 0);
      const transfer = total - cash;
      const count = daySales.length;
      const cashPercent = total > 0 ? Math.round((cash / total) * 100) : 0;

      return {
        name,
        shortName,
        dayNum: formattedDayNum,
        dateStr,
        total,
        cash,
        transfer,
        count,
        cashPercent,
        sales: daySales.map(p => p.sale),
        isToday: dateStr === new Date().toISOString().split('T')[0]
      };
    });

    const totalWeekSales = days.reduce((sum, d) => sum + d.total, 0);
    const totalWeekCash = days.reduce((sum, d) => sum + d.cash, 0);
    const totalWeekTransfer = totalWeekSales - totalWeekCash;
    const totalWeekCount = days.reduce((sum, d) => sum + d.count, 0);
    const weekCashPercentage = totalWeekSales > 0 ? Math.round((totalWeekCash / totalWeekSales) * 100) : 0;
    const maxDayTotal = Math.max(0, ...days.map(d => d.total));
    const peakDay = days.find(d => d.total > 0 && d.total === maxDayTotal);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const dateRangeLabel = `${monday.getDate()} ${monday.toLocaleString('es-CO', { month: 'short' })} - ${sunday.getDate()} ${sunday.toLocaleString('es-CO', { month: 'short', year: 'numeric' })}`;

    return {
      days,
      mondayStr: monday.toISOString().split('T')[0],
      sundayStr: sunday.toISOString().split('T')[0],
      dateRangeLabel,
      totalWeekSales,
      totalWeekCash,
      totalWeekTransfer,
      totalWeekCount,
      weekCashPercentage,
      maxDayTotal,
      peakDay
    };
  }, [parsedSales, selectedDateObj]);

  // =========================================================================
  // 3. MES: Días del mes seleccionado con ventas en efectivo
  // =========================================================================
  const monthData = useMemo(() => {
    const year = selectedDateObj.getFullYear();
    const month = selectedDateObj.getMonth();
    const monthName = selectedDateObj.toLocaleString('es-CO', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Number of days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const daySales = parsedSales.filter(p => p.dateStr === dateStr);
      const total = daySales.reduce((sum, p) => sum + p.sale.total, 0);
      const cash = daySales.filter(p => p.isCash).reduce((sum, p) => sum + p.sale.total, 0);
      const transfer = total - cash;
      const count = daySales.length;
      const cashPercent = total > 0 ? Math.round((cash / total) * 100) : 0;

      days.push({
        dayNum,
        dateStr,
        total,
        cash,
        transfer,
        count,
        cashPercent,
        sales: daySales.map(p => p.sale)
      });
    }

    const totalMonthSales = days.reduce((sum, d) => sum + d.total, 0);
    const totalMonthCash = days.reduce((sum, d) => sum + d.cash, 0);
    const totalMonthTransfer = totalMonthSales - totalMonthCash;
    const totalMonthCount = days.reduce((sum, d) => sum + d.count, 0);
    const monthCashPercentage = totalMonthSales > 0 ? Math.round((totalMonthCash / totalMonthSales) * 100) : 0;
    const maxDayTotal = Math.max(0, ...days.map(d => d.total));
    const peakDay = days.find(d => d.total > 0 && d.total === maxDayTotal);

    return {
      year,
      month,
      monthName: capitalizedMonth,
      days,
      totalMonthSales,
      totalMonthCash,
      totalMonthTransfer,
      totalMonthCount,
      monthCashPercentage,
      maxDayTotal,
      peakDay
    };
  }, [parsedSales, selectedDateObj]);

  // =========================================================================
  // 4. AÑO: 12 Meses del año seleccionado con ventas en efectivo
  // =========================================================================
  const yearData = useMemo(() => {
    const year = selectedDateObj.getFullYear();
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthShortNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const months = monthNames.map((name, idx) => {
      const monthSales = parsedSales.filter(p => p.year === year && p.month === idx);
      const total = monthSales.reduce((sum, p) => sum + p.sale.total, 0);
      const cash = monthSales.filter(p => p.isCash).reduce((sum, p) => sum + p.sale.total, 0);
      const transfer = total - cash;
      const count = monthSales.length;
      const cashPercent = total > 0 ? Math.round((cash / total) * 100) : 0;

      return {
        monthIndex: idx,
        name,
        shortName: monthShortNames[idx],
        total,
        cash,
        transfer,
        count,
        cashPercent,
        sales: monthSales.map(p => p.sale)
      };
    });

    const totalYearSales = months.reduce((sum, m) => sum + m.total, 0);
    const totalYearCash = months.reduce((sum, m) => sum + m.cash, 0);
    const totalYearTransfer = totalYearSales - totalYearCash;
    const totalYearCount = months.reduce((sum, m) => sum + m.count, 0);
    const yearCashPercentage = totalYearSales > 0 ? Math.round((totalYearCash / totalYearSales) * 100) : 0;
    const maxMonthTotal = Math.max(0, ...months.map(m => m.total));
    const peakMonth = months.find(m => m.total > 0 && m.total === maxMonthTotal);

    return {
      year,
      months,
      totalYearSales,
      totalYearCash,
      totalYearTransfer,
      totalYearCount,
      yearCashPercentage,
      maxMonthTotal,
      peakMonth
    };
  }, [parsedSales, selectedDateObj]);

  // Format currency in Colombian Pesos
  const formatCOP = (val: number) => `$${val.toLocaleString('es-CO')}`;

  return (
    <div className="liquid-glass-card rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-white/15 shadow-xl space-y-5">
      {/* Header & Main Timeframe Switcher Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center font-bold shadow-inner">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                Análisis Gráfico de Ventas y Flujo
              </h3>
              <span className="text-[10px] bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Horas & Efectivo</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Visualiza en tiempo real las horas de mayor flujo, días pico y el balance exacto de dinero en efectivo vs transferencias.
            </p>
          </div>
        </div>

        {/* Timeframe Buttons: Día / Semana / Mes / Año */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100/90 dark:bg-[#021f35] border border-slate-200 dark:border-white/15 shadow-inner self-start md:self-auto">
          <button
            type="button"
            onClick={() => { setTimeframe('dia'); setHoveredIndex(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              timeframe === 'dia'
                ? 'bg-[#c5a059] text-black shadow-md font-extrabold scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Día (Horas)</span>
          </button>

          <button
            type="button"
            onClick={() => { setTimeframe('semana'); setHoveredIndex(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              timeframe === 'semana'
                ? 'bg-[#c5a059] text-black shadow-md font-extrabold scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Semana (Efectivo)</span>
          </button>

          <button
            type="button"
            onClick={() => { setTimeframe('mes'); setHoveredIndex(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              timeframe === 'mes'
                ? 'bg-[#c5a059] text-black shadow-md font-extrabold scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Mes</span>
          </button>

          <button
            type="button"
            onClick={() => { setTimeframe('ano'); setHoveredIndex(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              timeframe === 'ano'
                ? 'bg-[#c5a059] text-black shadow-md font-extrabold scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Año</span>
          </button>
        </div>
      </div>

      {/* Period Navigator & Quick Date Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#02253f]/60 p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-[#021f35] rounded-xl border border-slate-200 dark:border-white/15 p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (timeframe === 'dia') handleShiftDay(-1);
                if (timeframe === 'semana') handleShiftWeek(-1);
                if (timeframe === 'mes') handleShiftMonth(-1);
                if (timeframe === 'ano') handleShiftYear(-1);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              title="Período anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 font-bold text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap">
              {timeframe === 'dia' && (
                <>
                  {selectedDateObj.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </>
              )}
              {timeframe === 'semana' && (
                <>
                  Semana: {weekData.dateRangeLabel}
                </>
              )}
              {timeframe === 'mes' && (
                <>
                  {monthData.monthName} {monthData.year}
                </>
              )}
              {timeframe === 'ano' && (
                <>
                  Año {yearData.year}
                </>
              )}
            </span>

            <button
              type="button"
              onClick={() => {
                if (timeframe === 'dia') handleShiftDay(1);
                if (timeframe === 'semana') handleShiftWeek(1);
                if (timeframe === 'mes') handleShiftMonth(1);
                if (timeframe === 'ano') handleShiftYear(1);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              title="Período siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#021f35] hover:bg-[#c5a059]/20 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer shadow-sm text-xs"
          >
            Hoy
          </button>
        </div>

        {/* Calendar Picker input */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Seleccionar fecha:
          </label>
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
            className="rounded-xl bg-white dark:bg-[#021f35] border border-slate-200 dark:border-white/20 px-2.5 py-1.5 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:outline-none focus:border-[#c5a059] shadow-sm"
          />
        </div>
      </div>

      {/* Visual Chart Metrics Strip for Selected Timeframe */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Facturado */}
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-[#02223a] border border-slate-200/80 dark:border-white/10 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
            Total en este Período
          </span>
          <div className="font-display font-extrabold text-base sm:text-xl text-[#c5a059]">
            {timeframe === 'dia' && formatCOP(dayData.totalDaySales)}
            {timeframe === 'semana' && formatCOP(weekData.totalWeekSales)}
            {timeframe === 'mes' && formatCOP(monthData.totalMonthSales)}
            {timeframe === 'ano' && formatCOP(yearData.totalYearSales)}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {timeframe === 'dia' && `${dayData.totalDayCount} servicios atendidos`}
            {timeframe === 'semana' && `${weekData.totalWeekCount} servicios atendidos`}
            {timeframe === 'mes' && `${monthData.totalMonthCount} servicios atendidos`}
            {timeframe === 'ano' && `${yearData.totalYearCount} servicios atendidos`}
          </span>
        </div>

        {/* Ventas en Efectivo */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/25 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
              Ventas en Efectivo
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              {timeframe === 'dia' && `${dayData.cashPercentage}%`}
              {timeframe === 'semana' && `${weekData.weekCashPercentage}%`}
              {timeframe === 'mes' && `${monthData.monthCashPercentage}%`}
              {timeframe === 'ano' && `${yearData.yearCashPercentage}%`}
            </span>
          </div>
          <div className="font-display font-extrabold text-base sm:text-xl text-emerald-600 dark:text-emerald-400">
            {timeframe === 'dia' && formatCOP(dayData.totalDayCash)}
            {timeframe === 'semana' && formatCOP(weekData.totalWeekCash)}
            {timeframe === 'mes' && formatCOP(monthData.totalMonthCash)}
            {timeframe === 'ano' && formatCOP(yearData.totalYearCash)}
          </div>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 flex items-center gap-1">
            <Banknote className="w-3 h-3" /> Dinero en caja física
          </span>
        </div>

        {/* Transferencias */}
        <div className="p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-950/20 border border-blue-500/25 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-0.5">
              Transferencias / Bancos
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
              {timeframe === 'dia' && `${100 - dayData.cashPercentage}%`}
              {timeframe === 'semana' && `${100 - weekData.weekCashPercentage}%`}
              {timeframe === 'mes' && `${100 - monthData.monthCashPercentage}%`}
              {timeframe === 'ano' && `${100 - yearData.yearCashPercentage}%`}
            </span>
          </div>
          <div className="font-display font-extrabold text-base sm:text-xl text-blue-600 dark:text-blue-400">
            {timeframe === 'dia' && formatCOP(dayData.totalDayTransfer)}
            {timeframe === 'semana' && formatCOP(weekData.totalWeekTransfer)}
            {timeframe === 'mes' && formatCOP(monthData.totalMonthTransfer)}
            {timeframe === 'ano' && formatCOP(yearData.totalYearTransfer)}
          </div>
          <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80 flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Nequi / Bancolombia / Daviplata
          </span>
        </div>

        {/* Horas o Días de Mayor Flujo (Peak Indicator) */}
        <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-0.5">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            {timeframe === 'dia' && 'Mayor Flujo del Día'}
            {timeframe === 'semana' && 'Día de Mayor Venta'}
            {timeframe === 'mes' && 'Día Récord del Mes'}
            {timeframe === 'ano' && 'Mes Más Productivo'}
          </span>
          <div className="font-display font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
            {timeframe === 'dia' && (
              dayData.peakSlots.length > 0 
                ? dayData.peakSlots.map(p => p.label).join(', ')
                : 'Sin registros aún'
            )}
            {timeframe === 'semana' && (
              weekData.peakDay ? `${weekData.peakDay.name} (${formatCOP(weekData.peakDay.total)})` : 'Sin registros'
            )}
            {timeframe === 'mes' && (
              monthData.peakDay ? `Día ${monthData.peakDay.dayNum} (${formatCOP(monthData.peakDay.total)})` : 'Sin registros'
            )}
            {timeframe === 'ano' && (
              yearData.peakMonth ? `${yearData.peakMonth.name} (${formatCOP(yearData.peakMonth.total)})` : 'Sin registros'
            )}
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 block truncate">
            {timeframe === 'dia' && (dayData.peakSlots[0] ? `${dayData.peakSlots[0].count} clientes atendidos` : 'Esperando ventas')}
            {timeframe === 'semana' && (weekData.peakDay ? `${weekData.peakDay.cashPercent}% en efectivo` : 'Esperando ventas')}
            {timeframe === 'mes' && (monthData.peakDay ? `${monthData.peakDay.cashPercent}% en efectivo` : 'Esperando ventas')}
            {timeframe === 'ano' && (yearData.peakMonth ? `${yearData.peakMonth.cashPercent}% en efectivo` : 'Esperando ventas')}
          </span>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 dark:bg-[#021f35]/50 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block shadow-sm"></span>
            <span className="font-bold text-slate-700 dark:text-slate-200">Ventas en Efectivo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block shadow-sm"></span>
            <span className="font-bold text-slate-700 dark:text-slate-200">Transferencias Digitales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-black font-extrabold">🔥</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">Pico de Mayor Flujo</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
          Haz clic o pasa el cursor sobre cada barra para ver el desglose detallado
        </span>
      </div>

      {/* ================================================================= */}
      {/* 1. VISTA GRÁFICA DEL DÍA: HORAS CON MAYOR FLUJO                    */}
      {/* ================================================================= */}
      {timeframe === 'dia' && (
        <div className="space-y-4">
          <div className="bg-slate-100/50 dark:bg-[#011b2e] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Flujo de Clientes por Hora (8:00 AM - 9:00 PM)</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Las barras con icono de llama <span className="text-amber-500 font-bold">🔥</span> destacan las horas de mayor afluencia y facturación del día.
                </p>
              </div>

              {dayData.maxHourTotal > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Pico máximo</span>
                  <span className="font-mono font-bold text-xs text-amber-500">{formatCOP(dayData.maxHourTotal)}</span>
                </div>
              )}
            </div>

            {/* Hourly Bars */}
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 sm:gap-2 items-end pt-8 pb-2 min-h-[220px]">
              {dayData.hourSlots.map((slot, index) => {
                const isPeak = slot.total > 0 && slot.total === dayData.maxHourTotal;
                const isHovered = hoveredIndex === index;
                const heightPercent = dayData.maxHourTotal > 0 ? Math.max(10, Math.round((slot.total / dayData.maxHourTotal) * 100)) : 10;
                const cashPercent = slot.total > 0 ? (slot.cash / slot.total) * 100 : 0;
                const transferPercent = 100 - cashPercent;

                return (
                  <div
                    key={slot.hour}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setHoveredIndex(isHovered ? null : index)}
                  >
                    {/* Peak badge floating above bar */}
                    {isPeak && (
                      <div className="absolute -top-7 animate-bounce flex flex-col items-center z-10">
                        <span className="text-[9px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-black px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-black" />
                          <span>Pico</span>
                        </span>
                      </div>
                    )}

                    {/* Bar Container */}
                    <div className="w-full flex flex-col justify-end h-40 sm:h-44 bg-slate-200/50 dark:bg-slate-800/40 rounded-xl overflow-hidden p-0.5 relative transition-all group-hover:scale-105 group-hover:shadow-md">
                      {slot.total > 0 ? (
                        <div 
                          className="w-full rounded-lg overflow-hidden flex flex-col justify-end transition-all duration-500 shadow-sm"
                          style={{ height: `${heightPercent}%` }}
                        >
                          {/* Transfer Segment (Blue) */}
                          {slot.transfer > 0 && (
                            <div 
                              className="w-full bg-blue-500 hover:bg-blue-400 transition-colors"
                              style={{ height: `${transferPercent}%` }}
                              title={`Transferencias: ${formatCOP(slot.transfer)}`}
                            />
                          )}
                          {/* Cash Segment (Emerald) */}
                          {slot.cash > 0 && (
                            <div 
                              className="w-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
                              style={{ height: `${cashPercent}%` }}
                              title={`Efectivo: ${formatCOP(slot.cash)}`}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-1 bg-slate-300 dark:bg-slate-700 rounded-full my-auto opacity-50" />
                      )}

                      {/* In-bar mini value label */}
                      {slot.total > 0 && (
                        <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-extrabold text-white drop-shadow-md select-none pointer-events-none">
                          {slot.count > 0 ? `${slot.count}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Hour label */}
                    <div className="text-center">
                      <span className={`text-[10px] sm:text-[11px] block font-bold transition-colors ${
                        isPeak 
                          ? 'text-amber-500 dark:text-amber-400 font-extrabold' 
                          : slot.total > 0 
                            ? 'text-slate-800 dark:text-slate-200' 
                            : 'text-slate-400 dark:text-slate-400'
                      }`}>
                        {slot.label.split(' ')[0]}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase block">
                        {slot.label.split(' ')[1]}
                      </span>
                    </div>

                    {/* Interactive Tooltip Card on Hover/Click */}
                    {isHovered && slot.total > 0 && (
                      <div className="absolute bottom-full mb-3 z-30 w-48 sm:w-56 p-3 rounded-2xl bg-slate-900/95 text-white border border-white/20 shadow-2xl backdrop-blur-md text-xs animate-in fade-in zoom-in-95 pointer-events-none">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                          <span className="font-bold text-[#c5a059] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.label} - {slot.hour + 1}:00
                          </span>
                          {isPeak && (
                            <span className="text-[9px] bg-amber-500 text-black font-extrabold px-1.5 py-0.2 rounded-full">
                              🔥 Pico de Flujo
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-300">Total Ingreso:</span>
                            <span className="font-bold text-white">{formatCOP(slot.total)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400">
                            <span>Efectivo:</span>
                            <span className="font-semibold">{formatCOP(slot.cash)}</span>
                          </div>
                          <div className="flex justify-between text-blue-400">
                            <span>Transferencia:</span>
                            <span className="font-semibold">{formatCOP(slot.transfer)}</span>
                          </div>
                          <div className="flex justify-between text-slate-300 pt-1 border-t border-white/10">
                            <span>Servicios / Cortes:</span>
                            <span className="font-bold text-white">{slot.count} clientes</span>
                          </div>
                          {slot.topBarber && (
                            <div className="flex justify-between text-amber-300 text-[10px]">
                              <span>Barbero más activo:</span>
                              <span className="font-bold">{slot.topBarber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time bands summary (Mañana, Tarde, Noche) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mañana */}
            {(() => {
              const mananaSales = dayData.hourSlots.filter(s => s.hour >= 8 && s.hour < 12);
              const totalM = mananaSales.reduce((sum, s) => sum + s.total, 0);
              const cashM = mananaSales.reduce((sum, s) => sum + s.cash, 0);
              const countM = mananaSales.reduce((sum, s) => sum + s.count, 0);
              return (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#02223a] border border-slate-200/80 dark:border-white/10 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mañana (8:00 AM - 12:00 PM)</span>
                    <span className="text-[10px] text-slate-500 font-medium">{countM} servicios</span>
                  </div>
                  <div className="font-display font-extrabold text-base text-[#c5a059]">{formatCOP(totalM)}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Efectivo: {formatCOP(cashM)}</span>
                    <span>Transf: {formatCOP(totalM - cashM)}</span>
                  </div>
                </div>
              );
            })()}

            {/* Tarde */}
            {(() => {
              const tardeSales = dayData.hourSlots.filter(s => s.hour >= 12 && s.hour < 17);
              const totalT = tardeSales.reduce((sum, s) => sum + s.total, 0);
              const cashT = tardeSales.reduce((sum, s) => sum + s.cash, 0);
              const countT = tardeSales.reduce((sum, s) => sum + s.count, 0);
              return (
                <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      Tarde (12:00 PM - 5:00 PM)
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">{countT} servicios</span>
                  </div>
                  <div className="font-display font-extrabold text-base text-[#c5a059]">{formatCOP(totalT)}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Efectivo: {formatCOP(cashT)}</span>
                    <span>Transf: {formatCOP(totalT - cashT)}</span>
                  </div>
                </div>
              );
            })()}

            {/* Noche */}
            {(() => {
              const nocheSales = dayData.hourSlots.filter(s => s.hour >= 17 && s.hour <= 21);
              const totalN = nocheSales.reduce((sum, s) => sum + s.total, 0);
              const cashN = nocheSales.reduce((sum, s) => sum + s.cash, 0);
              const countN = nocheSales.reduce((sum, s) => sum + s.count, 0);
              return (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#02223a] border border-slate-200/80 dark:border-white/10 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Noche (5:00 PM - 9:00 PM)</span>
                    <span className="text-[10px] text-slate-500 font-medium">{countN} servicios</span>
                  </div>
                  <div className="font-display font-extrabold text-base text-[#c5a059]">{formatCOP(totalN)}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Efectivo: {formatCOP(cashN)}</span>
                    <span>Transf: {formatCOP(totalN - cashN)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. VISTA GRÁFICA DE LA SEMANA: DÍAS Y VENTAS EN EFECTIVO         */}
      {/* ================================================================= */}
      {timeframe === 'semana' && (
        <div className="space-y-4">
          <div className="bg-slate-100/50 dark:bg-[#011b2e] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Ventas por Días de la Semana y Efectivo</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Desglose comparativo de cada día: Lunes a Domingo, mostrando la porción exacta cobrada en efectivo físico (<span className="text-emerald-500 font-bold">Verde</span>) frente a transferencias (<span className="text-blue-500 font-bold">Azul</span>).
                </p>
              </div>

              {weekData.maxDayTotal > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Día más alto</span>
                  <span className="font-mono font-bold text-xs text-amber-500">{formatCOP(weekData.maxDayTotal)}</span>
                </div>
              )}
            </div>

            {/* 7 Days Bars */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-8 pb-2 min-h-[220px]">
              {weekData.days.map((day, index) => {
                const isPeak = day.total > 0 && day.total === weekData.maxDayTotal;
                const isHovered = hoveredIndex === index;
                const heightPercent = weekData.maxDayTotal > 0 ? Math.max(12, Math.round((day.total / weekData.maxDayTotal) * 100)) : 12;
                const cashPercent = day.total > 0 ? (day.cash / day.total) * 100 : 0;
                const transferPercent = 100 - cashPercent;

                return (
                  <div
                    key={day.name}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      setSelectedDateStr(day.dateStr);
                      setTimeframe('dia');
                    }}
                    title="Haz clic para ver las horas de este día"
                  >
                    {/* Peak badge */}
                    {isPeak && (
                      <div className="absolute -top-7 animate-bounce flex flex-col items-center z-10">
                        <span className="text-[9px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-black" />
                          <span>Día Pico</span>
                        </span>
                      </div>
                    )}

                    {/* Bar Container */}
                    <div className={`w-full flex flex-col justify-end h-44 sm:h-48 rounded-2xl overflow-hidden p-1 relative transition-all group-hover:scale-105 group-hover:shadow-lg ${
                      day.isToday 
                        ? 'bg-amber-500/10 border-2 border-[#c5a059]' 
                        : 'bg-slate-200/50 dark:bg-slate-800/40 border border-transparent'
                    }`}>
                      {day.total > 0 ? (
                        <div 
                          className="w-full rounded-xl overflow-hidden flex flex-col justify-end transition-all duration-500 shadow-sm"
                          style={{ height: `${heightPercent}%` }}
                        >
                          {/* Transfer Segment (Blue) */}
                          {day.transfer > 0 && (
                            <div 
                              className="w-full bg-blue-500 hover:bg-blue-400 transition-colors"
                              style={{ height: `${transferPercent}%` }}
                            />
                          )}
                          {/* Cash Segment (Emerald) */}
                          {day.cash > 0 && (
                            <div 
                              className="w-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
                              style={{ height: `${cashPercent}%` }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-1 bg-slate-300 dark:bg-slate-700 rounded-full my-auto opacity-50" />
                      )}

                      {/* Cash percent badge inside column */}
                      {day.total > 0 && (
                        <span className="absolute bottom-2 inset-x-0 text-center text-[10px] font-extrabold text-white drop-shadow-md select-none pointer-events-none">
                          {day.cashPercent}% cash
                        </span>
                      )}
                    </div>

                    {/* Day label */}
                    <div className="text-center">
                      <span className={`text-xs font-bold block ${
                        isPeak 
                          ? 'text-amber-500 dark:text-amber-400 font-extrabold' 
                          : day.isToday
                            ? 'text-[#c5a059] font-extrabold'
                            : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {day.shortName}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                        {day.dayNum}
                      </span>
                    </div>

                    {/* Interactive Tooltip Card */}
                    {isHovered && day.total > 0 && (
                      <div className="absolute bottom-full mb-3 z-30 w-52 sm:w-60 p-3.5 rounded-2xl bg-slate-900/95 text-white border border-white/20 shadow-2xl backdrop-blur-md text-xs animate-in fade-in zoom-in-95 pointer-events-none">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                          <span className="font-bold text-[#c5a059]">
                            {day.name} {day.dayNum}
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                            {day.cashPercent}% Efectivo
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-300">Total Día:</span>
                            <span className="font-bold text-white">{formatCOP(day.total)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400">
                            <span>Ventas Efectivo:</span>
                            <span className="font-semibold">{formatCOP(day.cash)}</span>
                          </div>
                          <div className="flex justify-between text-blue-400">
                            <span>Transferencias:</span>
                            <span className="font-semibold">{formatCOP(day.transfer)}</span>
                          </div>
                          <div className="flex justify-between text-slate-300 pt-1 border-t border-white/10">
                            <span>Atenciones:</span>
                            <span className="font-bold text-white">{day.count} servicios</span>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-amber-300 text-center font-medium bg-white/5 py-1 rounded-lg">
                          Haz clic para ver las horas de este día →
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Week table breakdown */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
            <table className="w-full text-left text-xs min-w-[560px]">
              <thead className="bg-slate-100/90 dark:bg-[#02223a] text-slate-700 dark:text-slate-200 uppercase font-bold border-b border-slate-300/80 dark:border-white/15">
                <tr>
                  <th className="py-2.5 px-3">Día</th>
                  <th className="py-2.5 px-3">Servicios</th>
                  <th className="py-2.5 px-3 text-right">Efectivo ($)</th>
                  <th className="py-2.5 px-3 text-right">Transferencia ($)</th>
                  <th className="py-2.5 px-3 text-right">Total Facturado</th>
                  <th className="py-2.5 px-3 text-center">% Efectivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {weekData.days.map((d) => (
                  <tr 
                    key={d.name} 
                    className="hover:bg-slate-100/60 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedDateStr(d.dateStr);
                      setTimeframe('dia');
                    }}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{d.name} ({d.dayNum})</span>
                      {d.isToday && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-[#c5a059] font-extrabold">Hoy</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{d.count} atenciones</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCOP(d.cash)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                      {formatCOP(d.transfer)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCOP(d.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.cashPercent >= 50 
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                      }`}>
                        {d.cashPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. VISTA GRÁFICA DEL MES: DÍAS DEL MES Y EFECTIVO                 */}
      {/* ================================================================= */}
      {timeframe === 'mes' && (
        <div className="space-y-4">
          <div className="bg-slate-100/50 dark:bg-[#011b2e] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Evolución Diaria de {monthData.monthName} {monthData.year}</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Desempeño acumulado día por día. <span className="text-emerald-500 font-bold">Verde</span>: Efectivo. <span className="text-blue-500 font-bold">Azul</span>: Transferencias bancarias.
                </p>
              </div>

              {monthData.maxDayTotal > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Día más rentable</span>
                  <span className="font-mono font-bold text-xs text-amber-500">
                    Día {monthData.peakDay?.dayNum}: {formatCOP(monthData.maxDayTotal)}
                  </span>
                </div>
              )}
            </div>

            {/* Days of Month Bars (Scrollable horizontally if needed) */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-1 sm:gap-1.5 pt-8 pb-2 min-w-[700px] h-48 sm:h-52">
                {monthData.days.map((day, index) => {
                  const isPeak = day.total > 0 && day.total === monthData.maxDayTotal;
                  const isHovered = hoveredIndex === index;
                  const heightPercent = monthData.maxDayTotal > 0 ? Math.max(10, Math.round((day.total / monthData.maxDayTotal) * 100)) : 10;
                  const cashPercent = day.total > 0 ? (day.cash / day.total) * 100 : 0;
                  const transferPercent = 100 - cashPercent;

                  return (
                    <div
                      key={day.dayNum}
                      className="flex-1 flex flex-col items-center gap-1 group cursor-pointer relative"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => {
                        setSelectedDateStr(day.dateStr);
                        setTimeframe('dia');
                      }}
                      title={`Día ${day.dayNum}: ${formatCOP(day.total)} (Clic para ver horas)`}
                    >
                      {/* Peak crown */}
                      {isPeak && (
                        <div className="absolute -top-6 animate-bounce z-10">
                          <span className="text-[9px] font-extrabold bg-amber-500 text-black px-1 rounded-full">🔥</span>
                        </div>
                      )}

                      {/* Bar Container */}
                      <div className="w-full flex flex-col justify-end h-36 sm:h-40 bg-slate-200/50 dark:bg-slate-800/40 rounded-lg overflow-hidden p-0.5 relative group-hover:scale-105 transition-all">
                        {day.total > 0 ? (
                          <div 
                            className="w-full rounded-md overflow-hidden flex flex-col justify-end shadow-sm"
                            style={{ height: `${heightPercent}%` }}
                          >
                            {day.transfer > 0 && (
                              <div 
                                className="w-full bg-blue-500"
                                style={{ height: `${transferPercent}%` }}
                              />
                            )}
                            {day.cash > 0 && (
                              <div 
                                className="w-full bg-emerald-500"
                                style={{ height: `${cashPercent}%` }}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-700 my-auto opacity-40" />
                        )}
                      </div>

                      <span className={`text-[9px] font-bold ${
                        isPeak ? 'text-amber-500 font-extrabold' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {day.dayNum}
                      </span>

                      {/* Tooltip */}
                      {isHovered && day.total > 0 && (
                        <div className="absolute bottom-full mb-3 z-30 w-48 p-2.5 rounded-xl bg-slate-900/95 text-white border border-white/20 shadow-xl text-xs backdrop-blur-md pointer-events-none">
                          <div className="font-bold text-[#c5a059] border-b border-white/10 pb-1 mb-1">
                            Día {day.dayNum} de {monthData.monthName}
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span className="font-bold">{formatCOP(day.total)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-400">
                              <span>Efectivo:</span>
                              <span>{formatCOP(day.cash)} ({day.cashPercent}%)</span>
                            </div>
                            <div className="flex justify-between text-blue-400">
                              <span>Transferencia:</span>
                              <span>{formatCOP(day.transfer)}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Servicios:</span>
                              <span>{day.count} clientes</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. VISTA GRÁFICA DEL AÑO: 12 MESES Y VENTAS EN EFECTIVO           */}
      {/* ================================================================= */}
      {timeframe === 'ano' && (
        <div className="space-y-4">
          <div className="bg-slate-100/50 dark:bg-[#011b2e] rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Balance Anual: 12 Meses del Año {yearData.year}</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Comportamiento mes a mes con desglose de facturación en efectivo físico (<span className="text-emerald-500 font-bold">Verde</span>) y transferencias (<span className="text-blue-500 font-bold">Azul</span>).
                </p>
              </div>

              {yearData.maxMonthTotal > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Mes con mayor facturación</span>
                  <span className="font-mono font-bold text-xs text-amber-500">
                    {yearData.peakMonth?.name}: {formatCOP(yearData.maxMonthTotal)}
                  </span>
                </div>
              )}
            </div>

            {/* 12 Months Bars */}
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-3 items-end pt-8 pb-2 min-h-[220px]">
              {yearData.months.map((m, index) => {
                const isPeak = m.total > 0 && m.total === yearData.maxMonthTotal;
                const isHovered = hoveredIndex === index;
                const heightPercent = yearData.maxMonthTotal > 0 ? Math.max(12, Math.round((m.total / yearData.maxMonthTotal) * 100)) : 12;
                const cashPercent = m.total > 0 ? (m.cash / m.total) * 100 : 0;
                const transferPercent = 100 - cashPercent;

                return (
                  <div
                    key={m.name}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => {
                      const cur = new Date(selectedDateObj);
                      cur.setMonth(m.monthIndex);
                      setSelectedDateStr(cur.toISOString().split('T')[0]);
                      setTimeframe('mes');
                    }}
                    title={`${m.name}: ${formatCOP(m.total)} (Clic para ver mes)`}
                  >
                    {/* Peak crown */}
                    {isPeak && (
                      <div className="absolute -top-7 animate-bounce flex flex-col items-center z-10">
                        <span className="text-[9px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-black px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-black" />
                          <span>Récord</span>
                        </span>
                      </div>
                    )}

                    {/* Bar Container */}
                    <div className="w-full flex flex-col justify-end h-40 sm:h-44 bg-slate-200/50 dark:bg-slate-800/40 rounded-xl overflow-hidden p-0.5 relative group-hover:scale-105 group-hover:shadow-md transition-all">
                      {m.total > 0 ? (
                        <div 
                          className="w-full rounded-lg overflow-hidden flex flex-col justify-end shadow-sm"
                          style={{ height: `${heightPercent}%` }}
                        >
                          {m.transfer > 0 && (
                            <div 
                              className="w-full bg-blue-500 hover:bg-blue-400 transition-colors"
                              style={{ height: `${transferPercent}%` }}
                            />
                          )}
                          {m.cash > 0 && (
                            <div 
                              className="w-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
                              style={{ height: `${cashPercent}%` }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-1 bg-slate-300 dark:bg-slate-700 rounded-full my-auto opacity-50" />
                      )}

                      {/* Cash percent badge inside column */}
                      {m.total > 0 && (
                        <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-extrabold text-white drop-shadow-md select-none pointer-events-none">
                          {m.cashPercent}%
                        </span>
                      )}
                    </div>

                    {/* Month label */}
                    <span className={`text-[11px] font-bold block ${
                      isPeak 
                        ? 'text-amber-500 dark:text-amber-400 font-extrabold' 
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {m.shortName}
                    </span>

                    {/* Tooltip */}
                    {isHovered && m.total > 0 && (
                      <div className="absolute bottom-full mb-3 z-30 w-52 sm:w-60 p-3 rounded-2xl bg-slate-900/95 text-white border border-white/20 shadow-2xl backdrop-blur-md text-xs animate-in fade-in zoom-in-95 pointer-events-none">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                          <span className="font-bold text-[#c5a059]">{m.name} {yearData.year}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                            {m.cashPercent}% Efectivo
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-300">Total Facturado:</span>
                            <span className="font-bold text-white">{formatCOP(m.total)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400">
                            <span>Ventas Efectivo:</span>
                            <span className="font-semibold">{formatCOP(m.cash)}</span>
                          </div>
                          <div className="flex justify-between text-blue-400">
                            <span>Transferencias:</span>
                            <span className="font-semibold">{formatCOP(m.transfer)}</span>
                          </div>
                          <div className="flex justify-between text-slate-300 pt-1 border-t border-white/10">
                            <span>Servicios:</span>
                            <span className="font-bold text-white">{m.count} atenciones</span>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-amber-300 text-center font-medium bg-white/5 py-1 rounded-lg">
                          Haz clic para ver el desglose del mes →
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
