"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AddressForm } from "@/components/account/address-form";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { Badge, Button, EmptyState, Field, Input, Skeleton, StatusPill, Toggle } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { deleteAddress, makeDefaultAddress, subscribeAddresses, subscribeUserOrders } from "@/lib/data/user";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { orderToCartLines } from "@/lib/reorder";
import type { Address, Order } from "@/lib/types";
import { cdnImage, formatDate, initials, money } from "@/lib/utils";

function Heading({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-cream/10 pb-6">
      <h1 className="font-display text-[2rem] leading-tight text-cream">{title}</h1>
      <p className="mt-2 text-[0.86rem] text-cream/45">{description}</p>
    </div>
  );
}

export function ProfileView() {
  const { user, profile, saveProfile, resetPassword } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile?.displayName ?? user?.displayName ?? "");
    setPhone(profile?.phone ?? "");
    setPhoto(profile?.photoURL ?? user?.photoURL ?? "");
  }, [profile, user]);

  if (!user) return null;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveProfile({ displayName: name, phone, photoURL: photo });
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, "avatar");
      setPhoto(url);
      await saveProfile({ photoURL: url });
      toast.success("Photo updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Heading title="Your profile" description="How we address you and reach you about an order." />
      <form onSubmit={save} className="mt-7 space-y-6">
        <div className="flex items-center gap-5">
          <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-ember/20 font-mono text-sm text-ember-3">
            {photo ? (
              <Image src={photo} alt="" width={80} height={80} className="size-20 object-cover" />
            ) : (
              initials(name || user.email || "U")
            )}
          </span>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="size-3.5" /> Change photo
            </Button>
            <p className="mt-2 text-[0.68rem] text-cream/30">
              JPG or PNG, up to 8 MB. Uploaded through Cloudinary.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="profile-name">
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Phone" htmlFor="profile-phone">
            <Input
              id="profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="tel"
              autoComplete="tel"
              placeholder="+92 3xx xxx xxxx"
            />
          </Field>
          <Field label="Email" htmlFor="profile-email" hint="Email is tied to your sign-in method.">
            <Input id="profile-email" value={user.email ?? ""} disabled />
          </Field>
          <Field label="Member since" htmlFor="profile-since">
            <Input
              id="profile-since"
              value={profile?.createdAt ? formatDate(profile.createdAt) : "—"}
              disabled
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="md" loading={saving}>
            <Check className="size-4" /> Save changes
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={async () => {
              if (!user.email) return;
              try {
                await resetPassword(user.email);
                toast.success("Password reset link sent to your email.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not send the link.");
              }
            }}
          >
            <KeyRound className="size-4" /> Reset password
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AddressesView() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeAddresses(user.uid, (list) => {
      setAddresses(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div>
      <div className="flex items-end justify-between border-b border-cream/10 pb-6">
        <div>
          <h1 className="font-display text-[2rem] leading-tight text-cream">Saved addresses</h1>
          <p className="mt-2 text-[0.86rem] text-cream/45">Skip the typing at checkout.</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="size-3.5" /> Add
        </Button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-2xl" />
            ))
          : addresses.map((address) => (
              <div
                key={address.id}
                className="flex flex-col justify-between rounded-2xl border border-cream/10 bg-cream/[0.02] p-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-ember-3/80" />
                    <p className="text-[0.85rem] text-cream/80">{address.label}</p>
                    {address.isDefault ? <Badge tone="warm">Default</Badge> : null}
                  </div>
                  <p className="mt-3 text-[0.8rem] text-cream/60">
                    {address.fullName} · {address.phone}
                  </p>
                  <p className="mt-1 text-[0.76rem] leading-relaxed text-cream/35">
                    {[address.house, address.street, address.area, address.city, address.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {address.instructions ? (
                    <p className="mt-2 text-[0.7rem] text-cream/25">“{address.instructions}”</p>
                  ) : null}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-cream/8 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(address);
                      setOpen(true);
                    }}
                    className="text-[0.68rem] uppercase tracking-[0.14em] text-cream/45 hover:text-cream"
                  >
                    Edit
                  </button>
                  {!address.isDefault ? (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!user) return;
                        await makeDefaultAddress(user.uid, address.id);
                        toast.success("Default address updated.");
                      }}
                      className="text-[0.68rem] uppercase tracking-[0.14em] text-cream/45 hover:text-cream"
                    >
                      Make default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("Remove this address?")) return;
                      if (!user) return;
                      await deleteAddress(user.uid, address.id);
                      toast.success("Address removed.");
                    }}
                    className="ml-auto inline-flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-cream/30 hover:text-red-300"
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
      </div>

      {!loading && addresses.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<MapPin className="size-6" />}
          title="No addresses saved yet."
          description="Add your first address now, or save one during checkout."
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Add address
            </Button>
          }
        />
      ) : null}

      <AddressForm open={open} onClose={() => setOpen(false)} initial={editing} />
    </div>
  );
}

export function OrdersView() {
  const { user } = useAuth();
  const { addRaw, openDrawer } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeUserOrders(user.uid, (list) => {
      setOrders(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div>
      <Heading title="My orders" description="Every order, live status, and one-tap reorder." />

      <div className="mt-7 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package className="size-6" />}
            title="No orders yet."
            description="Your first order is one signature dish away."
            action={
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink"
              >
                Browse the menu
              </Link>
            }
          />
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5 transition-colors hover:border-cream/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/order/${order.orderNumber}`}
                    className="font-display text-lg text-cream/90 hover:text-cream"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-[0.72rem] text-cream/35">
                    {formatDate(order.createdAt, { hour: "2-digit", minute: "2-digit" })} ·{" "}
                    {order.items.length} {order.items.length === 1 ? "dish" : "dishes"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={order.status} />
                  <StatusPill status={order.paymentStatus} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 4).map((item, index) => (
                    <span
                      key={`${item.productId}-${index}`}
                      className="relative size-10 overflow-hidden rounded-lg border border-ink bg-ink-3"
                    >
                      {item.image ? (
                        <Image src={cdnImage(item.image, 120)} alt="" fill sizes="40px" className="object-cover" />
                      ) : null}
                    </span>
                  ))}
                </div>
                <p className="text-[0.8rem] text-cream/45">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items ·{" "}
                  <span className="text-cream/75">{money(order.total)}</span>
                </p>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      orderToCartLines(order).forEach((line) => addRaw(line));
                      toast.success("Items added to your cart.");
                      openDrawer();
                    }}
                  >
                    <RotateCcw className="size-3.5" /> Reorder
                  </Button>
                  <Link
                    href={`/order/${order.orderNumber}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cream/18 px-4 text-[0.68rem] uppercase tracking-[0.14em] text-cream/70 transition-colors hover:bg-cream/6"
                  >
                    Track <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export function SettingsView() {
  const router = useRouter();
  const { user, profile, saveProfile, signOutUser, resetPassword } = useAuth();
  const [prefs, setPrefs] = useState({ orderUpdates: true, offers: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setPrefs(profile.notificationPrefs);
  }, [profile]);

  if (!user) return null;

  async function updatePrefs(next: { orderUpdates: boolean; offers: boolean }) {
    setPrefs(next);
    setSaving(true);
    try {
      await saveProfile({ notificationPrefs: next });
    } catch {
      toast.error("Could not save notification preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Heading title="Settings" description="Notifications, security and session." />

      <section className="mt-8 rounded-2xl border border-cream/10 p-6">
        <p className="eyebrow text-cream/35">Notifications</p>
        <div className="mt-2 divide-y divide-cream/8">
          <Toggle
            checked={prefs.orderUpdates}
            onChange={(next) => updatePrefs({ ...prefs, orderUpdates: next })}
            label="Order updates"
            description="Status changes and delivery updates for your orders."
            disabled={saving}
          />
          <Toggle
            checked={prefs.offers}
            onChange={(next) => updatePrefs({ ...prefs, offers: next })}
            label="Offers & new dishes"
            description="Occasional notes about specials and seasonal menus."
            disabled={saving}
          />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-cream/10 p-6">
        <p className="eyebrow text-cream/35">UNTOUCH app</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.86rem] text-cream/80">Install on your home screen</p>
            <p className="mt-1 text-[0.76rem] text-cream/40">
              Keep the menu, cart and order updates one tap away in a full-screen window.
            </p>
          </div>
          <InstallPrompt variant="button" />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-cream/10 p-6">
        <p className="eyebrow text-cream/35">Security</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.86rem] text-cream/80">Password</p>
            <p className="mt-1 text-[0.76rem] text-cream/40">
              We'll email a secure reset link to {user.email}.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!user.email) return;
              try {
                await resetPassword(user.email);
                toast.success("Reset link sent.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not send the link.");
              }
            }}
          >
            <KeyRound className="size-3.5" /> Send reset link
          </Button>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-cream/10 p-6">
        <p className="eyebrow text-cream/35">Session</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[0.8rem] text-cream/45">Signed in as {user.email}</p>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              await signOutUser();
              toast.success("Signed out.");
              router.push("/");
            }}
          >
            <LogOut className="size-3.5" /> Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
