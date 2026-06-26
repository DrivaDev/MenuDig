interface MenuData {
  _id: string
  startTime: string | null
  endTime: string | null
  isActive: boolean
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/**
 * Returns the active menu ID for the current Argentina time (UTC-3), or null
 * when filtering should not apply (caller shows all dishes).
 *
 * Rules:
 *  - 0 menus → null
 *  - 1 menu with no times → null (standard/default menu, show everything)
 *  - All menus lack times (2+) → manual mode: return the isActive one
 *  - Any menu has times → timed mode:
 *      1. Return menu whose range contains current time
 *      2. No match → return the most recently ended menu (today)
 *      3. Before any menu today → return menu with the latest endTime (yesterday's last)
 */
export function getActiveMenuId(menus: MenuData[]): string | null {
  if (menus.length === 0) return null

  // Single menu with no time config = default "Estándar" mode → no filtering
  if (menus.length === 1 && !menus[0].startTime && !menus[0].endTime) return null

  const timedMenus = menus.filter(m => m.startTime && m.endTime)

  if (timedMenus.length === 0) {
    return menus.find(m => m.isActive)?._id ?? null
  }

  // Argentina time: UTC minus 3 hours
  const utcNow   = new Date()
  const argDate  = new Date(utcNow.getTime() - 3 * 60 * 60 * 1000)
  const nowMins  = argDate.getUTCHours() * 60 + argDate.getUTCMinutes()

  const current = timedMenus.find(m => {
    const s = timeToMinutes(m.startTime!)
    const e = timeToMinutes(m.endTime!)
    return nowMins >= s && nowMins < e
  })
  if (current) return current._id

  const past = timedMenus.filter(m => timeToMinutes(m.endTime!) <= nowMins)
  if (past.length > 0) {
    past.sort((a, b) => timeToMinutes(b.endTime!) - timeToMinutes(a.endTime!))
    return past[0]._id
  }

  // Before any menu today → yesterday's last = menu with latest endTime
  const sorted = [...timedMenus].sort((a, b) => timeToMinutes(b.endTime!) - timeToMinutes(a.endTime!))
  return sorted[0]._id
}
