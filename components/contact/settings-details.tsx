"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useSettings } from "@/lib/hooks";

export function SettingsAwareDetails() {
  const { data: settings } = useSettings();
  const rows = [
    { icon: MapPin, label: "Kitchen", value: settings.address },
    { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    {
      icon: Clock,
      label: "Hours",
      value: `${settings.openTime} – ${settings.closeTime}, daily`,
    },
  ];

  return (
    <div className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-6">
      <p className="eyebrow text-cream/30">Find us</p>
      <ul className="mt-4 space-y-4">
        {rows.map((row) => (
          <li key={row.label} className="flex gap-3">
            <row.icon className="mt-0.5 size-4 shrink-0 text-ember-3/80" />
            <div>
              <p className="text-[0.64rem] uppercase tracking-[0.14em] text-cream/25">{row.label}</p>
              {row.href ? (
                <a
                  href={row.href}
                  className="mt-0.5 block text-[0.86rem] leading-relaxed text-cream/70 hover:text-cream"
                >
                  {row.value}
                </a>
              ) : (
                <p className="mt-0.5 text-[0.86rem] leading-relaxed text-cream/70">{row.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
