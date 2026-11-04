"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { push, ref, set } from "firebase/database";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { FIREBASE_READY, getDb } from "@/lib/firebase/client";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "General enquiry",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const db = getDb();
    if (!FIREBASE_READY || !db) {
      toast.error("Messaging is not connected yet. Add Firebase credentials to .env.local.");
      return;
    }
    if (form.message.trim().length < 10) {
      toast.error("Please add a little more detail.");
      return;
    }
    setBusy(true);
    try {
      const messageRef = push(ref(db, "messages"));
      await set(messageRef, {
        ...form,
        createdAt: new Date().toISOString(),
        status: "new",
      });
      setSent(true);
      setForm({ name: "", email: "", phone: "", topic: "General enquiry", message: "" });
      toast.success("Message received — we reply within one working day.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="contact-name">
          <Input
            id="contact-name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Email" htmlFor="contact-email">
          <Input
            id="contact-email"
            type="email"
            inputMode="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Phone" htmlFor="contact-phone" hint="Optional">
          <Input
            id="contact-phone"
            inputMode="tel"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            autoComplete="tel"
          />
        </Field>
        <Field label="Topic" htmlFor="contact-topic">
          <Select
            id="contact-topic"
            value={form.topic}
            onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
          >
            {[
              "General enquiry",
              "Private dining",
              "Large order / catering",
              "Order issue",
              "Partnership",
            ].map((topic) => (
              <option key={topic} value={topic} className="bg-ink">
                {topic}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Message" htmlFor="contact-message">
        <Textarea
          id="contact-message"
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className="min-h-32"
          maxLength={1200}
          required
        />
      </Field>
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.66rem] text-cream/25">
          {sent ? "Received — thank you." : "We answer every message, usually the same day."}
        </p>
        <Button type="submit" size="md" loading={busy}>
          <Send className="size-3.5" /> Send message
        </Button>
      </div>
    </form>
  );
}
