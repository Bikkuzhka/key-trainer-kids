import { useEffect, useState } from "react";
import "./AsteroidArchiver.css";
import { useGlobalHotkeys } from "../HotkeyProvider";

type AsteroidArchiverProps = {
  onMissionComplete: () => void;
};

type Packet = {
  id: number;
  title: string;
  content: string;
};

const INITIAL_PACKETS: Packet[] = [
  {
    id: 0,
    title: "Пакет 1",
    content: "ЛОГ: AST-01\nСИГНАЛ: 78.2%\nСЕКТОР: Z-19"
  },
  {
    id: 1,
    title: "Пакет 2",
    content: "ЛОГ: AST-02\nСИГНАЛ: 63.9%\nСЕКТОР: K-07"
  },
  {
    id: 2,
    title: "Пакет 3",
    content: "ЛОГ: AST-03\nСИГНАЛ: 91.4%\nСЕКТОР: Q-42"
  }
];

export default function AsteroidArchiver({
  onMissionComplete
}: AsteroidArchiverProps) {
  const { setHandler } = useGlobalHotkeys();
  const [packets, setPackets] = useState<Packet[]>(INITIAL_PACKETS);
  const [archiveSlots, setArchiveSlots] = useState<string[]>(["", "", ""]);
  const [focusedPacket, setFocusedPacket] = useState<number | null>(0);
  const [focusedArchive, setFocusedArchive] = useState<number | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
  const [cutBuffer, setCutBuffer] = useState<string | null>(null);
  const allPacketsEmpty = packets.every(p => !p.content);
  const archiveFull = archiveSlots.every(slot => !!slot);
  const isWin = allPacketsEmpty && archiveFull;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;              
      const isMod = e.ctrlKey || e.metaKey; 

      if (!isMod) return;

      if (code === "KeyA") {
        if (focusedPacket !== null) {
          const packet = packets[focusedPacket];
          if (packet && packet.content) {
            e.preventDefault();
            setSelectedPacket(focusedPacket);
          }
        }
        return;
      }

      if (code === "KeyX") {
        if (
          focusedPacket !== null &&
          selectedPacket === focusedPacket
        ) {
          const packet = packets[focusedPacket];
          if (packet && packet.content) {
            e.preventDefault();
            setCutBuffer(packet.content);
            setPackets(prev =>
              prev.map((p, idx) =>
                idx === focusedPacket ? { ...p, content: "" } : p
              )
            );
            setSelectedPacket(null);
          }
        }
        return;
      }

      if (code === "KeyV") {
        if (cutBuffer && focusedArchive !== null) {
          const slotContent = archiveSlots[focusedArchive];
          if (!slotContent) {
            e.preventDefault();
            setArchiveSlots(prev =>
              prev.map((slot, idx) =>
                idx === focusedArchive ? cutBuffer : slot
              )
            );
            setCutBuffer(null);
          }
        }
        return;
      }
    };

    setHandler(handleKeyDown);
    return () => setHandler(null);
  }, [
    setHandler,
    packets,
    archiveSlots,
    focusedPacket,
    focusedArchive,
    selectedPacket,
    cutBuffer
  ]);

  return (
    <div className="galactic-bg">
      <div className="galactic-window">
        <h1 className="galactic-title">Миссия «Астероидный Архиватор»</h1>

        <p className="aa-hint">
          Выбери пакет → <span className="aa-key">Ctrl</span>+
          <span className="aa-key">A</span> (выделить всё) ➜{" "}
          <span className="aa-key">Ctrl</span>+
          <span className="aa-key">X</span> (вырезать) ➜ выбери слот архива ➜{" "}
          <span className="aa-key">Ctrl</span>+
          <span className="aa-key">V</span> (вставить).
        </p>

        <div className="aa-layout">
          <div className="aa-column">
            <h2 className="aa-subtitle">Пакеты данных</h2>

            {packets.map((packet, idx) => (
              <div
                key={packet.id}
                className={
                  "aa-card aa-packet-card" +
                  (focusedPacket === idx ? " aa-focused" : "") +
                  (selectedPacket === idx ? " aa-selected" : "") +
                  (!packet.content ? " aa-empty" : "")
                }
                tabIndex={0}
                onClick={() => {
                  setFocusedPacket(idx);
                  setFocusedArchive(null);
                }}
              >
                <div className="aa-card-title">{packet.title}</div>
                <div className="aa-card-body">
                  {packet.content || (
                    <span className="aa-placeholder">Пакет пуст</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="aa-column">
            <h2 className="aa-subtitle">Космический архив</h2>

            {archiveSlots.map((slot, idx) => (
              <div
                key={idx}
                className={
                  "aa-card aa-archive-card" +
                  (focusedArchive === idx ? " aa-focused" : "") +
                  (slot ? " aa-filled" : "")
                }
                tabIndex={0}
                onClick={() => {
                  setFocusedArchive(idx);
                  setFocusedPacket(null);
                  setSelectedPacket(null);
                }}
              >
                <div className="aa-card-title">Слот {idx + 1}</div>
                <div className="aa-card-body">
                  {slot || (
                    <span className="aa-placeholder">
                      Пока пусто — вставь сюда данные
                    </span>
                  )}
                </div>
              </div>
            ))}

            <div className="aa-buffer-status">
              Буфер:{" "}
              {cutBuffer ? (
                <span className="aa-buffer-filled">есть данные</span>
              ) : (
                <span className="aa-buffer-empty">пуст</span>
              )}
            </div>

            
            {isWin && (
              <button className="next-mission" onClick={onMissionComplete}>
                К следующей миссии
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
