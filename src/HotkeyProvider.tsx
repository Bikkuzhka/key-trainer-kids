import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef
} from "react";

type HotkeyHandler = (e: KeyboardEvent) => void;

type HotkeyContextValue = {
  setHandler: (handler: HotkeyHandler | null) => void;
};

const HotkeyContext = createContext<HotkeyContextValue | null>(null);

export const HotkeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handlerRef = useRef<HotkeyHandler | null>(null);

  const setHandler = useCallback((handler: HotkeyHandler | null) => {
    handlerRef.current = handler;
  }, []);

useEffect(() => {
  const listener = (e: KeyboardEvent) => {
    const handler = handlerRef.current;
    if (handler) {
      handler(e);
    }
  };

  document.addEventListener("keydown", listener, true);
  return () => {
    document.removeEventListener("keydown", listener, true);
  };
}, []);

  return (
    <HotkeyContext.Provider value={{ setHandler }}>
      {children}
    </HotkeyContext.Provider>
  );
};

export const useGlobalHotkeys = () => {
  const ctx = useContext(HotkeyContext);
  if (!ctx) {
    throw new Error("useGlobalHotkeys must be used inside <HotkeyProvider>");
  }
  return ctx;
};
