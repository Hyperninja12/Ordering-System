import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BedDouble,
  BookOpenCheck,
  CalendarClock,
  ChevronLeft,
  Cpu,
  CreditCard,
  Database,
  Hotel,
  LayoutDashboard,
  Link2,
  LogOut,
  ShieldCheck,
  Search,
  Settings,
  Sparkles,
  UserCircle2,
  Users,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SIDEBAR_MODULES = [
  {
    title: "Overview",
    moduleIcon: LayoutDashboard,
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Booking Module",
    moduleIcon: BookOpenCheck,
    items: [
      { id: "reservations", label: "Reservations", icon: BookOpenCheck },
      { id: "calendar", label: "Calendar", icon: CalendarClock },
      { id: "rooms", label: "Rooms", icon: BedDouble },
    ],
  },
  {
    title: "Management",
    moduleIcon: Settings,
    items: [
      { id: "guests", label: "Guests", icon: Users },
      { id: "payments", label: "Payments", icon: CreditCard },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const MODULE_CONTENT = {
  dashboard: {
    title: "Overview Dashboard",
    description: "Track the booking workflow end-to-end and spot bottlenecks quickly.",
    stats: [
      { label: "Active Booking Requests", value: "18" },
      { label: "Ready for Check-in", value: "11" },
      { label: "Pending Payments", value: "4" },
    ],
    checklist: ["Review queue", "Confirm arrivals", "Verify payments"],
  },
  reservations: {
    title: "Reservations Module",
    description: "Capture booking details and validate guest stay requirements.",
    stats: [
      { label: "New Requests", value: "7" },
      { label: "Confirmed", value: "10" },
      { label: "Need Review", value: "1" },
    ],
    checklist: ["Collect stay dates", "Confirm guest count", "Set booking status"],
  },
  calendar: {
    title: "Calendar Module",
    description: "Place each booking into the availability schedule.",
    stats: [
      { label: "Today Check-ins", value: "11" },
      { label: "Today Check-outs", value: "8" },
      { label: "Overlapping Alerts", value: "0" },
    ],
    checklist: ["Map reservation to timeline", "Check date conflicts", "Lock schedule"],
  },
  rooms: {
    title: "Rooms Module",
    description: "Assign the best-fit room and prepare it for arrival.",
    stats: [
      { label: "Available Rooms", value: "18" },
      { label: "Occupied Rooms", value: "42" },
      { label: "Housekeeping Ready", value: "14" },
    ],
    checklist: ["Match room type", "Confirm room availability", "Set room preparation"],
  },
  guests: {
    title: "Guests Module",
    description: "Maintain guest profiles and special requests.",
    stats: [
      { label: "Arriving Guests", value: "21" },
      { label: "VIP Guests", value: "3" },
      { label: "Special Requests", value: "5" },
    ],
    checklist: ["Validate guest info", "Attach preferences", "Add stay notes"],
  },
  payments: {
    title: "Payments Module",
    description: "Collect and verify booking payments before check-in.",
    stats: [
      { label: "Paid", value: "14" },
      { label: "Partial", value: "3" },
      { label: "Unpaid", value: "1" },
    ],
    checklist: ["Select payment method", "Record transaction", "Send receipt"],
  },
  settings: {
    title: "Settings Module",
    description: "Finalize rules for booking flow, notifications, and permissions.",
    stats: [
      { label: "Check-in Rule Sets", value: "4" },
      { label: "Notification Templates", value: "6" },
      { label: "Staff Roles", value: "5" },
    ],
    checklist: ["Configure booking rules", "Set notification timing", "Assign access roles"],
  },
};

const RECENT_BOOKINGS = [
  { code: "BK-1024", guest: "Anna Cruz", room: "Deluxe 203", status: "Confirmed", payment: "Paid" },
  { code: "BK-1025", guest: "Marco Santos", room: "Suite 311", status: "Pending", payment: "Unpaid" },
  { code: "BK-1026", guest: "Lia Mendoza", room: "Standard 118", status: "Checked-in", payment: "Paid" },
];

const statusClasses = {
  Confirmed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  "Checked-in": "bg-sky-100 text-sky-700",
};

const DASHBOARD_STAT_GRADIENTS = [
  "from-cyan-500/20 to-blue-500/10 border-cyan-400/40",
  "from-emerald-500/20 to-teal-500/10 border-emerald-400/40",
  "from-fuchsia-500/20 to-violet-500/10 border-fuchsia-400/40",
];

const RESERVATION_PROCESS_STEPS = [
  {
    id: "collect",
    title: "Collect Request",
    detail: "Capture guest name, stay dates, and room preference.",
    icon: BookOpenCheck,
  },
  {
    id: "validate",
    title: "Validate Dates",
    detail: "Check if requested dates are available in the calendar.",
    icon: CalendarClock,
  },
  {
    id: "assign",
    title: "Assign Room",
    detail: "Pick best available room based on requested room type.",
    icon: BedDouble,
  },
  {
    id: "confirm",
    title: "Confirm Booking",
    detail: "Save reservation and proceed to payment processing.",
    icon: CreditCard,
  },
];

const RESERVATION_QUEUE = [
  { code: "RQ-8801", guest: "Nina Lopez", stay: "Apr 24 - Apr 27", roomType: "Deluxe", stage: "Validate Dates" },
  { code: "RQ-8802", guest: "Carl Dizon", stay: "Apr 25 - Apr 26", roomType: "Standard", stage: "Assign Room" },
  { code: "RQ-8803", guest: "Mia Tan", stay: "Apr 27 - Apr 30", roomType: "Suite", stage: "Collect Request" },
];

const BLOCKCHAIN_NODES = [
  { id: "validator-sg-01", region: "Singapore", health: "Healthy", uptime: "99.99%" },
  { id: "validator-tx-04", region: "Texas", health: "Healthy", uptime: "99.95%" },
  { id: "validator-jp-03", region: "Tokyo", health: "Syncing", uptime: "99.91%" },
];

const LEDGER_STREAM = [
  { id: "0x8a34..d2e1", action: "Reservation Token Minted", module: "Reservations" },
  { id: "0x7c14..51f0", action: "Room Allocation Confirmed", module: "Rooms" },
  { id: "0x4e72..c099", action: "Payment Settlement Posted", module: "Payments" },
];

function DashboardPage({ user, onLogout }) {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chainTick, setChainTick] = useState(0);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const streamInterval = setInterval(() => {
      setChainTick((tick) => tick + 1);
    }, 2200);

    const clockInterval = setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => {
      clearInterval(streamInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const activeModuleItem = useMemo(
    () =>
      SIDEBAR_MODULES.flatMap((module) => module.items).find(
        (item) => item.id === activeModule
      ) || SIDEBAR_MODULES[0].items[0],
    [activeModule]
  );

  const activeContent = MODULE_CONTENT[activeModule] || MODULE_CONTENT.dashboard;

  const dashboardTelemetry = useMemo(
    () => ({
      blockHeight: 248021 + chainTick,
      txPerSecond: 38 + ((chainTick * 3) % 9),
      finality: `${(1.1 + ((chainTick % 4) * 0.2)).toFixed(1)}s`,
      gasIndex: `${16 + (chainTick % 6)} gwei`,
    }),
    [chainTick]
  );

  const occupancyBars = useMemo(
    () => Array.from({ length: 12 }, (_, index) => 35 + ((index * 9 + chainTick * 7) % 58)),
    [chainTick]
  );

  const dashboardStats =
    activeModule === "dashboard"
      ? [
          { label: "Current Block Height", value: dashboardTelemetry.blockHeight.toLocaleString() },
          { label: "Transactions / sec", value: dashboardTelemetry.txPerSecond.toString() },
          { label: "Finality Window", value: dashboardTelemetry.finality },
        ]
      : activeContent.stats;

  const ledgerFeed = useMemo(
    () =>
      LEDGER_STREAM.map((item, index) => ({
        ...item,
        confirmations: 12 + ((chainTick + index * 4) % 18),
      })),
    [chainTick]
  );

  return (
    <main
      className={`min-h-screen p-4 sm:p-6 ${
        activeModule === "dashboard"
          ? "bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.18),transparent_36%),radial-gradient(circle_at_88%_12%,rgba(20,184,166,0.14),transparent_32%),linear-gradient(165deg,#020617_0%,#0f172a_40%,#111827_100%)]"
          : "bg-background"
      }`}
    >
      <section
        className={`mx-auto grid w-full max-w-7xl gap-4 transition-[grid-template-columns] duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-[260px_1fr]"
        }`}
      >
        <Card className="sidebar-scroll transition-all duration-300 ease-in-out lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto bg-slate-900/95 border border-slate-700/50 shadow-lg shadow-slate-900/30 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50 pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hotel className="h-5 w-5 text-cyan-400" />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out font-semibold ${
                    isSidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100 text-slate-100"
                  }`}
                >
                  Booking System
                </span>
              </CardTitle>
              <Button
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="bg-transparent hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ChevronLeft
                  className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                    isSidebarCollapsed ? "rotate-180" : "rotate-0"
                  }`}
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {SIDEBAR_MODULES.map((module, index) => {
              const ModuleIcon = module.moduleIcon;

              return (
                <div
                  key={module.title}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isSidebarCollapsed ? "grid-cols-1" : "grid-cols-[1rem_1fr] gap-3"
                  }`}
                >
                  <div className="relative flex justify-center">
                    {index < SIDEBAR_MODULES.length - 1 && !isSidebarCollapsed ? (
                      <span className="absolute left-1/2 top-4 h-[calc(100%+1.2rem)] w-px -translate-x-1/2 bg-slate-600/50" />
                    ) : null}
                    <span className="relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700/60 border border-slate-600/40">
                      <ModuleIcon className="h-3 w-3 text-cyan-400" />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isSidebarCollapsed ? "mt-2 space-y-1" : "space-y-2"
                    }`}
                  >
                    <p
                      className={`overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-400 transition-all duration-300 ease-in-out ${
                        isSidebarCollapsed ? "max-h-0 opacity-0" : "max-h-6 opacity-100"
                      }`}
                    >
                      {module.title}
                    </p>
                    <div className="space-y-1">
                      {module.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === activeModule;

                        return (
                          <button
                            key={item.id}
                            className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                              isActive
                                ? "bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_12px_rgba(8,145,178,0.4)]"
                                : "border border-transparent bg-transparent text-slate-300 hover:border-slate-600/40 hover:bg-slate-700/40 hover:text-slate-100"
                            } ${isSidebarCollapsed ? "justify-center px-2" : "gap-2"}`}
                            onClick={() => setActiveModule(item.id)}
                            type="button"
                            title={isSidebarCollapsed ? item.label : undefined}
                          >
                            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span
                              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out font-medium ${
                                isSidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"
                              }`}
                            >
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {activeModule === "dashboard" ? (
            <Card className="relative overflow-hidden border-cyan-300/30 bg-slate-950/70 text-slate-100 shadow-[0_0_30px_rgba(45,212,191,0.2)] backdrop-blur">
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-20 h-44 w-44 rounded-full bg-teal-400/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-20 [background:linear-gradient(transparent_95%,rgba(45,212,191,0.65)_95%),linear-gradient(90deg,transparent_95%,rgba(45,212,191,0.65)_95%)] [background-size:32px_32px]" />
              <CardContent className="relative p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      Chain-Synced Dashboard
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      Futuristic Booking Ledger
                    </h2>
                    <p className="max-w-2xl text-sm text-cyan-100/80">
                      Real-time booking intelligence powered by validator telemetry, block finality, and
                      predictive occupancy streams.
                    </p>
                  </div>
                  <div className="rounded-lg border border-cyan-300/30 bg-slate-900/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">Network Time</p>
                    <p className="mt-1 text-lg font-semibold text-white">{clock.toLocaleTimeString()}</p>
                    <p className="text-xs text-cyan-100/70">Gas index: {dashboardTelemetry.gasIndex}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-lg border border-cyan-400/30 bg-slate-900/70 p-4">
                    <p className="mb-3 text-xs uppercase tracking-[0.15em] text-cyan-200">Occupancy Signal</p>
                    <div className="flex h-24 items-end gap-2">
                      {occupancyBars.map((value, index) => (
                        <div
                          key={`${value}-${index}`}
                          className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/80 to-teal-300/70 transition-all duration-700"
                          style={{
                            height: `${value}%`,
                            boxShadow: index % 3 === chainTick % 3 ? "0 0 16px rgba(34,211,238,0.5)" : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {BLOCKCHAIN_NODES.map((node, index) => (
                      <div
                        key={node.id}
                        className="rounded-lg border border-cyan-300/30 bg-slate-900/70 p-3 transition-all duration-500"
                        style={{
                          transform: index === chainTick % BLOCKCHAIN_NODES.length ? "translateX(-2px)" : "none",
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-cyan-200" />
                            <p className="text-sm font-medium text-white">{node.id}</p>
                          </div>
                          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[11px] text-cyan-100">
                            {node.health}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-cyan-100/70">
                          {node.region} node • uptime {node.uptime}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Top Navbar with Overview Dashboard - Always Visible & Prominent */}
          <Card className={`border-2 ${activeModule === "dashboard" ? "border-cyan-400 bg-gradient-to-r from-cyan-900/90 via-slate-900/90 to-slate-900/90 shadow-[0_0_30px_rgba(34,211,238,0.3)]" : "border-slate-600 bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-900/90 shadow-lg"}`}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Top row: Overview Dashboard info + User info */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Overview Dashboard Section - Always Visible & Clickable */}
                  <button 
                    className="flex items-center gap-3 text-left group transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => setActiveModule("dashboard")}
                    type="button"
                  >
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 shadow-lg transition-all ${activeModule === "dashboard" ? "bg-cyan-500/30 border-cyan-300 shadow-cyan-500/20" : "bg-slate-600/30 border-slate-400 shadow-slate-500/20 group-hover:border-cyan-400 group-hover:bg-cyan-500/20"}`}>
                      <LayoutDashboard className={`h-7 w-7 ${activeModule === "dashboard" ? "text-cyan-300" : "text-slate-300 group-hover:text-cyan-300"}`} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        {activeModule === "dashboard" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-400/20 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200 font-semibold">
                            <Sparkles className="h-3 w-3 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500 bg-slate-500/20 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-300 font-semibold">
                            Overview
                          </span>
                        )}
                        <h2 className={`text-xl font-bold ${activeModule === "dashboard" ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                          Overview Dashboard
                        </h2>
                      </div>
                      <p className={`text-sm font-medium mt-1 ${activeModule === "dashboard" ? "text-cyan-100" : "text-slate-400 group-hover:text-slate-300"}`}>
                        {activeModule === "dashboard" 
                          ? `Real-time booking intelligence • ${dashboardStats.length} active metrics`
                          : "📊 Click to view real-time metrics"
                        }
                      </p>
                    </div>
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="h-8 w-8 text-slate-300 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.email || "No email"} • {user?.role || "user"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom row: Quick stats + Search + Logout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-600/50">
                  {/* Quick Stats - Always show, but enhanced on dashboard */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {activeModule === "dashboard" 
                      ? dashboardStats.slice(0, 3).map((stat, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5">
                            <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor] ${idx === 0 ? 'bg-cyan-400 text-cyan-400 animate-pulse' : idx === 1 ? 'bg-emerald-400 text-emerald-400' : 'bg-fuchsia-400 text-fuchsia-400'}`} />
                            <span className="text-xs text-cyan-100/70">{stat.label}:</span>
                            <span className="text-sm font-bold text-cyan-100">
                              {stat.value}
                            </span>
                          </div>
                        ))
                      : activeContent.stats.slice(0, 3).map((stat, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-lg bg-slate-700/30 border border-slate-600/30 px-3 py-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                            <span className="text-xs text-slate-400">{stat.label}:</span>
                            <span className="text-sm font-bold text-slate-200">
                              {stat.value}
                            </span>
                          </div>
                        ))
                    }
                  </div>
                  
                  <div className="flex items-center gap-3 ml-auto">
                    {/* Enhanced Search Input */}
                    <div className="relative w-full sm:w-64">
                      <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${activeModule === "dashboard" ? "text-cyan-300" : "text-slate-400"}`} />
                      <Input 
                        className={`pl-9 h-10 text-sm font-medium border-2 transition-all focus:ring-2 ${
                          activeModule === "dashboard" 
                            ? "border-cyan-500/40 bg-slate-800/60 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20" 
                            : "border-slate-600 bg-slate-800/60 text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:ring-slate-400/20"
                        }`} 
                        placeholder={`Search in ${activeModuleItem.label}...`} 
                      />
                    </div>
                    {/* Enhanced Logout Button */}
                    <Button 
                      onClick={onLogout} 
                      variant="outline" 
                      size="sm"
                      className={`border-2 font-semibold transition-all hover:scale-105 ${
                        activeModule === "dashboard"
                          ? "border-red-500/50 text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:border-red-400"
                          : "border-slate-500 text-slate-300 bg-slate-700/30 hover:bg-slate-600/40 hover:border-slate-400"
                      }`}
                    >
                      <LogOut className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {dashboardStats.map((kpi, index) => (
              <Card
                key={kpi.label}
                className={
                  activeModule === "dashboard"
                    ? `border border-cyan-300/30 bg-gradient-to-br ${DASHBOARD_STAT_GRADIENTS[index % DASHBOARD_STAT_GRADIENTS.length]} text-slate-50`
                    : ""
                }
              >
                <CardContent className="p-6">
                  <p
                    className={`text-sm ${
                      activeModule === "dashboard" ? "text-slate-200" : "text-muted-foreground"
                    }`}
                  >
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeModule === "dashboard" ? (
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-cyan-300/30 bg-slate-950/60 text-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-cyan-100">
                    <Workflow className="h-4 w-4 text-cyan-300" />
                    Smart Contract Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md border border-cyan-300/25 bg-slate-900/70 p-3">
                    <p className="text-xs uppercase tracking-wide text-cyan-200/85">Step 1</p>
                    <p className="text-sm text-white">Reservation intent signed and broadcast to booking chain.</p>
                  </div>
                  <div className="rounded-md border border-cyan-300/25 bg-slate-900/70 p-3">
                    <p className="text-xs uppercase tracking-wide text-cyan-200/85">Step 2</p>
                    <p className="text-sm text-white">Room assignment verified through availability oracle.</p>
                  </div>
                  <div className="rounded-md border border-cyan-300/25 bg-slate-900/70 p-3">
                    <p className="text-xs uppercase tracking-wide text-cyan-200/85">Step 3</p>
                    <p className="text-sm text-white">Payment settlement reaches finality and triggers guest notice.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-cyan-300/30 bg-slate-950/60 text-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-cyan-100">
                    <Database className="h-4 w-4 text-cyan-300" />
                    Ledger Event Stream
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ledgerFeed.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-md border border-cyan-300/25 bg-slate-900/70 p-3 transition-all duration-500"
                      style={{
                        opacity: index === chainTick % ledgerFeed.length ? 1 : 0.8,
                      }}
                    >
                      <p className="flex items-center gap-2 text-sm text-white">
                        <Link2 className="h-3.5 w-3.5 text-cyan-300" />
                        {item.action}
                      </p>
                      <p className="mt-1 text-xs text-cyan-100/80">
                        {item.id} • {item.module} • {item.confirmations} confirmations
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {activeModule === "reservations" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reservation Tab Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {RESERVATION_PROCESS_STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <div
                        key={step.id}
                        className="relative rounded-md border border-border bg-background px-3 py-3"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <StepIcon className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold">{step.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{step.detail}</p>
                        {index < RESERVATION_PROCESS_STEPS.length - 1 ? (
                          <ArrowRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground xl:block" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3 rounded-md border border-border p-4">
                    <p className="text-sm font-semibold">Reservation Intake</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input placeholder="Guest full name" />
                      <Input placeholder="Email or phone" />
                      <Input placeholder="Check-in date" />
                      <Input placeholder="Check-out date" />
                      <Input placeholder="Room type" />
                      <Input placeholder="Number of guests" />
                    </div>
                    <Button className="w-full sm:w-auto">Create Reservation Draft</Button>
                  </div>

                  <div className="space-y-3 rounded-md border border-border p-4">
                    <p className="text-sm font-semibold">Reservation Queue</p>
                    <div className="space-y-2">
                      {RESERVATION_QUEUE.map((item) => (
                        <div
                          key={item.code}
                          className="rounded-md border border-border/80 px-3 py-2 text-sm"
                        >
                          <p className="font-medium">
                            {item.code} • {item.guest}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.stay} • {item.roomType}
                          </p>
                          <p className="mt-1 text-xs font-medium text-primary">{item.stage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle
                className={`text-lg ${activeModule === "dashboard" ? "flex items-center gap-2 text-cyan-100" : ""}`}
              >
                {activeModule === "dashboard" ? <Activity className="h-4 w-4 text-cyan-300" /> : null}
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className={activeModule === "dashboard" ? "text-slate-100" : ""}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b ${activeModule === "dashboard" ? "border-cyan-300/30 text-cyan-100/80" : "border-border text-muted-foreground"}`}
                    >
                      <th className="pb-3 font-medium">Booking Code</th>
                      <th className="pb-3 font-medium">Guest</th>
                      <th className="pb-3 font-medium">Room</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_BOOKINGS.map((booking) => (
                      <tr
                        key={booking.code}
                        className={
                          activeModule === "dashboard"
                            ? "border-b border-cyan-300/15 transition-colors hover:bg-cyan-300/5"
                            : "border-b border-border/70"
                        }
                      >
                        <td className={`py-3 font-medium ${activeModule === "dashboard" ? "text-cyan-100" : "text-foreground"}`}>
                          {booking.code}
                        </td>
                        <td className="py-3">{booking.guest}</td>
                        <td className="py-3">{booking.room}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              statusClasses[booking.status]
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className={activeModule === "dashboard" ? "py-3 text-cyan-100/80" : "py-3 text-muted-foreground"}>
                          {booking.payment}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
