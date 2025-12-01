import { useEffect, useRef, useState } from "react";
import "./GalacticSearch.css";
import { useGlobalHotkeys } from "../HotkeyProvider";

const ALL_CODES = [
  "PHI-22", "ZETA-49", "OMEGA-77", "ALFA-72",
  "SIGMA-61", "NOVA-15", "CON-72", "UVIS-49",
  "OSP-55", "RIBG-62", "TAURI-77", "YETA-49",
  "VMCAR-71", "ULVA-72", "RAYER-35", "MCA-55",
  "XI-93", "DELTA-99", "BETA-69", "GAMMA-26",
  "LAMBDA-31", "THETA-11", "KAPPA-84", "EPSI-40",
  "META-66", "HELI-09", "TERRA-28", "ROXA-53",
  "QUARK-18", "DRACO-21", "PYRA-58", "ZENIT-64",
  "HYDRA-12", "PLASM-37", "VEGA-42", "LYRA-87",
  "ARION-73", "CORUS-29", "JUNO-83", "VORTA-59",
  "ORION-38", "TRION-07", "VARIS-19", "SIREN-33",
  "LETO-65", "REBUS-45", "SOLAR-88", "POLAR-96",
  "VEXEL-17", "CENTA-23", "URSA-75", "NEO-54",
  "SIRIUS-48", "ARCUS-41", "XENON-24", "GLOBE-27",
  "LINAR-14", "MEGA-79", "POSEI-10", "VULCA-52",
  "MATRIX-60", "TITAN-95", "SAGAN-08", "FERRO-70",
  "CARMA-13", "KELVIN-36", "ASTRA-81", "ORCA-56",
  "YURON-32", "DIONE-25", "VANTA-74", "PYXIS-57",
  "IONIX-34", "DORAD-86", "ANTAR-03", "HORIZ-94",
  "SEREN-63", "PEGAS-39", "FINIX-51", "HALON-20"
];

type GalacticSearchProps = {
  onNextMission: () => void;
};

function getRandomWords(count: number) {
  const words = Array.from(
    new Set(ALL_CODES.map(code => code.split("-")[0]))
  );
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words.slice(0, count);
}

function GalacticSearch({ onNextMission }: GalacticSearchProps) {
  const { setHandler } = useGlobalHotkeys(); 
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [secretWords, setSecretWords] = useState<string[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [fields, setFields] = useState(["", "", ""]);
  const [focusedField, setFocusedField] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedCodeRef = useRef<string | null>(null);
  const copiedCodeRef = useRef<string | null>(null);
  const focusedFieldRef = useRef<number | null>(null);
  const searchActiveRef = useRef<boolean>(false);

  useEffect(() => {
    setSecretWords(getRandomWords(3));
  }, []);

  useEffect(() => {
    selectedCodeRef.current = selectedCode;
  }, [selectedCode]);

  useEffect(() => {
    copiedCodeRef.current = copiedCode;
  }, [copiedCode]);

  useEffect(() => {
    focusedFieldRef.current = focusedField;
  }, [focusedField]);

  useEffect(() => {
    searchActiveRef.current = searchActive;
  }, [searchActive]);

 useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const code = e.code;                       
    const isMod = e.ctrlKey || e.metaKey;      

    const selected = selectedCodeRef.current;
    const copied = copiedCodeRef.current;
    const focused = focusedFieldRef.current;
    const searchIsActive = searchActiveRef.current;

    if (isMod && code === "KeyF") {
      e.preventDefault();
      setSearchActive(true);
      setTimeout(() => searchInputRef.current?.focus(), 30);
      return;
    }

    if (isMod && code === "KeyC") {
      if (selected) {
        e.preventDefault();
        setCopiedCode(selected);
      }
      return;
    }

    if (isMod && code === "KeyV") {
      if (copied && focused !== null) {
        e.preventDefault();
        setFields(prev =>
          prev.map((v, i) => (i === focused ? copied : v))
        );
        return;
      }

      if (copied && focused === null && searchIsActive) {
        e.preventDefault();
        setSearchValue(copied);
        return;
      }
    }
  };

  setHandler(handler);
  return () => setHandler(null);
}, [setHandler]);

  useEffect(() => {
    if (searchActive) searchInputRef.current?.focus();
  }, [searchActive]);

  function getFieldStatus(idx: number) {
    if (!fields[idx]) return "";
    return secretWords.some(word => fields[idx].startsWith(word + "-"))
      ? "correct"
      : "incorrect";
  }

  const usedWords = fields
    .map(val => secretWords.find(w => val.startsWith(w + "-")))
    .filter(Boolean);
  const isWin = usedWords.length === 3 && new Set(usedWords).size === 3;

  function handleCodeClick(code: string) {
    setSelectedCode(code);
  }

  function renderCode(code: string) {
    if (!searchValue) return code;
    const idx = code.toLowerCase().indexOf(searchValue.toLowerCase());
    if (idx === -1) return code;
    return (
      <>
        {code.substring(0, idx)}
        <span className="highlight">
          {code.substring(idx, idx + searchValue.length)}
        </span>
        {code.substring(idx + searchValue.length)}
      </>
    );
  }

  return (
    <div className="galactic-bg">
      <div
        className="galactic-window"
        ref={containerRef}
        tabIndex={-1}
      >
        <div className="galactic-title">Миссия «Галактический Поиск»</div>
        <div className="codes-panel">
          <div className="codes-table">
            <div className="header-row">
              <div className="header-cell">КОД:</div>
              <div className="header-cell"></div>
              <div className="header-cell"></div>
            </div>
            <div className="codes-grid">
              {ALL_CODES.map(code => (
                <div
                  key={code}
                  className={
                    "code-cell" +
                    (selectedCode === code ? " selected" : "") +
                    (searchValue &&
                    code.toLowerCase().includes(searchValue.toLowerCase())
                      ? " found"
                      : "")
                  }
                  onClick={() => handleCodeClick(code)}
                >
                  {renderCode(code)}
                </div>
              ))}
            </div>
          </div>

          <div className="search-block-right">
            <div className="search-box">
              {searchActive ? (
                <input
                  ref={searchInputRef}
                  className="galactic-search"
                  type="text"
                  placeholder="Поиск"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onBlur={() => setSearchActive(false)}
                  onPaste={e => e.preventDefault()} 
                />
              ) : (
                <button className="galactic-search-btn" type="button">
                  <span>Поиск</span> <span className="kbd">ctrl+f</span>
                </button>
              )}
            </div>

            <div className="secret-words-block">
              <div className="secret-words-title">Требуется найти:</div>
              <ul>
                {secretWords.map(w => (
                  <li
                    key={w}
                    className={
                      "secret-word" + (selectedCode === w ? " selected" : "")
                    }
                    onMouseDown={e => {
                      e.preventDefault();
                      handleCodeClick(w);
                    }}
                  >
                    {w}
                  </li>
                ))}
              </ul>

              {isWin && (
                <button className="next-mission" onClick={onNextMission}>
                  К следующей миссии
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="msg-fields">
          {fields.map((val, i) => (
            <div className={`msg-field ${getFieldStatus(i)}`} key={i}>
              <div className="msg-label">Сообщение для штаба</div>
              <input
                type="text"
                value={val}
                placeholder="Вставьте код (Ctrl+V)"
                tabIndex={0}
                onFocus={() => setFocusedField(i)}
                onBlur={() => setFocusedField(null)}
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
    setFields(prev =>
      prev.map((v, idx) => (idx === i ? "" : v))
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
          ))}
        </div>
      </div>
    </div>
  );
}

export default GalacticSearch;
