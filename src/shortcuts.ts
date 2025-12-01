/* список заданий урока — оставьте только те сочетания,
   которые браузер действительно отдаёт странице */
export const shortcuts = [
  { desc: "Сохранить",      combo: "ctrl+s"  },
  { desc: "Копировать",     combo: "ctrl+c"  },
  { desc: "Вставить",       combo: "ctrl+v"  },
  { desc: "Вырезать",       combo: "ctrl+x"  },
  { desc: "Поиск",          combo: "ctrl+f"  },
  { desc: "Выделить всё",   combo: "ctrl+a"  },
  { desc: "Отменить",       combo: "ctrl+z"  },
];

/* ❶  — перемешиваем массив целиком (Фишер-Йетс) */
export function getShuffledShortcuts() {
  const arr = [...shortcuts];                 // копия, чтобы не трогать оригинал
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ❷  — если где-то нужно одиночное случайное задание */
export function getRandomShortcut() {
  return shortcuts[Math.floor(Math.random() * shortcuts.length)];
}
