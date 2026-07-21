"use client";

import React, { useEffect, useState } from "react";
import { Bell, BellRing, BellOff, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

type Status = "loading" | "unsupported" | "off" | "on" | "denied" | "working";

/** Convierte la llave VAPID base64url a Uint8Array para pushManager.subscribe. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Interruptor para activar las notificaciones push de nuevos pedidos en ESTE
 * dispositivo. Pide permiso, se suscribe y guarda la suscripción en el servidor.
 * No se muestra si el navegador no soporta push o no hay llave VAPID.
 */
export default function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      if (!VAPID_PUBLIC_KEY || !supported) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? "on" : "off");
      } catch {
        if (!cancelled) setStatus("off");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = async () => {
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setStatus(res.ok ? "on" : "off");
    } catch {
      setStatus("off");
    }
  };

  const disable = async () => {
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch {
      setStatus("on");
    }
  };

  if (status === "loading" || status === "unsupported") return null;

  const base =
    "inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider rounded-full font-bold transition-colors";

  if (status === "denied") {
    return (
      <span
        className={`${base} bg-flamenco-light text-flamenco cursor-help`}
        title="Las notificaciones están bloqueadas en el navegador. Actívalas en los ajustes del sitio."
      >
        <BellOff className="w-4 h-4" /> Notif. bloqueadas
      </span>
    );
  }

  if (status === "on") {
    return (
      <button type="button" onClick={disable} className={`${base} bg-cactus/15 text-cactus hover:bg-cactus/25`}>
        <BellRing className="w-4 h-4" /> Notificaciones activas
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      disabled={status === "working"}
      className={`${base} btn-primary disabled:opacity-60`}
    >
      {status === "working" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
      Activar notificaciones
    </button>
  );
}
