// Privacy rules of the device-storage layer (spec G, L.1): restricted answers
// never reach storage, FIN3 only reaches its own key, and drafts expire.

import assert from 'node:assert/strict';

const mem = new Map<string, string>();
jest.mock('@/services/storage', () => ({
  __esModule: true,
  default: {
    getItem: async (k: string) => mem.get(k) ?? null,
    setItem: async (k: string, v: string) => void mem.set(k, v),
    removeItem: async (k: string) => void mem.delete(k),
    clear: async () => mem.clear(),
  },
}));

import {
  completeAssessment,
  deleteAssessment,
  getInProgress,
  restrictedKey,
  saveProgress,
  saveResponse,
  startAssessment,
  storeKey,
} from '../ewsService';

const USER = 'user:7';

beforeEach(() => mem.clear());

describe('ewsService privacy', () => {
  it('never writes EMO4 / HOM4 / EMO4P / HOM4P anywhere', async () => {
    const a = await startAssessment(USER, { mode: 'self', privateConfirmed: true });
    await Promise.all([
      saveResponse(USER, a.id, 'EMO1', 'almost'),
      saveResponse(USER, a.id, 'EMO4', 'often'),
      saveResponse(USER, a.id, 'HOM4', 'yes'),
      saveResponse(USER, a.id, 'EMO4P', 'yes'),
      saveResponse(USER, a.id, 'HOM4P', 'yes'),
    ]);
    const everything = [...mem.values()].join('\n');
    for (const id of ['EMO4', 'HOM4', 'EMO4P', 'HOM4P']) assert.ok(!everything.includes(`"${id}"`), id);
    assert.equal(JSON.parse(mem.get(storeKey(USER))!).assessments[0].answers.EMO1, 'almost');
  });

  it('writes FIN3 only to the restricted key, and still scores it', async () => {
    const a = await startAssessment(USER, { mode: 'self', privateConfirmed: true });
    await saveResponse(USER, a.id, 'FIN1', 'yes');
    await saveResponse(USER, a.id, 'FIN3', 'now');
    assert.ok(!mem.get(storeKey(USER))!.includes('FIN3'));
    assert.deepEqual(JSON.parse(mem.get(restrictedKey(USER))!)[a.id], { FIN3: 'now' });
    await saveResponse(USER, a.id, 'FIN2', 'most');
    const done = await completeAssessment(USER, a.id);
    // FIN3 "now" is a key item → Needs attention, though FIN1/FIN2 are best.
    assert.equal(done.result!.dims.FIN.band, 'needs_attention');
    assert.ok(!mem.get(storeKey(USER))!.includes('FIN3'));
  });

  it('keeps back-to-back writes (answer + progress) from overwriting each other', async () => {
    const a = await startAssessment(USER, { mode: 'self', privateConfirmed: false });
    await Promise.all([
      saveResponse(USER, a.id, 'ADL1', 'easy'),
      saveProgress(USER, a.id, { dimIdx: 0, qIdx: 1, jitSeen: ['EMO4'], s8Checked: false, pending: [] }, []),
      saveResponse(USER, a.id, 'ADL2', 'diff'),
    ]);
    const stored = JSON.parse(mem.get(storeKey(USER))!).assessments[0];
    assert.deepEqual(stored.answers, { ADL1: 'easy', ADL2: 'diff' });
    assert.equal(stored.progress.qIdx, 1);
    assert.deepEqual(stored.progress.jitSeen, [], 'jitSeen is in-memory only');
  });

  it('expires an unfinished check-in after 7 days, restricted answers included', async () => {
    const a = await startAssessment(USER, { mode: 'self', privateConfirmed: true });
    await saveResponse(USER, a.id, 'FIN3', 'past');
    const store = JSON.parse(mem.get(storeKey(USER))!);
    store.assessments[0].resumeExpiresAt = new Date(Date.now() - 1000).toISOString();
    mem.set(storeKey(USER), JSON.stringify(store));
    assert.equal(await getInProgress(USER), null);
    assert.deepEqual(JSON.parse(mem.get(storeKey(USER))!).assessments, []);
    assert.equal(JSON.parse(mem.get(restrictedKey(USER))!)[a.id], undefined);
  });

  it('delete removes the assessment and its restricted answers', async () => {
    const a = await startAssessment(USER, { mode: 'self', privateConfirmed: true });
    await saveResponse(USER, a.id, 'FIN3', 'no');
    await deleteAssessment(USER, a.id);
    assert.deepEqual(JSON.parse(mem.get(storeKey(USER))!).assessments, []);
    assert.deepEqual(JSON.parse(mem.get(restrictedKey(USER))!), {});
  });
});
