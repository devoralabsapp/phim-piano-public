// Apply the saved palette before the app renders. No credentials or account data.
(() => {
  let theme = "sprout";
  try {
    const saved = localStorage.getItem("piano-sprout:theme");
    if (
      [
        "sprout",
        "command-line",
        "visual-code",
        "warm-paper",
        "playful-retro",
      ].includes(saved)
    )
      theme = saved;
  } catch {
    /* Storage may be disabled. */
  }
  document.documentElement.dataset.theme = theme;
})();
