import { useMemo, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  BookOpenCheck,
  CalendarClock,
  ChevronLeft,
  CreditCard,
  Hotel,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UserCircle2,
  Users,
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

function DashboardPage({ user, onLogout }) {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeModuleItem = useMemo(
    () =>
      SIDEBAR_MODULES.flatMap((module) => module.items).find(
        (item) => item.id === activeModule
      ) || SIDEBAR_MODULES[0].items[0],
    [activeModule]
  );

  const activeContent = MODULE_CONTENT[activeModule] || MODULE_CONTENT.dashboard;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <section
        className={`mx-auto grid w-full max-w-7xl gap-4 transition-[grid-template-columns] duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-[260px_1fr]"
        }`}
      >
        <Card className="sidebar-scroll transition-all duration-300 ease-in-out lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hotel className="h-5 w-5 text-primary" />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                    isSidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"
                  }`}
                >
                  Booking System
                </span>
              </CardTitle>
              <Button
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="bg-transparent hover:bg-transparent"
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
                      <span className="absolute left-1/2 top-4 h-[calc(100%+1.2rem)] w-px -translate-x-1/2 bg-[#2f3338]" />
                    ) : null}
                    <span className="relative z-10 mt-0.5 flex h-4 w-4 items-center justify-center bg-card">
                      <ModuleIcon className="h-3.5 w-3.5 text-[#2f3338]" />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isSidebarCollapsed ? "mt-2 space-y-1" : "space-y-2"
                    }`}
                  >
                    <p
                      className={`overflow-hidden whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-all duration-300 ease-in-out ${
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
                                ? "bg-primary text-primary-foreground hover:brightness-95"
                                : "border border-transparent bg-transparent text-foreground hover:border-[#2f3338]/25 hover:bg-[#2f3338]/18"
                            } ${isSidebarCollapsed ? "justify-center px-2" : "gap-2"}`}
                            onClick={() => setActiveModule(item.id)}
                            type="button"
                            title={isSidebarCollapsed ? item.label : undefined}
                          >
                            <Icon className="h-4 w-4" />
                            <span
                              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
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

          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <UserCircle2 className="h-10 w-10 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{activeContent.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {user?.name || "User"} ({user?.email || "No email"})
                  </p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Role: {user?.role || "user"} | Active Tab: {activeModuleItem.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder={`Search in ${activeModuleItem.label}...`} />
                </div>
                <Button onClick={onLogout} variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {activeContent.stats.map((kpi, index) => (
              <Card
                key={kpi.label}
                className={
                  activeModule === "dashboard"
                    ? `border bg-gradient-to-br ${DASHBOARD_STAT_GRADIENTS[index % DASHBOARD_STAT_GRADIENTS.length]}`
                    : ""
                }
              >
                <CardContent className="p-6">
                  <p
                    className={`text-sm ${
                      activeModule === "dashboard" ? "text-foreground/90" : "text-muted-foreground"
                    }`}
                  >
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

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
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-3 font-medium">Booking Code</th>
                      <th className="pb-3 font-medium">Guest</th>
                      <th className="pb-3 font-medium">Room</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_BOOKINGS.map((booking) => (
                      <tr key={booking.code} className="border-b border-border/70">
                        <td className="py-3 font-medium text-foreground">{booking.code}</td>
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
                        <td className="py-3 text-muted-foreground">{booking.payment}</td>
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
