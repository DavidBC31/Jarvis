import { useEffect, useRef, useState } from "react";
import { getRecognitionCtor, type SpeechRecognitionLike } from "./useVoice";

// Détection d'un mot-clé d'activation (« Hey Jarvis ») en écoute continue, via la
// Web Speech API. À la détection, le texte qui suit le mot-clé est envoyé comme
// commande ; si rien ne suit, on « arme » l'écoute et la phrase suivante devient
// la commande (ex. « Hey Jarvis » … « quelle est la procédure ? »).
//
// `paused` coupe l'écoute (ex. pendant que Jarvis parle).

// Variantes tolérées (la reconnaissance fr-FR transcrit mal « Jarvis »).
const WAKE_VARIANTS = ["jarvis", "jarvice", "jarvise", "jarviss", "jervis", "djarvis"];
const ARM_TIMEOUT_MS = 8000;
const RESTART_DELAY_MS = 400;

export interface WakeState {
  supported: boolean;
  active: boolean; // en écoute
  armed: boolean; // mot-clé entendu, en attente de la question
  error: string | null;
  lastHeard: string; // dernier texte entendu (debug/retour visuel)
}

interface Options {
  enabled: boolean;
  paused?: boolean;
  lang?: string;
  onCommand: (text: string) => void;
}

function findWake(lower: string): number {
  let best = -1;
  let len = 0;
  for (const v of WAKE_VARIANTS) {
    const i = lower.lastIndexOf(v);
    if (i > best) {
      best = i;
      len = v.length;
    }
  }
  return best === -1 ? -1 : best + len;
}

export function useWakeWord({ enabled, paused = false, lang = "fr-FR", onCommand }: Options): WakeState {
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  const supported = typeof window !== "undefined" && getRecognitionCtor() !== null;
  const [active, setActive] = useState(false);
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeard, setLastHeard] = useState("");

  useEffect(() => {
    if (!enabled || paused) {
      setActive(false);
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Reconnaissance vocale non supportée par ce navigateur.");
      return;
    }

    let stopped = false;
    let fatal = false;
    let armedLocal = false;
    let armTimer: ReturnType<typeof setTimeout> | undefined;
    let restartTimer: ReturnType<typeof setTimeout> | undefined;

    const rec: SpeechRecognitionLike = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    const disarm = () => {
      armedLocal = false;
      setArmed(false);
      if (armTimer) clearTimeout(armTimer);
    };
    const arm = () => {
      armedLocal = true;
      setArmed(true);
      if (armTimer) clearTimeout(armTimer);
      armTimer = setTimeout(disarm, ARM_TIMEOUT_MS);
    };

    rec.onresult = (e) => {
      let interim = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += txt;
        else interim += txt;
      }
      setLastHeard((finalText || interim).trim());
      if (!finalText.trim()) return;

      const lower = finalText.toLowerCase();
      const after = findWake(lower);
      if (after >= 0) {
        const cmd = finalText.slice(after).replace(/^[\s,.:!?-]+/, "").trim();
        if (cmd.length >= 2) {
          disarm();
          onCommandRef.current(cmd);
        } else {
          arm();
        }
      } else if (armedLocal) {
        disarm();
        onCommandRef.current(finalText.trim());
      }
    };

    rec.onerror = (ev) => {
      const err = (ev && (ev as { error?: string }).error) || "";
      if (err === "not-allowed" || err === "service-not-allowed") {
        fatal = true;
        setError("Accès micro refusé. Autorise le micro dans le navigateur.");
      } else if (err === "audio-capture") {
        fatal = true;
        setError("Aucun micro détecté.");
      }
      // no-speech / aborted / network : on laisse onend relancer.
    };

    rec.onend = () => {
      setActive(false);
      if (!stopped && !fatal) {
        restartTimer = setTimeout(() => {
          try {
            rec.start();
          } catch {
            /* déjà démarré */
          }
        }, RESTART_DELAY_MS);
      }
    };

    try {
      setError(null);
      rec.start();
      setActive(true);
    } catch {
      /* InvalidStateError si déjà démarré : ignoré */
    }

    return () => {
      stopped = true;
      if (armTimer) clearTimeout(armTimer);
      if (restartTimer) clearTimeout(restartTimer);
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      setActive(false);
      setArmed(false);
    };
  }, [enabled, paused, lang]);

  return { supported, active, armed, error, lastHeard };
}
