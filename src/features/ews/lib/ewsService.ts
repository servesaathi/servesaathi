// EWS persistence — the website's src/lib/ews/ewsService.ts re-implemented
// over src/services/storage.ts (MMKV in dev builds, AsyncStorage in Expo Go).
// Same exports, same data shapes, so the later API swap matches the web.
// TODO(backend): no EWS endpoints exist yet. Each export maps 1:1 to the
// endpoint the backend will need, so swapping to axios later is local to this
// file:
//   startAssessment      → POST   /ews/assessments            (start; replaces any draft)
//   getInProgress        → GET    /ews/assessments/current    (resume)
//   saveResponse         → PUT    /ews/assessments/:id/responses/:itemId
//   saveProgress         → PATCH  /ews/assessments/:id        (position + safety events)
//   completeAssessment   → POST   /ews/assessments/:id/complete (server computes the result)
//   getLatestResult      → GET    /ews/results/latest         ("has result?" for the empty state)
//   listHistory          → GET    /ews/results
//   deleteAssessment     → DELETE /ews/assessments/:id
//   requestCallback      → POST   /ews/callbacks
//
// Privacy rules the backend must keep (spec G, L.1):
//   - EMO4 / HOM4 / EMO4P / HOM4P answers are never written anywhere — the
//     check-in evaluates their trigger in memory and only a safety event
//     (id, tier, time, mode, action) is saved.
//   - FIN3 goes to a separate restricted store, never alongside the other
//     answers, and is only read back to compute the Financial band.
//   - Unfinished check-ins expire 7 days after they were last saved.

import storage from '@/services/storage';
import { DIMS, ITEMS, QUESTIONNAIRE_VERSION, itemById, type Answers, type Mode, type SafetyId } from './questionnaire';
import { isVisible } from './flow';
import { computeResult, type EwsResult } from './scoring';

export type SafetyUserAction = 'called_number' | 'notified_contact' | 'callback_requested' | 'dismissed' | 'exited';

export type SafetyEvent = {
  /** Unique per firing, so the same trigger can be tracked twice. */
  key: string;
  id: SafetyId;
  tier: 1 | 2 | 3;
  at: string;
  mode: Mode;
  actions: SafetyUserAction[];
  /** Elder chose to share this with family (never possible for S1/S6). */
  share: boolean;
};

export type ProxyDetails = {
  elderName: string;
  relationship: string;
  /** How the elder agreed to a family member answering (spec G). */
  consentMethod: 'otp_elder' | 'assisted_confirm';
};

export type Progress = {
  dimIdx: number;
  qIdx: number;
  /** Items whose "the next question is personal" notice has been shown. */
  jitSeen: string[];
  s8Checked: boolean;
  /** Tier 2 events waiting for the end of the current area. */
  pending: string[];
};

export type Assessment = {
  id: string;
  questionnaireVersion: string;
  mode: Mode;
  privateConfirmed: boolean;
  proxy?: ProxyDetails;
  status: 'in_progress' | 'completed';
  /** Standard + sensitive answers only — never restricted ones. */
  answers: Answers;
  progress: Progress;
  events: SafetyEvent[];
  startedAt: string;
  resumeExpiresAt: string;
  /** Date only (spec I), YYYY-MM-DD. */
  completedOn?: string;
  result?: EwsResult;
};

export type StartInput = {
  mode: Mode;
  privateConfirmed: boolean;
  proxy?: ProxyDetails;
};

type UserStore = { assessments: Assessment[] };

const RESUME_DAYS = 7;
export const storeKey = (userId: string) => `servesaathi-ews:${userId}`;
export const restrictedKey = (userId: string) => `servesaathi-ews-restricted:${userId}`;
const CALLBACKS_KEY = 'servesaathi-ews-callbacks';
const planKey = (assessmentId: string) => `servesaathi-ews-plan:${assessmentId}`;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — the in-memory flow still works this session.
  }
}

// localStorage is synchronous, so the web's read-modify-write can't
// interleave. Device storage is async: an answer save and a progress save
// fired back to back would each read the old store and the second write would
// drop the first. Every read-modify-write therefore runs through this queue.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

const readStore = (userId: string) => readJson<UserStore>(storeKey(userId), { assessments: [] });
const writeStore = (userId: string, store: UserStore) => writeJson(storeKey(userId), store);
const readRestricted = (userId: string) => readJson<Record<string, Answers>>(restrictedKey(userId), {});

const plusDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
/** Today as YYYY-MM-DD in the user's own timezone (toISOString is UTC). */
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ews-${Date.now()}-${Math.random().toString(36).slice(2)}`;

async function update(userId: string, id: string, fn: (a: Assessment) => void): Promise<Assessment> {
  const store = await readStore(userId);
  const a = store.assessments.find((x) => x.id === id);
  if (!a) throw new Error('Assessment not found');
  fn(a);
  await writeStore(userId, store);
  return a;
}

async function removeAssessment(userId: string, assessmentId: string): Promise<void> {
  const store = await readStore(userId);
  store.assessments = store.assessments.filter((a) => a.id !== assessmentId);
  await writeStore(userId, store);
  const restricted = await readRestricted(userId);
  delete restricted[assessmentId];
  await writeJson(restrictedKey(userId), restricted);
  await storage.removeItem(planKey(assessmentId));
}

export function getInProgress(userId: string): Promise<Assessment | null> {
  return serial(async () => {
    const store = await readStore(userId);
    const draft = store.assessments.find((a) => a.status === 'in_progress');
    if (!draft) return null;
    if (new Date(draft.resumeExpiresAt).getTime() < Date.now()) {
      // Spec G: partial answers kept 7 days for resume, then deleted.
      await removeAssessment(userId, draft.id);
      return null;
    }
    return draft;
  });
}

export function startAssessment(userId: string, input: StartInput): Promise<Assessment> {
  return serial(async () => {
    const store = await readStore(userId);
    const stale = store.assessments.filter((a) => a.status === 'in_progress').map((a) => a.id);
    const restricted = await readRestricted(userId);
    for (const id of stale) delete restricted[id];
    await writeJson(restrictedKey(userId), restricted);

    const assessment: Assessment = {
      id: newId(),
      questionnaireVersion: QUESTIONNAIRE_VERSION,
      mode: input.mode,
      privateConfirmed: input.mode === 'self' && input.privateConfirmed,
      proxy: input.proxy,
      status: 'in_progress',
      answers: {},
      progress: { dimIdx: 0, qIdx: 0, jitSeen: [], s8Checked: false, pending: [] },
      events: [],
      startedAt: new Date().toISOString(),
      resumeExpiresAt: plusDays(RESUME_DAYS),
    };
    store.assessments = [...store.assessments.filter((a) => a.status !== 'in_progress'), assessment];
    await writeStore(userId, store);
    return assessment;
  });
}

export function saveResponse(userId: string, assessmentId: string, itemId: string, code: string): Promise<void> {
  const item = itemById(itemId);
  if (!item) return Promise.reject(new Error(`Unknown item ${itemId}`));
  // Restricted unscored items are evaluated in memory only (spec C-10).
  if (item.restricted) return Promise.resolve();
  return serial(async () => {
    if (item.restrictedStore) {
      const restricted = await readRestricted(userId);
      restricted[assessmentId] = { ...restricted[assessmentId], [itemId]: code };
      await writeJson(restrictedKey(userId), restricted);
      return;
    }
    await update(userId, assessmentId, (a) => {
      a.answers[itemId] = code;
      a.resumeExpiresAt = plusDays(RESUME_DAYS);
    });
  });
}

export function saveProgress(userId: string, assessmentId: string, progress: Progress, events: SafetyEvent[]): Promise<void> {
  return serial(async () => {
    await update(userId, assessmentId, (a) => {
      // jitSeen stays in memory: even "the self-harm notice was shown" says
      // something about the answers before it. After a resume the notice
      // simply shows again.
      a.progress = { ...progress, jitSeen: [] };
      a.events = events;
      a.resumeExpiresAt = plusDays(RESUME_DAYS);
    });
  });
}

/** Computes the result "server-side" with the shared scoring module. */
export function completeAssessment(userId: string, assessmentId: string): Promise<Assessment> {
  return serial(async () => {
    const restricted = (await readRestricted(userId))[assessmentId] ?? {};
    return update(userId, assessmentId, (a) => {
      const ctx = { mode: a.mode, privateOk: a.privateConfirmed, answers: a.answers };
      // Drop answers to questions that stopped applying after an earlier
      // answer changed (e.g. MED1–3 after MED0 went back to "No").
      const visible = new Set(ITEMS.filter((i) => isVisible(i, ctx)).map((i) => i.id));
      a.answers = Object.fromEntries(Object.entries(a.answers).filter(([id]) => visible.has(id)));
      const scoringAnswers = { ...a.answers, ...(visible.has('FIN3') ? restricted : {}) };
      a.result = computeResult(scoringAnswers);
      a.status = 'completed';
      a.completedOn = localDate();
      a.progress = { ...a.progress, dimIdx: DIMS.length, pending: [], jitSeen: [] };
    });
  });
}

export async function listHistory(userId: string): Promise<Assessment[]> {
  return (await readStore(userId)).assessments
    .filter((a) => a.status === 'completed')
    .sort((a, b) => (b.completedOn ?? '').localeCompare(a.completedOn ?? '') || b.startedAt.localeCompare(a.startedAt));
}

export async function getLatestResult(userId: string): Promise<Assessment | null> {
  return (await listHistory(userId))[0] ?? null;
}

export function deleteAssessment(userId: string, assessmentId: string): Promise<void> {
  return serial(() => removeAssessment(userId, assessmentId));
}

export type CallbackCategory = 'safety_tier1' | 'safety_tier2' | 'area_support' | 'general';

export type CallbackRequest = {
  id: string;
  userId: string;
  category: CallbackCategory;
  /** The safety event or area the request came from — never answers. */
  safetyEventKey?: string;
  dim?: string;
  name: string;
  phone: string;
  /** S6: call back only on a number the elder confirmed is safe. */
  private: boolean;
  status: 'open';
  createdAt: string;
};

export function requestCallback(input: Omit<CallbackRequest, 'id' | 'status' | 'createdAt'>): Promise<CallbackRequest> {
  return serial(async () => {
    const request: CallbackRequest = { ...input, id: newId(), status: 'open', createdAt: new Date().toISOString() };
    await writeJson(CALLBACKS_KEY, [...(await readJson<CallbackRequest[]>(CALLBACKS_KEY, [])), request]);
    return request;
  });
}

// Care-plan ticks (the web keeps these in localStorage from CarePlan.tsx).
// TODO(backend): no endpoint planned in the spec yet; device-only for now.
export const getPlanDone = (assessmentId: string) => readJson<string[]>(planKey(assessmentId), []);
export const setPlanDone = (assessmentId: string, done: string[]) => writeJson(planKey(assessmentId), done);

// DPDP consent bookkeeping (website src/lib/consent.ts): the Data Fiduciary
// must be able to prove consent was given, for what, against which notice.
// TODO(backend): no consent endpoint yet — kept on the device so nothing is
// lost; send these with the EWS / callback calls once the backend accepts them.
export const PRIVACY_NOTICE_VERSION = '2026-10-07';
const CONSENTS_KEY = 'servesaathi-consents';
export type ConsentPurpose = 'ews-check-in' | 'callback-request';

export function recordConsent(purpose: ConsentPurpose, dataItems: string[]): Promise<void> {
  return serial(async () => {
    const record = { purpose, dataItems, noticeVersion: PRIVACY_NOTICE_VERSION, givenAt: new Date().toISOString() };
    await writeJson(CONSENTS_KEY, [...(await readJson<unknown[]>(CONSENTS_KEY, [])), record]);
  });
}
