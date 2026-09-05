import { homedir } from 'node:os'
import { basename, extname, join } from 'node:path'
import { sessionIdFromFileName } from '../ai-vault/session-scanner-accumulator'
import { walkSessionFiles } from '../ai-vault/session-scanner-discovery'

/** Default Cursor projects root (`~/.cursor/projects`). */
function cursorProjectsDir(): string {
  return join(homedir(), '.cursor', 'projects')
}

/**
 * Resolve a Cursor JSONL transcript under `~/.cursor/projects/<slug>/agent-transcripts/`.
 * Matches the hook session id as the file basename or as the UUID inside a nested
 * `<uuid>/<uuid>.jsonl` path.
 */
export async function resolveCursorSessionFile(
  sessionId: string,
  projectsDir = cursorProjectsDir(),
  signal?: AbortSignal
): Promise<string | null> {
  const files = await walkSessionFiles(projectsDir, 'cursor', [], {
    extensions: new Set(['.jsonl']),
    filePredicate: (filePath) => isCursorTranscriptForSession(filePath, sessionId),
    signal
  })
  return files[0] ?? null
}

/** True when `filePath` is an agent-transcripts JSONL whose name matches `sessionId`. */
function isCursorTranscriptForSession(filePath: string, sessionId: string): boolean {
  if (!filePath.split(/[/\\]/).includes('agent-transcripts')) {
    return false
  }
  const name = basename(filePath, extname(filePath))
  return name === sessionId || sessionIdFromFileName(filePath) === sessionId
}
