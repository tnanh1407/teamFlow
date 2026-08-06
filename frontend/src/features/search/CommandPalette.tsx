import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import searchService, { type SearchResults } from "@/services/search.service";
import { useAuth } from "@/stores/auth";

const EMPTY_RESULTS: SearchResults = { users: [], projects: [], tasks: [], departments: [], positions: [] };

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
}

function PaletteLoadingState() {
  return (
    <div className="space-y-3 px-3 py-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl px-3 py-2">
          <SkeletonBlock className="size-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
          <SkeletonBlock className="h-4 w-4 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  )
}

interface PaletteItem {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  enabled?: boolean;
}

const roleScopedRoutes = (role: string) => [
  ...(role === "admin" ? [{ label: "Tổng quan", path: "/dashboard", icon: <LayoutDashboard size={18} /> }] : []),
  ...(role !== "admin" ? [{ label: "Dự án", path: "/projects", icon: <FolderKanban size={18} /> }] : []),
  { label: "Người dùng", path: "/users", icon: <Users size={18} /> },
  ...(role === "admin"
    ? [
        { label: "Quản lý người dùng", path: "/users", icon: <UserRound size={18} /> },
        { label: "Phòng ban", path: "/departments", icon: <Building2 size={18} /> },
        { label: "Chức vụ", path: "/positions", icon: <ClipboardList size={18} /> },
      ]
    : []),
  { label: "Cài đặt", path: "/settings", icon: <Settings size={18} /> },
];

export default function CommandPalette({ open, onClose, enabled = true }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !enabled) {
      onClose();
    }
  }, [enabled, onClose, open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(EMPTY_RESULTS);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !enabled || !query.trim()) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchService.searchAll(query.trim());
        setResults(data);
      } catch {
        setResults(EMPTY_RESULTS);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [enabled, query, open]);

  const close = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  const go = useCallback(
    (path: string) => {
      close();
      navigate(path);
    },
    [close, navigate]
  );

  const items: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];

    if (!query.trim()) {
      for (const route of roleScopedRoutes(user?.role ?? "user")) {
        list.push({
          id: `action-${route.path}`,
          group: "Điều hướng nhanh",
          label: route.label,
          icon: route.icon,
          onSelect: () => go(route.path),
        });
      }
      return list;
    }

    if (user?.role !== "admin") {
      for (const p of results.projects) {
        list.push({
          id: `project-${p.id}`,
          group: "Dự án",
          label: p.title,
          sublabel: p.status,
          icon: <FolderKanban size={18} />,
          onSelect: () => go(`/projects/${p.id}`),
        });
      }

      for (const t of results.tasks) {
        list.push({
          id: `task-${t.id}`,
          group: "Công việc",
          label: t.title,
          sublabel: t.status,
          icon: <ListChecks size={18} />,
          onSelect: () => go(`/projects/${t.projectId}`),
        });
      }
    }

    for (const u of results.users) {
      list.push({
        id: `user-${u.id}`,
        group: "Người dùng",
        label: u.name,
        sublabel: u.username,
        icon: <UserRound size={18} />,
        onSelect: () => go(`/users/${u.id}`),
      });
    }

    if (user?.role === "admin") {
      for (const d of results.departments) {
        list.push({
          id: `department-${d.id}`,
          group: "Phòng ban",
          label: d.name,
          sublabel: d.code,
          icon: <Building2 size={18} />,
          onSelect: () => go(`/departments/${d.id}`),
        });
      }

      for (const p of results.positions) {
        list.push({
          id: `position-${p.id}`,
          group: "Chức vụ",
          label: p.name,
          sublabel: p.level,
          icon: <ClipboardList size={18} />,
          onSelect: () => go(`/positions/${p.id}`),
        });
      }
    }

    return list;
  }, [query, results, user, go]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) item.onSelect();
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    items.forEach((item, index) => {
      const arr = map.get(item.group) ?? [];
      arr.push({ ...item, id: `${item.id}::${index}` });
      map.set(item.group, arr);
    });
    return [...map.entries()].map(([group, groupItems]) => ({
      group,
      items: groupItems.map((item, i) => ({ ...item, flatIndex: i })),
    }));
  }, [items]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-3 pt-4 backdrop-blur-sm sm:px-4 sm:pt-[12vh]"
          onMouseDown={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="flex h-[calc(100vh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl sm:h-auto sm:max-h-[76vh]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
              <Search size={18} className="shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Tìm người dùng, dự án, công việc, phòng ban..."
                className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:h-14"
              />
              <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-2">
              {loading && (
                <PaletteLoadingState />
              )}

              {!loading && items.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {query.trim() ? "Không tìm thấy kết quả phù hợp" : "Gõ để tìm kiếm hoặc chọn trang nhanh bên dưới"}
                </div>
              )}

              {!loading &&
                grouped.map(({ group, items: groupItems }) => (
                  <div key={group} className="px-2 py-1">
                    <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </div>
                    {groupItems.map((item, idx) => (
                      <button
                        key={item.id}
                        data-index={idx}
                        onClick={item.onSelect}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                          activeIndex === idx ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {item.label}
                          </span>
                          {item.sublabel && (
                            <span className="block truncate text-xs text-muted-foreground">{item.sublabel}</span>
                          )}
                        </span>
                        <ArrowRight size={16} className="shrink-0 text-muted-foreground/60" />
                      </button>
                    ))}
                  </div>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
