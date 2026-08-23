import { BookOpen, DatabaseBackup, Menu, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import React, { useState } from "react";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/lessons/new", label: "تحضير جديد" },
  { href: "/library", label: "المكتبة" },
  { href: "/lessons", label: "الدروس المحفوظة" },
  { href: "/exams", label: "الاختبارات" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/archive", label: "الأرشيف" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const prefetch = (href: string) => {
    if (href === "/lessons") {
      void utils.lessons.list.prefetch();
    }
    if (href === "/library") {
      void utils.library.list.prefetch();
    }
    if (href === "/settings") {
      void utils.settings.get.prefetch();
    }
    if (href === "/question-bank") {
      void utils.questionBank.list.prefetch();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-white shadow-lg shadow-primary/20">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-foreground sm:inline">
            دفتر التحضير الذكي
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="التنقل الرئيسي"
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => prefetch(link.href)}
              onFocus={() => prefetch(link.href)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/8 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/settings"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            الإعدادات
          </Link>
          <Link
            href="/backup"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <DatabaseBackup className="h-4 w-4" />
            النسخ الاحتياطي
          </Link>
          <Link
            href="/lessons/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            دخول مساحة العمل
          </Link>
        </div>

        <button
          type="button"
          aria-label="فتح قائمة التنقل"
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
          className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background px-4 py-4 lg:hidden">
          <nav
            className="container flex flex-col gap-2"
            aria-label="التنقل المحمول"
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                onMouseEnter={() => prefetch(link.href)}
                onFocus={() => prefetch(link.href)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/8 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              onMouseEnter={() => prefetch("/settings")}
              onFocus={() => prefetch("/settings")}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/8 hover:text-primary"
            >
              الإعدادات
            </Link>
            <Link
              href="/backup"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/8 hover:text-primary"
            >
              <DatabaseBackup className="h-4 w-4" />
              النسخ الاحتياطي
            </Link>
            <Link
              href="/lessons/new"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" />
              دخول مساحة العمل
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
