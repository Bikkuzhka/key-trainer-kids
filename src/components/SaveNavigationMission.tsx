import { useEffect, useRef, useState } from "react";
import "./SaveNavigationMission.css";
import { useGlobalHotkeys } from "../HotkeyProvider";

type SaveNavigationMissionProps = {
  onFinish: () => void;
};

const INITIAL_ROUTES: string[] = [
  "МАРШРУТ A:\nX = 12.4\nY = 47.9\nСЕКТОР: ORI-7",
  "МАРШРУТ B:\nX = -3.2\nY = 18.6\nСЕКТОР: LYRA-3",
  "МАРШРУТ C:\nX = 88.1\nY = -12.5\nСЕКТОР: DRACO-9"
];

const TARGET_ROUTES: string[] = [
  "МАРШРУТ A:\nX = 14.4\nY = 50.0\nСЕКТОР: ORI-7",
  "МАРШРУТ B:\nX = -1.0\nY = 22.0\nСЕКТОР: LYRA-3",
  "МАРШРУТ C:\nX = 90.0\nY = -10.0\nСЕКТОР: DRACO-9"
];

const ROUTE_HINTS: string[] = [
  "Исправь координаты по образцу:\nX = 14.4\nY = 50.0\nСЕКТОР: ORI-7",
  "Исправь координаты по образцу:\nX = -1.0\nY = 22.0\nСЕКТОР: LYRA-3",
  "Исправь координаты по образцу:\nX = 90.0\nY = -10.0\nСЕКТОР: DRACO-9"
];

const ERROR_ROUTE_INDEX = 1;

export default function SaveNavigationMission({ onFinish }: SaveNavigationMissionProps) {
  const { setHandler } = useGlobalHotkeys();
  const [values, setValues] = useState<string[]>(INITIAL_ROUTES);
  const [savedFlags, setSavedFlags] = useState<boolean[]>([false, false, false]);
  const [dirtyFlags, setDirtyFlags] = useState<boolean[]>([false, false, false]);
  const [focusedRoute, setFocusedRoute] = useState<number | null>(0);
  const [errorInjected, setErrorInjected] = useState(false);
  const [errorFixed, setErrorFixed] = useState(false);
  const [errorOriginalValue, setErrorOriginalValue] = useState<string | null>(null);
  const [saveMessages, setSaveMessages] = useState<string[]>(["", "", ""]);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const focusedRouteRef = useRef<number | null>(0);
  const valuesRef = useRef<string[]>(INITIAL_ROUTES);
  const errorInjectedRef = useRef(false);
  const errorFixedRef = useRef(false);
  const errorOriginalValueRef = useRef<string | null>(null);

  useEffect(() => {
    focusedRouteRef.current = focusedRoute;
  }, [focusedRoute]);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    errorInjectedRef.current = errorInjected;
  }, [errorInjected]);

  useEffect(() => {
    errorFixedRef.current = errorFixed;
  }, [errorFixed]);

  useEffect(() => {
    errorOriginalValueRef.current = errorOriginalValue;
  }, [errorOriginalValue]);

  const handleChange = (index: number, text: string) => {
    setValues(prev => prev.map((v, i) => (i === index ? text : v)));
    setDirtyFlags(prev => prev.map((d, i) => (i === index ? true : d)));
    setSavedFlags(prev => prev.map((s, i) => (i === index ? false : s)));
  };

  const handleSaveRoute = (index: number) => {
    const current = (valuesRef.current[index] || "").trim();
    const target = TARGET_ROUTES[index].trim();
    const isCorrect = current === target;

    if (isCorrect) {
      setSavedFlags(prev => prev.map((s, i) => (i === index ? true : s)));
      setDirtyFlags(prev => prev.map((d, i) => (i === index ? false : d)));
      setSaveMessages(prev =>
        prev.map((msg, i) => (i === index ? "Сохранено!" : msg))
      );
    } else {
      setSavedFlags(prev => prev.map((s, i) => (i === index ? false : s)));
      setDirtyFlags(prev => prev.map((d, i) => (i === index ? true : d)));
      setSaveMessages(prev =>
        prev.map((msg, i) =>
          (i === index ? "Проверь маршрут по образцу справа" : msg)
        )
      );
    }

    setTimeout(() => {
      setSaveMessages(prev =>
        prev.map((msg, i) => (i === index ? "" : msg))
      );
    }, 1200);

    if (index === ERROR_ROUTE_INDEX && !errorInjectedRef.current && isCorrect) {
      setTimeout(() => {
        setValues(prev => {
          const original = prev[ERROR_ROUTE_INDEX];
          setErrorOriginalValue(original);
          setErrorInjected(true);
          setErrorFixed(false);
          return prev.map((v, i) =>
            i === ERROR_ROUTE_INDEX
              ? "⚠ ОШИБКА НАВИГАЦИИ: маршрут повреждён космической бурей"
              : v
          );
        });
        setInfoMessage(
          "Космическая буря! Маршрут повреждён — нажми Ctrl+Z на этом маршруте, чтобы вернуть данные."
        );
        setTimeout(() => setInfoMessage(null), 4000);
      }, 1500);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const code = e.code;                 
      const isMod = e.ctrlKey || e.metaKey; 

      if (!isMod) return;

      const focused = focusedRouteRef.current;
      const errInjected = errorInjectedRef.current;
      const errFixed = errorFixedRef.current;
      const errOriginal = errorOriginalValueRef.current;

      if (code === "KeyS") {
        if (focused !== null) {
          e.preventDefault();
          handleSaveRoute(focused);
        }
        return;
      }

      if (code === "KeyZ") {
        if (
          focused === ERROR_ROUTE_INDEX &&
          errInjected &&
          !errFixed &&
          errOriginal !== null
        ) {
          e.preventDefault();
          setValues(prev =>
            prev.map((v, i) =>
              i === ERROR_ROUTE_INDEX ? errOriginal : v
            )
          );
          setErrorFixed(true);
          setDirtyFlags(prev =>
            prev.map((d, i) => (i === ERROR_ROUTE_INDEX ? true : d))
          );
          setSavedFlags(prev =>
            prev.map((s, i) => (i === ERROR_ROUTE_INDEX ? false : s))
          );
          setInfoMessage(
            "Данные восстановлены! Теперь ещё раз сохрани маршрут (Ctrl+S)."
          );
          setTimeout(() => setInfoMessage(null), 4000);
        }
        return;
      }
    };

    setHandler(handler);
    return () => setHandler(null);
  }, [setHandler, handleSaveRoute]);

  const allSavedCorrect = savedFlags.every(Boolean);
  const missionDone = allSavedCorrect && errorInjected && errorFixed;

  return (
    <div className="galactic-bg">
      <div className="galactic-window">
        <h1 className="galactic-title">Миссия «Сохранить навигацию»</h1>

        <p className="nav-hint">
          Обнови координаты в маршрутах и нажимай{" "}
          <span className="nav-key">Ctrl+S</span>, чтобы сохранить.
          <br />
          <span className="nav-hint-second">
            Если буря повредит путь — восстанови его с помощью{" "}
            <span className="nav-key">Ctrl+Z</span> и снова сохрани.
          </span>
        </p>

        {infoMessage && <div className="nav-info">{infoMessage}</div>}

        <div className="nav-routes">
          {values.map((text, index) => (
            <div
              key={index}
              className={
                "nav-card" +
                (focusedRoute === index ? " nav-focused" : "") +
                (index === ERROR_ROUTE_INDEX && errorInjected && !errorFixed
                  ? " nav-error"
                  : "")
              }
            >
              <div className="nav-card-header">
                <span className="nav-title">Маршрут {index + 1}</span>
                <span
                  className={
                    "nav-status" +
                    (savedFlags[index] ? " nav-status-saved" : "") +
                    (dirtyFlags[index] ? " nav-status-dirty" : "")
                  }
                >
                  {savedFlags[index]
                    ? "Сохранено верно"
                    : dirtyFlags[index]
                    ? "Изменения не сохранены"
                    : "Нет изменений"}
                </span>
              </div>

              <div className="nav-card-body-row">
                <textarea
                  className="nav-textarea"
                  value={text}
                  onChange={e => handleChange(index, e.target.value)}
                  onFocus={() => setFocusedRoute(index)}
                />

                <div className="nav-hint-panel">
                  <div className="nav-hint-title">Образец маршрута</div>
                  <div className="nav-hint-text">
                    {ROUTE_HINTS[index]}
                  </div>
                </div>
              </div>

              {saveMessages[index] && (
                <div className="nav-toast">{saveMessages[index]}</div>
              )}
            </div>
          ))}
        </div>

        {missionDone && (
          <div className="nav-next-wrap">
            <button className="next-mission" onClick={onFinish}>
              К финальной миссии
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
