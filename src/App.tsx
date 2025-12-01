import { useState, useEffect, useRef } from "react";
import VirtualKeyboard from "./components/VirtualKeyboard";
import { getShuffledShortcuts, shortcuts } from "./shortcuts";
import WelcomeScreen from "./components/WelcomeScreen";
import GalacticSearch from "./components/GalacticSearch";
import AsteroidArchiver from "./components/AsteroidArchiver";
import SaveNavigationMission from "./components/SaveNavigationMission";
import FinalMission from "./components/FinalMission";
import StoryScreen from "./components/StoryScreen";
import "./App.css";

const allowedCombos = shortcuts.map(s => s.combo);

type Screen =
  | "story_trainer"
  | "trainer"
  | "story_galactic"
  | "galactic"
  | "story_asteroid"
  | "asteroid"
  | "story_navigation"
  | "navigation"
  | "story_final"
  | "final"
  | "epilogue";

export default function App() {
  const [started, setStarted] = useState(false);
  const [queue, setQueue] = useState(() => getShuffledShortcuts());
  const [task, setTask] = useState(queue[0]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [screen, setScreen] = useState<Screen>("trainer");
  const ding = useRef(typeof Audio !== "undefined" ? new Audio("/ding.mp3") : null);

  useEffect(() => {
    setShowHint(false);
    const id = setTimeout(() => setShowHint(true), 3000);
    return () => clearTimeout(id);
  }, [task]);

  useEffect(() => {
    if (!started || screen !== "trainer") return;
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [started, screen]);

  useEffect(() => {
    setTask(queue[0]);
  }, [queue]);

  const handleSuccess = () => {
    if (ding.current) {
      ding.current.currentTime = 0;
      ding.current.play().catch(() => {});
    }
    setScore(s => s + 1);
    setQueue(prevQ => {
      const [, ...rest] = prevQ;
      const newQ = rest.length ? rest : getShuffledShortcuts();
      setTask(newQ[0]);
      return newQ;
    });
  };

  if (!started) {
    return (
      <WelcomeScreen
        onStart={() => {
          setStarted(true);
          setScreen("story_trainer");
        }}
      />
    );
  }

  if (screen === "story_trainer") {
    return (
      <StoryScreen
        story="trainer"
        onNext={() => {
          setQueue(getShuffledShortcuts());
          setTask(shortcuts[0]);
          setScore(0);
          setTimeLeft(30);
          setShowHint(false);
          setScreen("trainer");
        }}
      />
    );
  }

  if (screen === "story_galactic") {
    return (
      <StoryScreen
        story="galactic"
        onNext={() => setScreen("galactic")}
      />
    );
  }

  if (screen === "story_asteroid") {
    return (
      <StoryScreen
        story="asteroid"
        onNext={() => setScreen("asteroid")}
      />
    );
  }

  if (screen === "story_navigation") {
    return (
      <StoryScreen
        story="navigation"
        onNext={() => setScreen("navigation")}
      />
    );
  }

  if (screen === "story_final") {
    return (
      <StoryScreen
        story="final"
        onNext={() => setScreen("final")}
      />
    );
  }

  if (screen === "epilogue") {
    return (
      <StoryScreen
        story="epilogue"
        onNext={() => {
          setStarted(false);
          setScreen("trainer");
          setScore(0);
          setTimeLeft(30);
        }}
      />
    );
  }

  if (screen === "galactic") {
    return (
      <GalacticSearch
        onNextMission={() => setScreen("story_asteroid")} 
      />
    );
  }

  if (screen === "asteroid") {
    return (
      <AsteroidArchiver
        onMissionComplete={() => setScreen("story_navigation")}
      />
    );
  }

  if (screen === "navigation") {
    return (
      <SaveNavigationMission
        onFinish={() => setScreen("story_final")}
      />
    );
  }

  if (screen === "final") {
    return (
      <FinalMission
        onQuestComplete={() => {
          setScreen("epilogue");
        }}
      />
    );
  }

  if (timeLeft === 0 && screen === "trainer") {
    return (
      <div className="main-glow-frame kid-bg">
        <div className="cosmo-square-frame">
          <div className="cosmo-frame-content">
            <h1 className="pixel-title logo-title">
              <span className="logo-ch pink">К</span>
              <span className="logo-ch blue">л</span>
              <span className="logo-ch mint">а</span>
              <span className="logo-ch yellow">в</span>
              <span className="logo-ch pink">и</span>
              <span className="logo-ch dash">-</span>
              <span className="logo-ch sky">К</span>
              <span className="logo-ch red">о</span>
              <span className="logo-ch blue">с</span>
              <span className="logo-ch mint">м</span>
              <span className="logo-ch orange">о</span>
              <span className="logo-ch violet">К</span>
              <span className="logo-ch blue">в</span>
              <span className="logo-ch mint">е</span>
              <span className="logo-ch pink">с</span>
              <span className="logo-ch yellow">т</span>
            </h1>
            <div className="cosmo-finish">
              <p className="finish-title">
                Тренировка завершена! <span role="img" aria-label="party">🎉</span>
              </p>
              <p className="finish-score">
                Твой космический счёт: <span className="finish-points">{score}</span>
              </p>
              <p className="finish-emoji">🌟👾🚀</p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "18px",
                justifyContent: "center",
                marginTop: 32
              }}
            >
              <button
                className="cosmo-btn-back"
                onClick={() => {
                  setQueue(getShuffledShortcuts());
                  setTask(shortcuts[0]);
                  setScore(0);
                  setTimeLeft(10);
                  setShowHint(false);
                }}
              >
                Перезапуск миссии👨‍🚀🚀
              </button>
              <button
                className="cosmo-btn-next"
                onClick={() => setScreen("story_galactic")}
              >
                Продолжить полёт🛸✨
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-glow-frame kid-bg">
      <div className="cosmo-square-frame">
        <div className="cosmo-frame-content">
          <h1 className="pixel-title logo-title">
            <span className="logo-ch pink">К</span>
            <span className="logo-ch blue">л</span>
            <span className="logo-ch mint">а</span>
            <span className="logo-ch yellow">в</span>
            <span className="logo-ch pink">и</span>
            <span className="logo-ch dash">-</span>
            <span className="logo-ch sky">К</span>
            <span className="logo-ch red">о</span>
            <span className="logo-ch blue">с</span>
            <span className="logo-ch mint">м</span>
            <span className="logo-ch orange">о</span>
            <span className="logo-ch violet">К</span>
            <span className="logo-ch blue">в</span>
            <span className="logo-ch mint">е</span>
            <span className="logo-ch pink">с</span>
            <span className="logo-ch yellow">т</span>
          </h1>
          <div className="kid-stats cosmo-stats">
            <span role="img" aria-label="clock" className="star-emoji">🪐</span>
            <span className="kid-time">{timeLeft}с</span>
            <span role="img" aria-label="star" className="star-emoji">⭐</span>
            <span className="kid-score">{score}</span>
          </div>
          <h2 className="kid-task cosmo-task">
            <span role="img" aria-label="arrow" className="task-emoji">👨‍🚀</span>
            <span className="kid-task-text">{task.desc}</span>
            {showHint && (
              <span className="combo">
                <kbd>{task.combo}</kbd>
              </span>
            )}
          </h2>
        </div>
      </div>
      <VirtualKeyboard
        combo={task.combo}
        allowed={allowedCombos}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
