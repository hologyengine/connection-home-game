export function activatePointerLock() {
  if (
    "pointerLockElement" in document &&
    typeof document.exitPointerLock === "function"
  ) {
    const canvas = document.getElementsByTagName("canvas")[0]
    if (canvas) {
      try {
        canvas.requestPointerLock()
      } catch (e) {
        console.warn(e)
      }
    }
  }
}
