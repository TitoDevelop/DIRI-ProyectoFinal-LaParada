type Level = 'info' | 'warn' | 'error';

export function log(level: Level, message: string, detail?: unknown) {
  const prefix = `[DIRI ${new Date().toLocaleTimeString('es-ES')}] ${message}`;
  if (level === 'error') console.error(prefix, detail ?? '');
  else if (level === 'warn') console.warn(prefix, detail ?? '');
  else console.info(prefix, detail ?? '');
}
