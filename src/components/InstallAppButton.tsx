"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { Download, X, Share, Plus, MoreVertical } from "lucide-react";

/** Evento no estándar de instalación de PWA (Chromium). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// --- Store externo: ¿la app corre ya instalada (modo standalone)? ---
function subscribeStandalone(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getStandaloneSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}
function getStandaloneServerSnapshot(): boolean {
  return false;
}

/** Detecta iOS/iPadOS (incluye iPad que se hace pasar por Mac con pantalla táctil). */
function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iDevice = /iphone|ipad|ipod/i.test(ua);
  const iPadOS = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iDevice || iPadOS;
}

/**
 * Botón "Descargar app" para instalar la PWA sin App Store / Play Store.
 *  - Android/Chrome (y escritorio compatible): dispara el prompt nativo.
 *  - iOS/Safari (no soporta el prompt): muestra instrucciones para
 *    "Añadir a pantalla de inicio".
 * Se oculta si la app ya está instalada (corriendo en modo standalone).
 */
export default function InstallAppButton() {
  const installed = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot
  );
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onBIP = (e: Event) => {
      // Evita el mini-infobar del navegador para usar nuestro botón.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      try {
        await deferred.userChoice;
      } catch {
        /* el usuario cerró el prompt */
      }
      setDeferred(null);
    } else {
      // iOS o navegador sin prompt nativo: mostramos instrucciones.
      setShowHelp(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gold-lux/40 text-gold-lux text-xs font-bold uppercase tracking-[0.15em] hover:bg-gold-lux/10 transition-colors"
      >
        <Download className="w-4 h-4" />
        Descargar app
      </button>

      {showHelp && <InstallHelp ios={isIOS()} onClose={() => setShowHelp(false)} />}
    </>
  );
}

function InstallHelp({ ios, onClose }: { ios: boolean; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-carbon text-arena border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-lux font-bold text-lg text-white">Instalar la app</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {ios ? (
          <ol className="space-y-3 text-sm text-arena/80">
            <li className="flex items-start gap-3">
              <Share className="w-5 h-5 text-gold-lux flex-shrink-0 mt-0.5" />
              <span>
                Toca el botón <b className="text-white">Compartir</b> en la barra de Safari
                (el cuadrado con la flecha hacia arriba).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Plus className="w-5 h-5 text-gold-lux flex-shrink-0 mt-0.5" />
              <span>
                Elige <b className="text-white">“Añadir a pantalla de inicio”</b> y confirma con
                <b className="text-white"> Añadir</b>.
              </span>
            </li>
            <li className="text-arena/60">
              La app quedará en tu inicio como cualquier otra, sin App Store.
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 text-sm text-arena/80">
            <li className="flex items-start gap-3">
              <MoreVertical className="w-5 h-5 text-gold-lux flex-shrink-0 mt-0.5" />
              <span>
                Abre el menú del navegador (<b className="text-white">⋮</b> arriba a la derecha).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Download className="w-5 h-5 text-gold-lux flex-shrink-0 mt-0.5" />
              <span>
                Toca <b className="text-white">“Instalar app”</b> o
                <b className="text-white"> “Añadir a pantalla principal”</b>.
              </span>
            </li>
            <li className="text-arena/60">
              Se instala en el dispositivo sin Play Store.
            </li>
          </ol>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gold-lux text-carbon text-xs font-bold uppercase tracking-wider hover:bg-gold-lux/90 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
