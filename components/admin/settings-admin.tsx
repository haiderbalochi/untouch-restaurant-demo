"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button, Field, Input, Skeleton, Textarea, Toggle } from "@/components/ui/primitives";
import { saveSettings, subscribeSettingsAdmin } from "@/lib/data/admin";
import { DEFAULT_SETTINGS } from "@/lib/data/catalog";
import { useDemoMode } from "@/lib/demo/mode";
import { useDemoStore } from "@/lib/demo/store";
import type { RestaurantSettings } from "@/lib/types";

export function SettingsAdmin() {
  const { demo } = useDemoMode();
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSettingsAdmin((value) => {
      setSettings(value);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function update<K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveSettings(settings);
      toast.success(
        demo
          ? "Demo settings saved in this browser."
          : "Restaurant settings saved — storefront updated live.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5">
        <p className="eyebrow text-cream/35">Identity</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Restaurant name" htmlFor="settings-name">
            <Input
              id="settings-name"
              value={settings.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </Field>
          <Field label="Phone" htmlFor="settings-phone">
            <Input
              id="settings-phone"
              value={settings.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor="settings-email">
            <Input
              id="settings-email"
              type="email"
              value={settings.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </Field>
          <Field label="Address" htmlFor="settings-address">
            <Input
              id="settings-address"
              value={settings.address}
              onChange={(event) => update("address", event.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4">
          <ImageUploader
            value={settings.logoUrl ? [settings.logoUrl] : []}
            onChange={(images) => update("logoUrl", images[0] ?? "")}
            scope="branding"
            multiple={false}
            label="Hero / branding image"
            hint="Used as the homepage hero artwork when set."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5">
        <p className="eyebrow text-cream/35">Service</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Delivery fee (PKR)" htmlFor="settings-delivery">
            <Input
              id="settings-delivery"
              type="number"
              min={0}
              value={settings.deliveryFee}
              onChange={(event) => update("deliveryFee", Number(event.target.value))}
            />
          </Field>
          <Field label="Minimum order (PKR)" htmlFor="settings-min">
            <Input
              id="settings-min"
              type="number"
              min={0}
              value={settings.minOrder}
              onChange={(event) => update("minOrder", Number(event.target.value))}
            />
          </Field>
          <Field label="Opens at" htmlFor="settings-open">
            <Input
              id="settings-open"
              type="time"
              value={settings.openTime}
              onChange={(event) => update("openTime", event.target.value)}
            />
          </Field>
          <Field label="Closes at" htmlFor="settings-close">
            <Input
              id="settings-close"
              type="time"
              value={settings.closeTime}
              onChange={(event) => update("closeTime", event.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3 rounded-xl border border-cream/10 px-4">
          <Toggle
            checked={settings.isOpen}
            onChange={(next) => update("isOpen", next)}
            label="Accepting orders"
            description="Turning this off blocks new checkouts with a clear message."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5">
        <p className="eyebrow text-cream/35">Website content</p>
        <div className="mt-4 space-y-4">
          <Field label="Hero kicker" htmlFor="settings-kicker">
            <Input
              id="settings-kicker"
              value={settings.content.heroKicker}
              onChange={(event) =>
                update("content", { ...settings.content, heroKicker: event.target.value })
              }
            />
          </Field>
          <Field label="Hero headline" htmlFor="settings-hero-title">
            <Input
              id="settings-hero-title"
              value={settings.content.heroTitle}
              onChange={(event) =>
                update("content", { ...settings.content, heroTitle: event.target.value })
              }
            />
          </Field>
          <Field label="Hero subtitle" htmlFor="settings-hero-subtitle">
            <Textarea
              id="settings-hero-subtitle"
              value={settings.content.heroSubtitle}
              onChange={(event) =>
                update("content", { ...settings.content, heroSubtitle: event.target.value })
              }
              className="min-h-20"
            />
          </Field>
          <Field label="Announcement bar" htmlFor="settings-announcement">
            <Input
              id="settings-announcement"
              value={settings.content.announcement}
              onChange={(event) =>
                update("content", { ...settings.content, announcement: event.target.value })
              }
            />
          </Field>
          <Field label="Story title" htmlFor="settings-story-title">
            <Input
              id="settings-story-title"
              value={settings.content.storyTitle}
              onChange={(event) =>
                update("content", { ...settings.content, storyTitle: event.target.value })
              }
            />
          </Field>
          <Field label="Story body" htmlFor="settings-story-body">
            <Textarea
              id="settings-story-body"
              value={settings.content.storyBody}
              onChange={(event) =>
                update("content", { ...settings.content, storyBody: event.target.value })
              }
              className="min-h-28"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5">
        <p className="eyebrow text-cream/35">Social links</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(["instagram", "facebook", "tiktok"] as const).map((network) => (
            <Field key={network} label={network} htmlFor={`settings-${network}`}>
              <Input
                id={`settings-${network}`}
                value={settings.socials[network]}
                onChange={(event) =>
                  update("socials", { ...settings.socials, [network]: event.target.value })
                }
                placeholder="https://"
              />
            </Field>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-2">
        {demo ? (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => {
              if (!window.confirm("Reset all demo products, promotions and orders to the sample seed?"))
                return;
              useDemoStore.getState().resetDemoData();
              setSettings(useDemoStore.getState().settings);
              toast.success("Demo data reset to the sample seed.");
            }}
          >
            Reset demo data
          </Button>
        ) : null}
        <Button type="submit" size="md" loading={saving}>
          <Check className="size-4" /> Save restaurant settings
        </Button>
      </div>
    </form>
  );
}
