export const themeKey = "piano-sprout:theme";
export const themes = [
  {
    id: "sprout",
    label: "Sprout",
    description: "Xanh dịu, sáng và gần gũi",
    color: "#f7f8fa",
  },
  {
    id: "command-line",
    label: "Command Line",
    description: "Nền tối, chữ xanh và monospace",
    color: "#000000",
  },
  {
    id: "visual-code",
    label: "Visual Code",
    description: "Xám than với điểm nhấn xanh dương",
    color: "#181c22",
  },
  {
    id: "warm-paper",
    label: "Warm Paper",
    description: "Sắc giấy ấm cho giờ luyện tập",
    color: "#f3ecdf",
  },
  {
    id: "playful-retro",
    label: "Playful Retro Neo-Brutalism",
    description: "Nền kem, màu pastel và viền đen vui nhộn",
    color: "#fff8e9",
  },
] as const;
export type Theme = (typeof themes)[number]["id"];
export function parseTheme(value: unknown): Theme {
  return themes.some((theme) => theme.id === value)
    ? (value as Theme)
    : "sprout";
}
