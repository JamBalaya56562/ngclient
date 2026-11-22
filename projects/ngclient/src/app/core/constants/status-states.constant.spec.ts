import { describe, expect, it } from 'vitest';
import { resolveStatusText, STATUS_STATES } from './status-states.constant';

describe('status text resolution', () => {
  it('maps the run script phase to a translatable message', () => {
    expect(STATUS_STATES['RunScript_Running']).toBe('Running script …');
    expect(resolveStatusText('RunScript_Running')).toBe('Running script …');
  });

  it('continues to resolve existing known phases', () => {
    expect(resolveStatusText('Backup_ProcessingFiles')).toBe('Processing files to backup …');
  });

  it('names the check of the local database apart from the check of the remote data', () => {
    expect(resolveStatusText('Backup_VerifyDatabase')).toBe('Verifying local database …');
    expect(resolveStatusText('Backup_PreBackupVerify')).toBe('Verifying backend data …');
  });
  it('preserves unknown phases for forward compatibility', () => {
    expect(resolveStatusText('FutureOperation_Running')).toBe('FutureOperation_Running');
  });

  it.each([null, undefined])('returns an empty string when %s has no fallback', (phase) => {
    expect(resolveStatusText(phase)).toBe('');
  });

  it.each([null, undefined])('returns the caller fallback when %s has no phase', (phase) => {
    expect(resolveStatusText(phase, 'Running …')).toBe('Running …');
  });
});
