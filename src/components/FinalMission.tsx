import { useEffect, useRef, useState } from "react";
import "./FinalMission.css";
import { useGlobalHotkeys } from "../HotkeyProvider";

type FinalMissionProps = {
  onQuestComplete: () => void;
};

const REQUIRED_CODES = ["RESCUE-KEY-7X", "ASTRO-CODE-4B", "GALAXY-PASS-9Z"];

type Snapshot = {
  panel: string[];
  cutCodes: string[];
};

const SLOT_HINTS = [
  "Ключ экстренного спасения (ищи в тексте слово «ключ»).",
  "Астро-код доступа (ищи в тексте слово «код»).",
  "Галактический пропуск (ищи в тексте слово «пропуск»)."
];

export default function FinalMission({ onQuestComplete }: FinalMissionProps) {
  const { setHandler } = useGlobalHotkeys();
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [cutCodes, setCutCodes] = useState<string[]>([]);
  const [panel, setPanel] = useState<string[]>(["", "", ""]);
  const [focusedPanelIndex, setFocusedPanelIndex] = useState<number | null>(
    null
  );
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [infoMessage] = useState<string | null>(null);
  const copiedCodeRef = useRef<string | null>(null);
  const cutCodesRef = useRef<string[]>([]);
  const panelRef = useRef<string[]>(["", "", ""]);
  const historyRef = useRef<Snapshot[]>([]);
  const focusedPanelIndexRef = useRef<number | null>(null);

  useEffect(() => {
    copiedCodeRef.current = copiedCode;
  }, [copiedCode]);

  useEffect(() => {
    cutCodesRef.current = cutCodes;
  }, [cutCodes]);

  useEffect(() => {
    panelRef.current = panel;
  }, [panel]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    focusedPanelIndexRef.current = focusedPanelIndex;
  }, [focusedPanelIndex]);

  const pushHistory = () => {
    const snapshot: Snapshot = {
      panel: [...panelRef.current],
      cutCodes: [...cutCodesRef.current]
    };
    setHistory(prev => [...prev, snapshot]);
  };

  const getSelectedRequiredCode = (): string | null => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || "";
    if (!text) return null;
    const found = REQUIRED_CODES.find(code => text.includes(code));
    return found || null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code; 
      const isMod = e.ctrlKey || e.metaKey; 

      const copied = copiedCodeRef.current;
      const focusedIdx = focusedPanelIndexRef.current;
      const currentHistory = historyRef.current;
      const currentPanel = panelRef.current;
      const currentCut = cutCodesRef.current;

      if (isMod && code === "KeyF") {
        e.preventDefault();
        setSearchActive(true);
        setTimeout(() => searchInputRef.current?.focus(), 20);
        return;
      }

      if (isMod && code === "KeyC") {
        const codeStr = getSelectedRequiredCode();
        if (codeStr) {
          e.preventDefault();
          setCopiedCode(codeStr);
        }
        return;
      }

      if (isMod && code === "KeyX") {
        const codeStr = getSelectedRequiredCode();
        if (codeStr) {
          e.preventDefault();
          pushHistory();
          setCopiedCode(codeStr);
          if (!currentCut.includes(codeStr)) {
            setCutCodes([...currentCut, codeStr]);
          }
        }
        return;
      }

      if (isMod && code === "KeyV") {
        if (focusedIdx !== null && copied) {
          e.preventDefault();
          pushHistory();
          setPanel(prev =>
            prev.map((v, idx) => (idx === focusedIdx ? copied : v))
          );
        }
        return;
      }

      if (isMod && code === "KeyZ") {
        if (currentHistory.length > 0) {
          e.preventDefault();
          const last = currentHistory[currentHistory.length - 1];
          setHistory(prev => prev.slice(0, prev.length - 1));
          setPanel(last.panel);
          setCutCodes(last.cutCodes);
        }
        return;
      }

      if (isMod && code === "KeyS") {
        e.preventDefault();
        const allPresent = REQUIRED_CODES.every(
          (c, idx) => currentPanel[idx] === c
        );

        if (allPresent) {
          setSaved(true);
          setSaveMessage("Коды сохранены! Ты спас Галактику! 🌌");
          setTimeout(() => setSaveMessage(null), 2500);
          setTimeout(() => onQuestComplete(), 2600);
        } else {
          setSaveMessage(
            "Не все коды на нужных местах. Проверь подсказки под слотами!"
          );
          setTimeout(() => setSaveMessage(null), 2000);
        }
        return;
      }
    };

    setHandler(handleKeyDown);
    return () => setHandler(null);
  }, [setHandler, onQuestComplete]);

  useEffect(() => {
    if (searchActive) {
      searchInputRef.current?.focus();
    }
  }, [searchActive]);

  const renderTextSegment = (text: string) => {
    if (!searchValue.trim()) return text;
    const lower = text.toLowerCase();
    const query = searchValue.toLowerCase();
    const idx = lower.indexOf(query);
    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + searchValue.length);
    const after = text.slice(idx + searchValue.length);

    return (
      <>
        {before}
        <span className="final-highlight">{match}</span>
        {after}
      </>
    );
  };

  const renderCodeToken = (code: string) => {
    const isCut = cutCodes.includes(code);
    const isFound =
      searchValue &&
      code.toLowerCase().includes(searchValue.toLowerCase());

    return (
      <span
        className={
          "final-code-token" +
          (isCut ? " cut" : "") +
          (isFound ? " found" : "")
        }
      >
        {code}
      </span>
    );
  };

  const allCodesPlaced = REQUIRED_CODES.every(
    (code, idx) => panel[idx] === code
  );

  return (
    <div className="galactic-bg">
      <div className="galactic-window final-window">
        <h1 className="galactic-title">Финальное испытание</h1>

        <p className="final-hint">
          Найди в сигнале три ключевых кода.{" "}
          <b>Используй поиск, чтобы найти нужные строки.</b>{" "}
          <b>Затем выдели код мышкой и скопируй или вырежи,</b>{" "}
          <b>
            вставь в кодовую панель, а когда все коды на месте — сохрани
            результат.
          </b>{" "}
          <b>Если ошибёшься — отмени действие.</b>{" "}
        </p>

        {infoMessage && <div className="final-info">{infoMessage}</div>}

        <div className="final-layout">
          <div className="final-signal-card">
            <div className="final-card-title">Кодированный сигнал</div>

            <div className="final-signal-body">
              <div className="final-line">
                {renderTextSegment(
                  "СЕГМЕНТ 01: Шум космического фона, помехи станции."
                )}
              </div>
              <div className="final-line">
                {renderTextSegment(
                  "СЕГМЕНТ 02: Обнаружены фрагменты старого протокола связи."
                )}
              </div>
              <div className="final-line">
                {renderTextSegment(
                  "СЕГМЕНТ 03: Найден ключ экстренного спасения "
                )}
                {renderCodeToken("RESCUE-KEY-7X")}
                {renderTextSegment(" в области туманности ORI.")}
              </div>
              <div className="final-line">
                {renderTextSegment(
                  "СЕГМЕНТ 04: Неизвестный астро-модуль активировал код "
                )}
                {renderCodeToken("ASTRO-CODE-4B")}
                {renderTextSegment(
                  " и запросил доступ к навигационному ядру."
                )}
              </div>
              <div className="final-line">
                {renderTextSegment(
                  "СЕГМЕНТ 05: Для выхода из критической зоны требуется пропуск "
                )}
                {renderCodeToken("GALAXY-PASS-9Z")}
                {renderTextSegment(
                  ", подтверждающий право на эвакуацию флота."
                )}
              </div>
              <div className="final-line">
                {renderTextSegment(
                  "СЕГМЕНТ 06: Остальные данные — космический шум и обрывки сообщений."
                )}
              </div>
            </div>

            <div className="final-search-block search-box">
              {searchActive ? (
                <input
                  ref={searchInputRef}
                  className="galactic-search"
                  type="text"
                  placeholder="Поиск"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onBlur={() => setSearchActive(false)}
                />
              ) : (
                <button className="galactic-search-btn" type="button">
                  <span>Поиск</span>
                </button>
              )}
            </div>
          </div>

          <div className="final-panel-card">
            <div className="final-card-title">Кодовая панель</div>
            <p className="final-panel-hint">
              Вставь в каждый слот правильный код.
            </p>

            <div className="final-panel-fields">
              {panel.map((value, idx) => {
                const expectedCode = REQUIRED_CODES[idx];
                const isCorrect = value === expectedCode;

                return (
                  <div
                    key={idx}
                    className={
                      "final-panel-field" +
                      (isCorrect ? " correct" : "") +
                      (!isCorrect && value ? " incorrect" : "")
                    }
                  >
                    <div className="final-panel-label">Слот {idx + 1}</div>
                    <div className="final-panel-subtitle">
                      {SLOT_HINTS[idx]}
                    </div>
                    <input
                      type="text"
                      className="final-panel-input"
                      value={value}
                      placeholder="Вставь код"
                      tabIndex={0}
                      onFocus={() => setFocusedPanelIndex(idx)}
                      onBlur={() => setFocusedPanelIndex(null)}
                      onKeyDown={e => {
                        const code = e.code;
                        const isMod = e.ctrlKey || e.metaKey;

                        const isCtrlV = isMod && code === "KeyV";
                        const isCtrlA = isMod && code === "KeyA";
                        const isCtrlC = isMod && code === "KeyC";
                        const isCtrlF = isMod && code === "KeyF";
                        const isCtrlX = isMod && code === "KeyX";
                        const isCtrlZ = isMod && code === "KeyZ";
                        const isCtrlS = isMod && code === "KeyS";

                        const isBackspace = e.key === "Backspace";
                        const isDelete = e.key === "Delete";
                        const navKeys = [
                          "Tab",
                          "Shift",
                          "ArrowLeft",
                          "ArrowRight",
                          "ArrowUp",
                          "ArrowDown",
                          "Home",
                          "End"
                        ];

                        if (isBackspace || isDelete) {
                          e.preventDefault();
                          pushHistory();
                          setPanel(prev =>
                            prev.map((v, i) => (i === idx ? "" : v))
                          );
                          return;
                        }

                        if (
                          isCtrlV ||
                          isCtrlA ||
                          isCtrlC ||
                          isCtrlF ||
                          isCtrlX ||
                          isCtrlZ ||
                          isCtrlS ||
                          navKeys.includes(e.key)
                        ) {
                          return;
                        }

                        e.preventDefault();
                      }}
                      onPaste={e => {
                        e.preventDefault();
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {saveMessage && (
              <div className="final-save-message">{saveMessage}</div>
            )}

            {allCodesPlaced && !saved && (
              <div className="final-save-hint">
                Все коды на своих местах! Сохрани миссию!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
