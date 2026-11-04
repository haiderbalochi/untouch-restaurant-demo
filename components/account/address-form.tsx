"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/overlay";
import { Button, Field, Input, Textarea, Toggle } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import { createAddress, saveAddress, type AddressInput } from "@/lib/data/user";
import type { Address } from "@/lib/types";

const empty: AddressInput = {
  label: "Home",
  fullName: "",
  phone: "",
  house: "",
  street: "",
  area: "",
  city: "Karachi",
  postalCode: "",
  instructions: "",
  isDefault: false,
};

export function AddressForm({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Address | null;
  onSaved?: (id: string) => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<AddressInput>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      initial
        ? {
            label: initial.label,
            fullName: initial.fullName,
            phone: initial.phone,
            house: initial.house,
            street: initial.street,
            area: initial.area,
            city: initial.city,
            postalCode: initial.postalCode,
            instructions: initial.instructions,
            isDefault: initial.isDefault,
          }
        : { ...empty, fullName: "", phone: "" },
    );
  }, [open, initial]);

  function update<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) {
      setError("Please sign in again to save an address.");
      return;
    }
    if (!form.fullName.trim() || !form.phone.trim() || !form.house.trim() || !form.street.trim()) {
      setError("Name, phone, house/apartment and street are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (initial) {
        await saveAddress(user.uid, initial.id, form);
        toast.success("Address updated");
        onSaved?.(initial.id);
      } else {
        const id = await createAddress(user.uid, form);
        toast.success("Address saved");
        onSaved?.(id);
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the address.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit address" : "New delivery address"}
      description="We only use this to deliver your order."
      size="lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label" htmlFor="address-label">
            <Input
              id="address-label"
              value={form.label}
              onChange={(event) => update("label", event.target.value)}
              placeholder="Home, Office…"
            />
          </Field>
          <Field label="Full name" htmlFor="address-name">
            <Input
              id="address-name"
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Phone" htmlFor="address-phone">
            <Input
              id="address-phone"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="+92 3xx xxx xxxx"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </Field>
          <Field label="House / apartment" htmlFor="address-house">
            <Input
              id="address-house"
              value={form.house}
              onChange={(event) => update("house", event.target.value)}
              placeholder="House 24, Apt 3B"
              required
            />
          </Field>
          <Field label="Street" htmlFor="address-street">
            <Input
              id="address-street"
              value={form.street}
              onChange={(event) => update("street", event.target.value)}
              placeholder="Khayaban-e-Shahbaz"
              required
            />
          </Field>
          <Field label="Area" htmlFor="address-area">
            <Input
              id="address-area"
              value={form.area}
              onChange={(event) => update("area", event.target.value)}
              placeholder="DHA Phase VI"
            />
          </Field>
          <Field label="City" htmlFor="address-city">
            <Input
              id="address-city"
              value={form.city}
              onChange={(event) => update("city", event.target.value)}
            />
          </Field>
          <Field label="Postal code" htmlFor="address-postal">
            <Input
              id="address-postal"
              value={form.postalCode}
              onChange={(event) => update("postalCode", event.target.value)}
              inputMode="numeric"
            />
          </Field>
        </div>

        <Field label="Delivery instructions" htmlFor="address-instructions" hint="Optional — gate code, floor, landmarks.">
          <Textarea
            id="address-instructions"
            value={form.instructions}
            onChange={(event) => update("instructions", event.target.value)}
            placeholder="Ring the bell twice, leave with the guard…"
            className="min-h-20"
          />
        </Field>

        <div className="rounded-xl border border-cream/10 px-4">
          <Toggle
            checked={form.isDefault}
            onChange={(next) => update("isDefault", next)}
            label="Set as default address"
            description="Used automatically at checkout."
          />
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={saving}>
            {initial ? "Save changes" : "Save address"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
