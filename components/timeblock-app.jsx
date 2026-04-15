// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock3,
  LogIn,
  LogOut,
  Plus,
  Settings,
  Trash2,
  FolderKanban,
  BookOpen,
  Briefcase,
  Home,
  Heart,
  MoonStar,
  UserCircle2,
  Quote,
  Shuffle,
  Image as ImageIcon,
  Music2,
  Pencil,
  SunMedium,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const defaultCategories = [
  { id: "lecture", name: "Lectures", color: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", icon: BookOpen },
  { id: "normal", name: "Normal", color: "bg-slate-500", light: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", icon: Clock3 },
  { id: "work", name: "Work", color: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", icon: Briefcase },
  { id: "home", name: "Home", color: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", icon: Home },
  { id: "personal", name: "Personal", color: "bg-pink-500", light: "bg-pink-100", text: "text-pink-700", border: "border-pink-300", icon: Heart },
];

const colorOptions = [
  { solid: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  { solid: "bg-slate-500", light: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
  { solid: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  { solid: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  { solid: "bg-pink-500", light: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
  { solid: "bg-violet-500", light: "bg-violet-100", text: "text-violet-700", border: "border-violet-300" },
  { solid: "bg-red-500", light: "bg-red-100", text: "text-red-700", border: "border-red-300" },
  { solid: "bg-cyan-500", light: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const minuteStepOptions = [5, 10, 15, 20, 30, 60];
const soundOptions = ["Chime", "Bell", "Soft tone", "Morning", "Device default", "Choose from device"];
const themeColors = [
  { name: "Sky", value: "#e0f2fe" },
  { name: "Violet", value: "#f5f3ff" },
  { name: "Rose", value: "#fff1f2" },
  { name: "Mint", value: "#ecfdf5" },
  { name: "Amber", value: "#fffbeb" },
  { name: "Slate", value: "#f8fafc" },
  { name: "Lavender", value: "#eef2ff" },
  { name: "Peach", value: "#fff7ed" },
];
const backgroundStyles = [
  { name: "Soft gradient", value: "radial-gradient(circle at top, var(--theme-color), #f8fafc 35%, #f5f3ff 100%)" },
  { name: "Clean solid", value: "linear-gradient(180deg, var(--theme-color), #ffffff)" },
  { name: "Warm fade", value: "linear-gradient(180deg, var(--theme-color), #fff7ed 100%)" },
  { name: "Dark glass", value: "linear-gradient(180deg, #0f172a, #1e293b)" },
];
const hourHeight = 76;

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function prettyDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shortDate(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const start = new Date(year, month, 1 - startDay);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total) {
  const safe = Math.max(0, Math.min(1439, total));
  const h = String(Math.floor(safe / 60)).padStart(2, "0");
  const m = String(safe % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function deterministicIndex(seed, length) {
  if (!length) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  return Math.abs(hash) % length;
}

function isValidTimeInput(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function eventDurationText(startTime, endTime) {
  const mins = toMinutes(endTime) - toMinutes(startTime);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function buildEventColumns(events) {
  const sorted = [...events].sort((a, b) => {
    const diff = toMinutes(a.startTime) - toMinutes(b.startTime);
    if (diff !== 0) return diff;
    return toMinutes(a.endTime) - toMinutes(b.endTime);
  });

  const layout = [];
  let i = 0;

  while (i < sorted.length) {
    const cluster = [sorted[i]];
    let clusterEnd = toMinutes(sorted[i].endTime);
    let j = i + 1;

    while (j < sorted.length && toMinutes(sorted[j].startTime) < clusterEnd) {
      cluster.push(sorted[j]);
      clusterEnd = Math.max(clusterEnd, toMinutes(sorted[j].endTime));
      j += 1;
    }

    const columns = [];
    const items = cluster.map((event) => {
      let placed = false;
      let columnIndex = 0;
      while (columnIndex < columns.length) {
        if (toMinutes(event.startTime) >= columns[columnIndex]) {
          columns[columnIndex] = toMinutes(event.endTime);
          placed = true;
          break;
        }
        columnIndex += 1;
      }
      if (!placed) {
        columns.push(toMinutes(event.endTime));
        columnIndex = columns.length - 1;
      }
      return { ...event, columnIndex };
    });

    const totalColumns = Math.max(columns.length, 1);
    items.forEach((item) => layout.push({ ...item, totalColumns }));
    i = j;
  }

  return layout;
}

export default function TimeBlockMobileApp() {
  const today = new Date();
  const todayKey = formatDateKey(today);

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "" });
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("tb-active-user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const storagePrefix = user ? `tb-${user.email}` : "tb-guest";

  const [selectedDate, setSelectedDate] = useState(today);
  const [viewDate, setViewDate] = useState(today);
  const [activeScreen, setActiveScreen] = useState("calendar");
  const [categories, setCategories] = useState(defaultCategories);
  const [eventsByDay, setEventsByDay] = useState({});
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    defaultReminder: 10,
    appSectionName: "Time Blocks",
    minuteStep: 15,
    randomReminderEnabled: true,
    themeColor: "#e0f2fe",
    customThemeColor: "#e0f2fe",
    backgroundStyle: "radial-gradient(circle at top, var(--theme-color), #f8fafc 35%, #f5f3ff 100%)",
    notificationSound: "Device default",
    deviceSoundName: "",
    showWeekendHighlights: true,
    showDailyQuoteCard: true,
    autoOpenToday: false,
  });

  const [quoteBank, setQuoteBank] = useState([]);
  const [quoteForm, setQuoteForm] = useState({ text: "", source: "", type: "Hadith" });
  const [quoteSearch, setQuoteSearch] = useState("");

  const [formState, setFormState] = useState({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    categoryId: "lecture",
    notes: "",
    reminderMinutes: 10,
  });

  const [editingEventId, setEditingEventId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    solid: "bg-violet-500",
    light: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-300",
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [quoteBankOpen, setQuoteBankOpen] = useState(false);
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (!user) return;
    try {
      const savedEvents = localStorage.getItem(`${storagePrefix}-events`);
      const savedSettings = localStorage.getItem(`${storagePrefix}-settings`);
      const savedCategories = localStorage.getItem(`${storagePrefix}-categories`);
      const savedQuoteBank = localStorage.getItem(`${storagePrefix}-quotes`);

      setEventsByDay(savedEvents ? JSON.parse(savedEvents) : {});
      setSettings((prev) => ({
        ...prev,
        ...(savedSettings
          ? JSON.parse(savedSettings)
          : {
              notificationsEnabled: true,
              defaultReminder: 10,
              appSectionName: `${user.fullName.split(" ")[0] || "My"} Planner`,
              minuteStep: 15,
              randomReminderEnabled: true,
            }),
      }));
      setCategories(savedCategories ? JSON.parse(savedCategories) : defaultCategories);
      setQuoteBank(savedQuoteBank ? JSON.parse(savedQuoteBank) : []);
    } catch {
      setEventsByDay({});
      setSettings((prev) => ({ ...prev, appSectionName: "Time Blocks" }));
      setCategories(defaultCategories);
      setQuoteBank([]);
    }
  }, [user, storagePrefix]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${storagePrefix}-events`, JSON.stringify(eventsByDay));
  }, [eventsByDay, storagePrefix, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${storagePrefix}-settings`, JSON.stringify(settings));
  }, [settings, storagePrefix, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${storagePrefix}-categories`, JSON.stringify(categories));
  }, [categories, storagePrefix, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${storagePrefix}-quotes`, JSON.stringify(quoteBank));
  }, [quoteBank, storagePrefix, user]);

  useEffect(() => {
    if (user) localStorage.setItem("tb-active-user", JSON.stringify(user));
    else localStorage.removeItem("tb-active-user");
  }, [user]);

  useEffect(() => {
    if (settings.autoOpenToday) {
      setSelectedDate(new Date());
      setViewDate(new Date());
    }
  }, [settings.autoOpenToday]);

  useEffect(() => {
    const ensureNotificationPermission = async () => {
      if (settings.notificationsEnabled && typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          try {
            await Notification.requestPermission();
          } catch {
            // ignore preview permission issues
          }
        }
      }
    };
    ensureNotificationPermission();
  }, [settings.notificationsEnabled]);

  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    const interval = setInterval(() => {
      const now = new Date();
      const currentDayKey = formatDateKey(now);
      const todaysEvents = eventsByDay[currentDayKey] || [];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      todaysEvents.forEach((event) => {
        const reminderAt = toMinutes(event.startTime) - Number(event.reminderMinutes || 0);
        const stamp = `notice-${currentDayKey}-${event.id}-${now.getHours()}-${now.getMinutes()}`;
        if (currentMinutes === reminderAt && !sessionStorage.getItem(stamp)) {
          sessionStorage.setItem(stamp, "1");
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(`Upcoming: ${event.title}`, {
              body: `${event.startTime} - ${event.endTime} • ${event.categoryName} • ${settings.notificationSound === "Choose from device" ? settings.deviceSoundName || "Custom sound" : settings.notificationSound}`,
            });
          }
        }
      });

      if (settings.randomReminderEnabled && quoteBank.length > 0 && currentMinutes === 8 * 60) {
        const quoteKey = `daily-quote-${currentDayKey}`;
        if (!sessionStorage.getItem(quoteKey)) {
          sessionStorage.setItem(quoteKey, "1");
          const index = deterministicIndex(currentDayKey, quoteBank.length);
          const selectedQuote = quoteBank[index];
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(selectedQuote.type || "Daily reminder", {
              body: selectedQuote.text,
            });
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [eventsByDay, settings.notificationsEnabled, settings.notificationSound, settings.deviceSoundName, settings.randomReminderEnabled, quoteBank]);

  const selectedKey = formatDateKey(selectedDate);
  const monthGrid = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  const selectedEvents = useMemo(
    () => (eventsByDay[selectedKey] || []).slice().sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)),
    [eventsByDay, selectedKey]
  );
  const laidOutEvents = useMemo(() => buildEventColumns(selectedEvents), [selectedEvents]);
  const filteredQuotes = useMemo(() => {
    if (!quoteSearch.trim()) return quoteBank;
    const q = quoteSearch.toLowerCase();
    return quoteBank.filter((item) => [item.type, item.text, item.source].join(" ").toLowerCase().includes(q));
  }, [quoteBank, quoteSearch]);
  const dayQuote = useMemo(() => {
    if (!quoteBank.length) return null;
    return quoteBank[deterministicIndex(selectedKey, quoteBank.length)];
  }, [quoteBank, selectedKey]);

  const todayEvents = eventsByDay[todayKey] || [];
  const totalBlocks = Object.values(eventsByDay).reduce((sum, items) => sum + items.length, 0);
  const selectedDayHours = selectedEvents.reduce((sum, event) => sum + (toMinutes(event.endTime) - toMinutes(event.startTime)) / 60, 0);
  const nowLinePosition = formatDateKey(selectedDate) === todayKey ? ((today.getHours() * 60 + today.getMinutes()) / 60) * hourHeight : null;
  const backgroundValue = (settings.backgroundStyle || backgroundStyles[0].value).replace(/var\(--theme-color\)/g, settings.themeColor || settings.customThemeColor || "#e0f2fe");
  const darkBackground = backgroundValue.includes("#0f172a") || backgroundValue.includes("#1e293b");

  const countForDay = (date) => {
    const key = formatDateKey(date);
    return (eventsByDay[key] || []).length;
  };

  const colorsForDay = (date) => {
    const key = formatDateKey(date);
    const items = eventsByDay[key] || [];
    return [...new Set(items.map((item) => item.categoryColor))].slice(0, 3);
  };

  const isWeekend = (date) => [0, 6].includes(date.getDay());

  const resetForm = () => {
    setFormState({
      title: "",
      startTime: "09:00",
      endTime: "10:00",
      categoryId: categories.find((c) => c.id === "lecture")?.id || categories[0]?.id || "lecture",
      notes: "",
      reminderMinutes: settings.defaultReminder || 10,
    });
    setEditingEventId(null);
    setErrorText("");
  };

  const openAddBlock = () => {
    resetForm();
    setAddBlockOpen(true);
  };

  const openEditBlock = (event) => {
    setFormState({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      categoryId: event.categoryId,
      notes: event.notes || "",
      reminderMinutes: Number(event.reminderMinutes || 0),
    });
    setEditingEventId(event.id);
    setErrorText("");
    setAddBlockOpen(true);
  };

  const hasOverlap = (candidateStart, candidateEnd, ignoreId = null) => {
    return selectedEvents.some((event) => {
      if (event.id === ignoreId) return false;
      const start = toMinutes(event.startTime);
      const end = toMinutes(event.endTime);
      return candidateStart < end && candidateEnd > start;
    });
  };

  const saveEvent = () => {
    if (!formState.title.trim()) return setErrorText("Please add a title.");
    if (!isValidTimeInput(formState.startTime) || !isValidTimeInput(formState.endTime)) {
      return setErrorText("Time must be in HH:MM format, for example 09:30.");
    }
    const start = toMinutes(formState.startTime);
    const end = toMinutes(formState.endTime);
    if (end <= start) return setErrorText("End time must be later than start time.");

    const category = categories.find((c) => c.id === formState.categoryId) || categories[0];
    const payload = {
      id: editingEventId || crypto.randomUUID(),
      title: formState.title.trim(),
      startTime: formState.startTime,
      endTime: formState.endTime,
      notes: formState.notes.trim(),
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color,
      categoryLight: category.light,
      categoryText: category.text,
      categoryBorder: category.border,
      reminderMinutes: Number(formState.reminderMinutes),
    };

    setEventsByDay((prev) => {
      const current = [...(prev[selectedKey] || [])];
      const next = editingEventId
        ? current.map((item) => (item.id === editingEventId ? payload : item))
        : [...current, payload];
      return { ...prev, [selectedKey]: next };
    });

    setAddBlockOpen(false);
    setErrorText("");
    setEditingEventId(null);
    setFormState((prev) => ({
      ...prev,
      title: "",
      notes: "",
      startTime: formState.endTime,
      endTime: fromMinutes(Math.min(end + settings.minuteStep, 23 * 60 + 59)),
    }));
  };

  const deleteEvent = (id) => {
    setEventsByDay((prev) => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] || []).filter((e) => e.id !== id),
    }));
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) return;
    const safeId = newCategory.name.toLowerCase().replace(/\s+/g, "-");
    setCategories((prev) => [
      ...prev,
      {
        id: `${safeId}-${Date.now()}`,
        name: newCategory.name.trim(),
        color: newCategory.solid,
        light: newCategory.light,
        text: newCategory.text,
        border: newCategory.border,
        icon: MoonStar,
      },
    ]);
    setNewCategory({ name: "", solid: "bg-violet-500", light: "bg-violet-100", text: "text-violet-700", border: "border-violet-300" });
  };

  const removeCategory = (categoryId) => {
    const fallback = categories.find((cat) => cat.id === "normal") || defaultCategories[1];
    const categoryToRemove = categories.find((cat) => cat.id === categoryId);
    if (!categoryToRemove || categories.length <= 1) return;

    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    setEventsByDay((prev) => {
      const updated = {};
      Object.entries(prev).forEach(([dayKey, events]) => {
        updated[dayKey] = events.map((event) => {
          if (event.categoryId !== categoryId) return event;
          return {
            ...event,
            categoryId: fallback.id,
            categoryName: fallback.name,
            categoryColor: fallback.color,
            categoryLight: fallback.light,
            categoryText: fallback.text,
            categoryBorder: fallback.border,
          };
        });
      });
      return updated;
    });

    if (formState.categoryId === categoryId) setFormState((prev) => ({ ...prev, categoryId: fallback.id }));
  };

  const addQuote = () => {
    if (!quoteForm.text.trim()) return;
    if (!quoteForm.type.trim()) return;
    setQuoteBank((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: quoteForm.text.trim(), source: quoteForm.source.trim(), type: quoteForm.type.trim() },
    ]);
    setQuoteForm({ text: "", source: "", type: "Hadith" });
  };

  const deleteQuote = (id) => setQuoteBank((prev) => prev.filter((item) => item.id !== id));

  const randomizePreviewQuote = () => {
    if (!quoteBank.length) return;
    const random = quoteBank[Math.floor(Math.random() * quoteBank.length)];
    setQuoteBank((prev) => {
      const next = [...prev];
      const index = next.findIndex((q) => q.id === random.id);
      if (index > 0) {
        const [item] = next.splice(index, 1);
        next.unshift(item);
      }
      return next;
    });
  };

  const saveAuth = () => {
    if (!authForm.email.trim() || !authForm.password.trim()) return;
    const nextUser = {
      fullName: authForm.fullName.trim() || authForm.email.split("@")[0],
      email: authForm.email.trim().toLowerCase(),
    };
    setUser(nextUser);
  };

  const logout = () => {
    setUser(null);
    setAuthForm({ fullName: "", email: "", password: "" });
  };

  const openDayScreen = (day) => {
    setSelectedDate(day);
    setActiveScreen("day");
  };

  const goToCalendar = () => setActiveScreen("calendar");
  const goToToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewDate(now);
    setActiveScreen("calendar");
  };
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_40%,_#eef2ff_100%)] p-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="rounded-[2rem] border-0 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Smart planner</p>
                  <h1 className="text-2xl font-bold">Time Block Mobile</h1>
                </div>
              </div>
              <p className="text-sm text-slate-300">Sign in to save your blocks, sections, reminder bank, colors, and daily preferences.</p>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="inline-flex rounded-2xl bg-slate-100 p-1 w-full">
                <button onClick={() => setAuthMode("login")} className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium ${authMode === "login" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}>Login</button>
                <button onClick={() => setAuthMode("signup")} className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium ${authMode === "signup" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}>Sign up</button>
              </div>
              {authMode === "signup" ? (
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input className="rounded-2xl h-11" value={authForm.fullName} onChange={(e) => setAuthForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Enter your full name" />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input className="rounded-2xl h-11" value={authForm.email} onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" className="rounded-2xl h-11" value={authForm.password} onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Enter your password" />
              </div>
              <Button onClick={saveAuth} className="w-full rounded-2xl h-12 text-base">
                <LogIn className="h-4 w-4 mr-2" />
                {authMode === "login" ? "Login" : "Create account"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4" style={{ background: backgroundValue }}>
      <div className="mx-auto max-w-md space-y-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-[2rem] border-0 shadow-xl overflow-hidden">
            <div className={`${darkBackground ? "bg-white/10 text-white" : "bg-slate-900 text-white"} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-sm ${darkBackground ? "text-slate-200" : "text-slate-300"}`}>Welcome back</p>
                  <h1 className="text-2xl font-bold truncate">{settings.appSectionName}</h1>
                  <p className={`mt-1 text-sm ${darkBackground ? "text-slate-200" : "text-slate-300"}`}>{prettyDate(selectedDate)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center font-semibold">{getInitials(user.fullName)}</div>
                </div>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white border p-3">
                  <p className="text-xs text-slate-400">Today</p>
                  <p className="text-lg font-semibold">{todayEvents.length}</p>
                </div>
                <div className="rounded-2xl bg-white border p-3">
                  <p className="text-xs text-slate-400">All blocks</p>
                  <p className="text-lg font-semibold">{totalBlocks}</p>
                </div>
                <div className="rounded-2xl bg-white border p-3">
                  <p className="text-xs text-slate-400">Selected</p>
                  <p className="text-lg font-semibold">{selectedDayHours.toFixed(1)}h</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                  <UserCircle2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full px-3 py-1">{selectedEvents.length} blocks</Badge>
                  <Button variant="outline" className="rounded-2xl h-9 px-3" onClick={goToToday}>
                    <SunMedium className="h-4 w-4 mr-2" /> Today
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="rounded-2xl" onClick={() => setSectionsOpen(true)}>
                  <FolderKanban className="h-4 w-4 mr-2" /> Sections
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => setQuoteBankOpen(true)}>
                  <Quote className="h-4 w-4 mr-2" /> Bank
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeScreen === "calendar" ? (
            <motion.div key="calendar-screen" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="space-y-4">
              {dayQuote && settings.showDailyQuoteCard ? (
                <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{dayQuote.type}</Badge>
                          <span className="text-xs text-slate-400">daily random reminder</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 leading-6">{dayQuote.text}</p>
                        {dayQuote.source ? <p className="mt-1 text-xs text-slate-500">{dayQuote.source}</p> : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white/95 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Month calendar</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="rounded-xl" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" className="rounded-xl" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </CardTitle>
                  <p className="text-sm text-slate-500">{viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {weekDays.map((d) => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {monthGrid.map((day) => {
                      const inMonth = day.getMonth() === viewDate.getMonth();
                      const isSelected = formatDateKey(day) === selectedKey;
                      const isToday = formatDateKey(day) === todayKey;
                      const dayCount = countForDay(day);
                      const dayColors = colorsForDay(day);
                      const weekend = isWeekend(day);
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => openDayScreen(day)}
                          className={`relative rounded-2xl p-2 min-h-[88px] border text-left transition-all ${
                            isSelected ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white hover:bg-white border-slate-200"
                          } ${!inMonth ? "opacity-40" : "opacity-100"} ${settings.showWeekendHighlights && weekend && !isSelected ? "ring-1 ring-amber-100" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-sm font-bold ${isToday && !isSelected ? "text-blue-600" : ""}`}>{day.getDate()}</span>
                            {dayCount > 0 ? (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white text-slate-900" : "bg-slate-100 text-slate-700"}`}>{dayCount}</span>
                            ) : null}
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 space-y-1">
                            {dayColors.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {dayColors.map((color, idx) => <div key={`${color}-${idx}`} className={`h-1.5 flex-1 rounded-full ${color}`} />)}
                              </div>
                            ) : (
                              <div className={`h-1.5 rounded-full ${isSelected ? "bg-white/20" : weekend ? "bg-amber-100" : "bg-slate-100"}`} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="day-screen" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="space-y-4">
              <Card className="rounded-[2rem] border-0 shadow-lg overflow-hidden bg-white/95 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={goToCalendar}><ArrowLeft className="h-4 w-4" /></Button>
                      <div className="min-w-0">
                        <span className="block truncate">{prettyDate(selectedDate)}</span>
                        <p className="text-sm text-slate-500 font-normal">24-hour calendar view with overlap support.</p>
                      </div>
                    </div>
                    <Button className="rounded-2xl shrink-0" onClick={openAddBlock}><Plus className="h-4 w-4 mr-2" /> Add</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-2">
                    <div className="grid grid-cols-[56px_1fr] gap-3">
                      <div className="relative" style={{ height: `${24 * hourHeight}px` }}>
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <div key={hour} className="absolute left-0 right-0 text-xs text-slate-400" style={{ top: `${hour * hourHeight - 8}px` }}>
                            {`${String(hour).padStart(2, "0")}:00`}
                          </div>
                        ))}
                      </div>

                      <div className="relative rounded-3xl border bg-white overflow-hidden" style={{ height: `${24 * hourHeight}px` }}>
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <div key={hour} className="absolute left-0 right-0 border-t border-slate-200" style={{ top: `${hour * hourHeight}px` }} />
                        ))}
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <div key={`half-${hour}`} className="absolute left-0 right-0 border-t border-dashed border-slate-100" style={{ top: `${hour * hourHeight + hourHeight / 2}px` }} />
                        ))}

                        {nowLinePosition !== null ? (
                          <div className="absolute left-0 right-0 z-20" style={{ top: `${nowLinePosition}px` }}>
                            <div className="relative h-0">
                              <div className="absolute -left-1 top-[-4px] h-2 w-2 rounded-full bg-red-500" />
                              <div className="border-t-2 border-red-500" />
                            </div>
                          </div>
                        ) : null}

                        {laidOutEvents.length === 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">No blocks for this day yet.</div>
                        ) : null}

                        {laidOutEvents.map((event) => {
                          const start = toMinutes(event.startTime);
                          const end = toMinutes(event.endTime);
                          const top = (start / 60) * hourHeight;
                          const height = Math.max(((end - start) / 60) * hourHeight, 40);
                          const widthCalc = `calc(${100 / event.totalColumns}% - 8px)`;
                          const leftCalc = `calc(${(100 / event.totalColumns) * event.columnIndex}% + 4px)`;
                          const overlap = hasOverlap(start, end, event.id);

                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => openEditBlock(event)}
                              className={`absolute rounded-2xl border shadow-sm p-2 overflow-hidden text-left transition hover:shadow-md ${event.categoryLight} ${event.categoryBorder || "border-transparent"}`}
                              style={{ top: `${top}px`, height: `${height}px`, left: leftCalc, width: widthCalc }}
                            >
                              <div className="flex items-start justify-between gap-2 h-full">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full ${event.categoryColor}`} />
                                    <p className={`font-semibold text-xs truncate ${event.categoryText}`}>{event.title}</p>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-1">{event.startTime} - {event.endTime}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{event.categoryName} • {eventDurationText(event.startTime, event.endTime)}</p>
                                  {height > 70 && event.notes ? <p className="text-[11px] text-slate-500 mt-1 line-clamp-3">{event.notes}</p> : null}
                                  {overlap && height > 55 ? <p className="text-[10px] text-slate-400 mt-1">Overlapping block</p> : null}
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                  <span className="h-7 w-7 rounded-xl bg-white/70 flex items-center justify-center"><Pencil className="h-3.5 w-3.5" /></span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={addBlockOpen} onOpenChange={(open) => { setAddBlockOpen(open); if (!open) { setEditingEventId(null); setErrorText(""); } }}>
          <DialogContent className="rounded-[2rem] max-w-md">
            <DialogHeader><DialogTitle>{editingEventId ? "Edit time block" : "Add time block"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {errorText ? <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errorText}</div> : null}
              <div className="space-y-2">
                <Label>Task title</Label>
                <Input value={formState.title} onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))} placeholder="Example: Organic chemistry lecture" className="rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start time</Label>
                  <Input value={formState.startTime} onChange={(e) => setFormState((prev) => ({ ...prev, startTime: e.target.value }))} placeholder="09:00" className="rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label>End time</Label>
                  <Input value={formState.endTime} onChange={(e) => setFormState((prev) => ({ ...prev, endTime: e.target.value }))} placeholder="10:00" className="rounded-2xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formState.categoryId} onValueChange={(value) => setFormState((prev) => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reminder</Label>
                  <Select value={String(formState.reminderMinutes)} onValueChange={(value) => setFormState((prev) => ({ ...prev, reminderMinutes: Number(value) }))}>
                    <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{[0, 5, 10, 15, 30, 60].map((m) => <SelectItem key={m} value={String(m)}>{m === 0 ? "At start time" : `${m} min before`}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formState.notes} onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes" className="rounded-2xl min-h-[90px]" />
              </div>
              <div className="flex gap-3">
                {editingEventId ? (
                  <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => { deleteEvent(editingEventId); setAddBlockOpen(false); setEditingEventId(null); }}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                ) : null}
                <Button onClick={saveEvent} className="flex-1 rounded-2xl h-11">{editingEventId ? "Save changes" : "Save block"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="rounded-[2rem] max-w-md">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Settings</DialogTitle></DialogHeader>
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label>Planner title</Label>
                <Input value={settings.appSectionName} onChange={(e) => setSettings((prev) => ({ ...prev, appSectionName: e.target.value }))} className="rounded-2xl" />
              </div>

              <div className="space-y-2">
                <Label>Minute division</Label>
                <Select value={String(settings.minuteStep)} onValueChange={(value) => setSettings((prev) => ({ ...prev, minuteStep: Number(value) }))}>
                  <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{minuteStepOptions.map((step) => <SelectItem key={step} value={String(step)}>Every {step} minutes</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Theme color</Label>
                <div className="grid grid-cols-2 gap-2">
                  {themeColors.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, themeColor: item.value, customThemeColor: item.value }))}
                      className={`rounded-2xl border p-3 text-left ${settings.themeColor === item.value ? "border-slate-900" : "border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: item.value }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <Input
                  value={settings.customThemeColor || settings.themeColor}
                  onChange={(e) => setSettings((prev) => ({ ...prev, customThemeColor: e.target.value, themeColor: e.target.value }))}
                  placeholder="#e0f2fe"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Background style</Label>
                <div className="space-y-2">
                  {backgroundStyles.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, backgroundStyle: item.value }))}
                      className={`w-full rounded-2xl border p-3 text-left ${settings.backgroundStyle === item.value ? "border-slate-900" : "border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notification sound</Label>
                <Select value={settings.notificationSound || "Device default"} onValueChange={(value) => setSettings((prev) => ({ ...prev, notificationSound: value }))}>
                  <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{soundOptions.map((sound) => <SelectItem key={sound} value={sound}>{sound}</SelectItem>)}</SelectContent>
                </Select>
                {settings.notificationSound === "Choose from device" ? (
                  <Input value={settings.deviceSoundName || ""} onChange={(e) => setSettings((prev) => ({ ...prev, deviceSoundName: e.target.value }))} placeholder="Device sound name or file" className="rounded-2xl" />
                ) : null}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Music2 className="h-4 w-4" />
                  <span>Prototype mode stores the selected sound name. A real mobile build would open device sounds directly.</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <div>
                    <p className="font-medium">Block notifications</p>
                    <p className="text-sm text-slate-500">Show reminder popup notifications</p>
                  </div>
                  <Switch checked={settings.notificationsEnabled} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notificationsEnabled: checked }))} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <div>
                    <p className="font-medium">Daily random reminder</p>
                    <p className="text-sm text-slate-500">Show one random item from your bank</p>
                  </div>
                  <Switch checked={settings.randomReminderEnabled} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, randomReminderEnabled: checked }))} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <div>
                    <p className="font-medium">Show daily quote card</p>
                    <p className="text-sm text-slate-500">Display the reminder card above the month calendar</p>
                  </div>
                  <Switch checked={settings.showDailyQuoteCard} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showDailyQuoteCard: checked }))} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <div>
                    <p className="font-medium">Weekend highlight</p>
                    <p className="text-sm text-slate-500">Add a subtle style to Saturday and Sunday</p>
                  </div>
                  <Switch checked={settings.showWeekendHighlights} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showWeekendHighlights: checked }))} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                  <div>
                    <p className="font-medium">Auto focus today</p>
                    <p className="text-sm text-slate-500">Keep the calendar focused on today when enabled</p>
                  </div>
                  <Switch checked={settings.autoOpenToday} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoOpenToday: checked }))} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border bg-white p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">Signed in as {user.email}</p>
                  <p className="text-sm text-slate-500">Preferences are saved for this user</p>
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={sectionsOpen} onOpenChange={setSectionsOpen}>
          <DialogContent className="rounded-[2rem] max-w-md">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5" /> Sections</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-2xl border p-3 bg-white gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-4 w-4 rounded-full ${cat.color}`} />
                      <span className="font-medium truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary">section</Badge>
                      <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={() => removeCategory(cat.id)} disabled={categories.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border p-4 space-y-4 bg-slate-50">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={newCategory.name} onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))} placeholder="Example: Labs" className="rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((option) => (
                      <button key={option.solid} type="button" onClick={() => setNewCategory((prev) => ({ ...prev, solid: option.solid, light: option.light, text: option.text, border: option.border }))} className={`h-11 rounded-2xl border-2 ${option.solid} ${newCategory.solid === option.solid ? "border-slate-900" : "border-transparent"}`} />
                    ))}
                  </div>
                </div>
                <Button onClick={addCategory} className="w-full rounded-2xl">Add section</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={quoteBankOpen} onOpenChange={setQuoteBankOpen}>
          <DialogContent className="rounded-[2rem] max-w-md">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Quote className="h-5 w-5" /> Reminder bank</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="rounded-2xl flex-1" onClick={randomizePreviewQuote}><Shuffle className="h-4 w-4 mr-2" /> Random preview</Button>
              </div>

              <div className="rounded-2xl border p-4 space-y-3 bg-slate-50">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={quoteForm.type} onChange={(e) => setQuoteForm((prev) => ({ ...prev, type: e.target.value }))} placeholder="Example: Hadith, Dua, Motivation" className="rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Textarea value={quoteForm.text} onChange={(e) => setQuoteForm((prev) => ({ ...prev, text: e.target.value }))} placeholder="Write the hadith or sentence" className="rounded-2xl min-h-[90px]" />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Input value={quoteForm.source} onChange={(e) => setQuoteForm((prev) => ({ ...prev, source: e.target.value }))} placeholder="Optional source" className="rounded-2xl" />
                </div>
                <Button onClick={addQuote} className="w-full rounded-2xl">Add to bank</Button>
              </div>

              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={quoteSearch} onChange={(e) => setQuoteSearch(e.target.value)} placeholder="Search bank" className="rounded-2xl pl-9 pr-9" />
                {quoteSearch ? <button type="button" onClick={() => setQuoteSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-4 w-4" /></button> : null}
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {filteredQuotes.length === 0 ? <div className="rounded-2xl border p-4 text-sm text-slate-400">No items found in your reminder bank.</div> : null}
                {filteredQuotes.map((item) => (
                  <div key={item.id} className="rounded-2xl border p-3 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1"><Badge variant="secondary">{item.type}</Badge></div>
                        <p className="text-sm text-slate-700 leading-6">{item.text}</p>
                        {item.source ? <p className="text-xs text-slate-500 mt-1">{item.source}</p> : null}
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 shrink-0" onClick={() => deleteQuote(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
