export function prettifyKeyboardShortcut(input: string) {
  return input
    .split("+")
    .join("")
    .replace("ArrowRight", "→")
    .replace("ArrowLeft", "←")
    .replace("Command", "⌘")
    .replace("Shift", "⇧")
    .replace("Control", "⌃")
    .replace("Enter", "↩")
    .toUpperCase();
}
