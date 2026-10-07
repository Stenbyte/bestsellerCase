/** Demo telemetry — structured console logs (stand-in for a real sink). */
export function logEvent(
  action: string,
  data: Record<string, unknown> = {},
): void {
  if (process.env.NODE_ENV === 'test') return

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      source: 'recolour-server',
      action,
      ...data,
    }),
  )
}
