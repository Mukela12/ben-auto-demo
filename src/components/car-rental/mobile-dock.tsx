"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dock, DockItem, DockIcon, DockLabel } from "@/components/ui/dock";
import { useMounted } from "@/hooks/use-mounted";

export function MobileDockWrapper() {
  const mounted = useMounted();
  if (!mounted) return null;
  return <MobileDock />;
}

const dockItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Fleet",
    href: "/fleet",
    icon: (
      <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: "Book",
    href: "/book",
    icon: (
      <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function MobileDock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center md:hidden">
      <Dock
        className="border border-border shadow-2xl shadow-black/20"
        magnification={56}
        distance={100}
        panelHeight={52}
        spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
      >
        {dockItems.map((item) => {
          const active = pathname === item.href;
          return (
            <DockItem key={item.href} className="cursor-pointer">
              <DockIcon
                className={active ? "text-[#ff5f00]" : "text-muted-foreground"}
              >
                <Link href={item.href} className="flex h-full w-full items-center justify-center">
                  {item.icon}
                </Link>
              </DockIcon>
              <DockLabel className="!bg-card !text-foreground !border-border">
                {item.label}
              </DockLabel>
            </DockItem>
          );
        })}
      </Dock>
    </div>
  );
}
