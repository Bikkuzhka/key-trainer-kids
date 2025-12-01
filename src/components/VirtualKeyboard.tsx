import { useEffect, useRef, useMemo, useState } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import * as Mousetrap from "mousetrap";

interface Props {
  combo: string;
  allowed: string[];
  onSuccess: () => void;
}

const keyboardLayout = {
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = backspace",
    "tab q w e r t y u i o p [ ] \\",
    "caps a s d f g h j k l ; ' enter",
    "Shift z x c v b n m , . / Shift",
    "Ctrl Cmd Alt space Alt Cmd Menu Ctrl"
  ]
};

function comboToKeys(combo: string): string[] {
  return combo.split("+").map(k => k.trim()).filter(Boolean);
}

function normalizeKeyName(e: KeyboardEvent): string {
  if (e.code === "ControlLeft" || e.code === "ControlRight") return "Ctrl";
  if (e.code === "ShiftLeft"   || e.code === "ShiftRight")   return "Shift";
  if (e.code === "AltLeft"     || e.code === "AltRight")     return "Alt";
  if (e.code === "MetaLeft"    || e.code === "MetaRight")    return "Cmd";
  if (e.code === "ContextMenu") return "Menu";
  if (e.code === "Space")      return "space";
  if (e.code === "Escape")     return "esc";
  if (e.code === "Backspace")  return "backspace";
  if (e.code === "Enter")      return "enter";
  if (e.code === "Tab")        return "tab";
  if (e.code === "CapsLock")   return "caps";
  if (/^Digit[0-9]$/.test(e.code)) return e.code.slice(5);
  if (/^Key[A-Z]$/.test(e.code))   return e.code.slice(3).toLowerCase();
  if (e.code === "Minus")     return "-";
  if (e.code === "Equal")     return "=";
  if (e.code === "BracketLeft")  return "[";
  if (e.code === "BracketRight") return "]";
  if (e.code === "Backslash") return "\\";
  if (e.code === "Semicolon") return ";";
  if (e.code === "Quote")     return "'";
  if (e.code === "Comma")     return ",";
  if (e.code === "Period")    return ".";
  if (e.code === "Slash")     return "/";
  if (e.code === "Backquote") return "`";
  return e.key;
}

export default function VirtualKeyboard({ combo, allowed, onSuccess }: Props) {
  const ding = useRef(new Audio("/ding.mp3"));
  const buzz = useRef(new Audio("/fail.mp3"));
  const norm = (s: string) => s.trim().toLowerCase();
  const allowedSet = useMemo(() => new Set(allowed.map(norm)), [allowed]);
  const [pressed, setPressed] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successKeys, setSuccessKeys] = useState<string[]>([]);
  const pressedButtons = pressed.join(" ");
  const successButtons = successKeys.join(" ");
  const ev2str = (e: KeyboardEvent) => {
    const p: string[] = [];
    if (e.ctrlKey)  p.push("Ctrl");
    if (e.altKey)   p.push("Alt");
    if (e.shiftKey) p.push("Shift");
    if (e.metaKey)  p.push("Meta");
    p.push(normalizeKeyName(e));
    return p.join("+");
  };

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      const key = normalizeKeyName(e);
      setPressed(p => (p.includes(key) ? p : [...p, key]));
    };
    const handleUp = (e: KeyboardEvent) => {
      const key = normalizeKeyName(e);
      setPressed(p => p.filter(k => k !== key));
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      setPressed([]);
    };
  }, []);

  useEffect(() => {
    Mousetrap.bind(combo, () => {
      ding.current.currentTime = 0;
      ding.current.play().catch(() => {});
      setSuccessKeys(comboToKeys(combo)); 
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessKeys([]);
      }, 300);
      onSuccess();
      return false;
    });

    const listener = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)) return;
      if (["control", "shift", "alt", "meta"].includes(e.key.toLowerCase())) return;
      const comboPressed = norm(ev2str(e));
      if (!allowedSet.has(comboPressed)) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        buzz.current.currentTime = 0; buzz.current.play().catch(() => {});
        return;
      }
      if (comboPressed !== norm(combo)) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        buzz.current.currentTime = 0; buzz.current.play().catch(() => {});
      }
    };
    window.addEventListener("keydown", listener, { passive: false });

    return () => {
      Mousetrap.unbind(combo);
      window.removeEventListener("keydown", listener);
    };
  }, [combo, allowedSet, onSuccess]);

  return (
    <div className="keyboard-outer">
      <div className="keyboard-inner">
        <Keyboard
          layout={keyboardLayout}
          buttonTheme={[
            showSuccess
              ? { class: "success-key", buttons: successButtons }
              : { class: "pressed-key", buttons: pressedButtons }
          ]}
          physicalKeyboardHighlight={false}
          physicalKeyboardHighlightPress={false}
        />
      </div>
    </div>
  );
}
