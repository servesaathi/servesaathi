import { describe, expect, it } from '@jest/globals';
import { applyFavoriteToggle } from '../favorites';

describe('applyFavoriteToggle', () => {
  it('adds a provider on save', () => {
    expect(applyFavoriteToggle(['1'], '3', true)).toEqual(['1', '3']);
  });

  it('removes a provider on unsave', () => {
    expect(applyFavoriteToggle(['1', '3'], '3', false)).toEqual(['1']);
  });

  it('never duplicates an already-saved provider', () => {
    expect(applyFavoriteToggle(['3'], '3', true)).toEqual(['3']);
  });

  it('is a no-op when unsaving something not saved', () => {
    expect(applyFavoriteToggle(['1'], '3', false)).toEqual(['1']);
  });

  it('undoes itself when re-applied with the opposite flag (rollback)', () => {
    const before = ['1', '2'];
    expect(applyFavoriteToggle(applyFavoriteToggle(before, '3', true), '3', false)).toEqual(before);
  });
});
