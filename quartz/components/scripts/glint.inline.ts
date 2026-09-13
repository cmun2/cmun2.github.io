/**
 * A faint trail under the pointer.
 *
 * The rules it plays by, because a reading surface is not a toy:
 *   - nothing at all under `prefers-reduced-motion`, and nothing on touch;
 *   - nothing while the pointer is over article prose, where it would compete
 *     with the text it is sitting on top of;
 *   - one canvas, one rAF, particles capped, and the loop STOPS when the last
 *     one dies rather than idling at 60fps forever.
 *
 * Set `--glint: 0` on :root to switch it off without touching this file.
 */
const MAX = 28

type P = { x: number; y: number; vx: number; vy: number; life: number; size: number }

function start() {
  const root = getComputedStyle(document.documentElement)
  if (root.getPropertyValue("--glint").trim() === "0") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return

  const cv = document.createElement("canvas")
  cv.className = "glint-canvas"
  document.body.appendChild(cv)
  const ctx = cv.getContext("2d")!
  let dpr = 1

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = Math.floor(innerWidth * dpr)
    cv.height = Math.floor(innerHeight * dpr)
    cv.style.width = innerWidth + "px"
    cv.style.height = innerHeight + "px"
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  addEventListener("resize", resize, { passive: true })

  const ps: P[] = []
  let raf = 0
  let colour = root.getPropertyValue("--secondary").trim() || "#0e6d76"

  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]
      p.life -= 0.028
      if (p.life <= 0) {
        ps.splice(i, 1)
        continue
      }
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.045
      p.vx *= 0.97
      ctx.globalAlpha = Math.max(0, p.life) * 0.55
      ctx.fillStyle = colour
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    // Idling at 60fps to draw nothing is the thing that makes effects like this
    // expensive; the loop ends with the last particle and restarts on the next move.
    raf = ps.length ? requestAnimationFrame(tick) : 0
  }

  let last = 0
  addEventListener(
    "pointermove",
    (e) => {
      const now = performance.now()
      if (now - last < 26) return
      last = now
      const el = e.target as Element | null
      if (el?.closest?.("article, .popover, pre, table")) return
      if (ps.length > MAX) ps.splice(0, ps.length - MAX)
      for (let i = 0; i < 2; i++) {
        ps.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 0.9,
          vy: (Math.random() - 0.5) * 0.9 - 0.25,
          life: 0.75 + Math.random() * 0.35,
          size: 1.1 + Math.random() * 1.5,
        })
      }
      if (!raf) raf = requestAnimationFrame(tick)
    },
    { passive: true },
  )

  // The accent differs between themes, so re-read it when the theme flips.
  document.addEventListener("themechange", () => {
    colour = getComputedStyle(document.documentElement).getPropertyValue("--secondary").trim()
  })
}

document.addEventListener("nav", () => {
  if (!(window as any).__glint) {
    ;(window as any).__glint = true
    start()
  }
})
