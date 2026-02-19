import { describe, expect, it } from 'vitest';
import { safeJsonParse } from './storage';

describe('storage utils', () => {
  it('retorna fallback quando JSON é inválido', () => {
    expect(safeJsonParse('{invalid}', { ok: false })).toEqual({ ok: false });
  });

  it('retorna fallback quando valor não é string', () => {
    expect(safeJsonParse(null, [])).toEqual([]);
    expect(safeJsonParse(undefined, null)).toBeNull();
  });

  it('parseia corretamente JSON válido', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
  });
});
