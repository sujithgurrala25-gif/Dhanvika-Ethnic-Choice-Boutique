/**
 * storage.js — localStorage helpers for the order DRAFT only.
 *
 * All persistent data (users, orders, feedback, products, cart, wishlist)
 * is now stored in the SQLite backend via the API (src/utils/api.js).
 *
 * The draft stores the in-progress, multi-step order wizard state
 * (outfit → fabric → measurements → customization) and is intentionally
 * kept in localStorage because it is temporary and user-local.
 */

const DRAFT_KEY = "dhanvika_order_draft";

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Generates a prefixed random ID (client-side, for draft use only) */
export function createId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}`;
}

// ── Draft (order wizard state) ─────────────────────────────────

export function getDraft(userId) {
  const allDrafts = read(DRAFT_KEY, {});
  return allDrafts[userId] || {};
}

export function saveDraft(userId, updates) {
  const allDrafts = read(DRAFT_KEY, {});
  const nextDraft = { ...allDrafts[userId], ...updates };
  write(DRAFT_KEY, { ...allDrafts, [userId]: nextDraft });
  return nextDraft;
}

export function replaceDraft(userId, draft) {
  const allDrafts = read(DRAFT_KEY, {});
  write(DRAFT_KEY, { ...allDrafts, [userId]: draft });
}

export function clearDraft(userId) {
  const allDrafts = read(DRAFT_KEY, {});
  delete allDrafts[userId];
  write(DRAFT_KEY, allDrafts);
}
