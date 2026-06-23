export function openDatePicker(
  input: HTMLInputElement & {
    showPicker?: () => void;
  },
) {
  try {
    input.showPicker?.();
  } catch {
    // Some browsers restrict programmatic picker opening.
  }
}
