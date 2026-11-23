export function openDatePicker(
  input: (HTMLInputElement & { showPicker?: () => void }) | null | undefined,
) {
  if (!input) return;
  try {
    input.showPicker?.();
  } catch {
    // Some browsers restrict programmatic picker opening.
  }
}
