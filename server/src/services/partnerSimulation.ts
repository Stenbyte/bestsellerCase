import { progressPartnerTicket } from './tickets.js'

const timers = new Map<string, ReturnType<typeof setTimeout>[]>()


export function schedulePartnerSimulation(ticketId: string): void {
  clearPartnerSimulation(ticketId)

  const t1 = setTimeout(() => {
    try {
      progressPartnerTicket(ticketId)
    } catch {
      /* ticket may have been removed / raced */
    }
  }, 400)

  const t2 = setTimeout(() => {
    try {
      progressPartnerTicket(ticketId)
    } catch {
      /* ignore */
    } finally {
      timers.delete(ticketId)
    }
  }, 900)

  timers.set(ticketId, [t1, t2])
}

export function clearPartnerSimulation(ticketId: string): void {
  const list = timers.get(ticketId)
  if (!list) return
  for (const t of list) clearTimeout(t)
  timers.delete(ticketId)
}

export function clearAllPartnerSimulations(): void {
  for (const id of [...timers.keys()]) clearPartnerSimulation(id)
}
