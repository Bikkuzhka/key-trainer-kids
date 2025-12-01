import { useEffect, useRef, useCallback } from 'react';
import './WelcomeScreen.css';

const iconVariants = [
  { src: '/alien.png',     className: 'icon-alien'     },
  { src: '/rocket.png',    className: 'icon-rocket'    },
  { src: '/planet.png',    className: 'icon-planet'    },
  { src: '/ufo.png',       className: 'icon-ufo'       },
  { src: '/astronaut.png', className: 'icon-astronaut' },
  { src: '/question.png',  className: 'icon-comet'     }
];
const ICONS_POSITIONS = [
  // Левая сторона
  { top: "3vh",   left: "calc(50% - 44vw)" },
  { top: "8vh",   left: "calc(50% - 33vw)" },
  { top: "14vh",  left: "calc(50% - 41vw)" },
  { top: "20vh",  left: "calc(50% - 29vw)" },
  { top: "25vh",  left: "calc(50% - 46vw)" },
  { top: "31vh",  left: "calc(50% - 37vw)" },
  { top: "37vh",  left: "calc(50% - 27vw)" },
  { top: "42vh",  left: "calc(50% - 40vw)" },
  { top: "48vh",  left: "calc(50% - 31vw)" },
  { top: "54vh",  left: "calc(50% - 43vw)" },
  { top: "60vh",  left: "calc(50% - 35vw)" },
  { top: "66vh",  left: "calc(50% - 28vw)" },
  { top: "71vh",  left: "calc(50% - 39vw)" },
  { top: "76vh",  left: "calc(50% - 45vw)" },
  { top: "81vh",  left: "calc(50% - 33vw)" },
  { top: "87vh",  left: "calc(50% - 41vw)" },
  { top: "92vh",  left: "calc(50% - 29vw)" },

  // Правая сторона
 { top: "3vh",   left: "calc(50% + 45vw)" },
  { top: "6vh",   left: "calc(50% + 30vw)" },
  { top: "14vh",  left: "calc(50% + 42vw)" },
  { top: "22vh",  left: "calc(50% + 32vw)" },
  { top: "25vh",  left: "calc(50% + 39vw)" },
  { top: "22vh",  left: "calc(50% + 22vw)" },
  { top: "37vh",  left: "calc(50% + 32vw)" },
  { top: "42vh",  left: "calc(50% + 21vw)" },
  { top: "48vh",  left: "calc(50% + 44vw)" },
  { top: "54vh",  left: "calc(50% + 30vw)" },
  { top: "60vh",  left: "calc(50% + 41vw)" },
  { top: "66vh",  left: "calc(50% + 23vw)" },
  { top: "71vh",  left: "calc(50% + 35vw)" },
  { top: "76vh",  left: "calc(50% + 45vw)" },
  { top: "81vh",  left: "calc(50% + 30vw)" },
  { top: "87vh",  left: "calc(50% + 40vw)" },
  { top: "92vh",  left: "calc(50% + 24vw)" },
]
type WelcomeScreenProps = {
  onStart: () => void;
};
export default function WelcomeScreen({ onStart }: WelcomeScreenProps) { 
  const iconsRef = useRef<(HTMLImageElement | null)[]>([]);
  const setIconRef = useCallback((i: number) => (el: HTMLImageElement | null) => {
    iconsRef.current[i] = el;
  }, []);

  useEffect(() => {
    let raf: number;
    function animate() {
      const t = Date.now() / 1300;
      iconsRef.current.forEach((img, i) => {
        if (!img) return;
        const amplitude = 16 + (i % 3) * 7;
        const wave = Math.sin(t + i * 1.7) * amplitude;
        img.style.transform = `translateY(${wave}px)`;
      });
      raf = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="welcome-bg">
      {ICONS_POSITIONS.map((pos, i) => {
        const icon = iconVariants[i % iconVariants.length];
        return (
          <img
            key={i}
            ref={setIconRef(i)}
            src={icon.src}
            className={`floating-bg-icon ${icon.className}`}
            style={{
              position: 'fixed',
              ...pos,
              zIndex: 2,
              width: 84,
              height: 84,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 20px #5fffdc)',
              transition: 'filter 0.15s'
            }}
            alt=""
          />
        );
      })}
      <div className="welcome-card big-card" style={{ position: 'relative' }}>
        <h1 className="logo-title-multi one-line">
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

        <div className="pixel-main-text cosmic-adventure" style={{ marginTop: 38, marginBottom: 36 }}>
          Отправляйся в <span className="adventure-glow">космическое приключение</span>
        </div>
        <div className="mini-desc cosmic-desc" style={{ marginBottom: 48 }}>
          🚀 Учи горячие клавиши, выполняй <b>космические задания</b> и становись мастером клавиатурных комбо!
        </div>
          <button
            className="welcome-btn-on-sign"
            onClick={onStart} 
          >
            НАЧАТЬ КВЕСТ
          </button>

        <div
          className="parent-note big-parent-note visible-note"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 36,
            margin: '0 auto',
            textAlign: 'center',
            maxWidth: 700,
            width: '100%',
            display: 'block',
            fontWeight: 500,
            zIndex: 3
          }}
        >
          Клави-КосмоКвест — это игровой тренажёр, который помогает детям быстро и весело запоминать полезные горячие клавиши для компьютера.<br />
          Подходит для новичков и маленьких любителей приключений!
        </div>
      </div>
    </div>
  );
}
