---
name: privacy-compliance
description: >-
  Israeli privacy-law (חוק הגנת הפרטיות, תיקון 13) compliance for "מזל טוב AI":
  consent, data-subject rights, minimization, retention. Use when building
  registration, the personal area, account deletion, guest data, the document
  content sent to the AI, or anything that collects, stores, or exposes personal
  data. Triggers: "פרטיות", "הסכמה", "מחיקת חשבון", "מדיניות פרטיות",
  "תנאי שימוש", "ניוזלטר", "privacy", "consent", "delete account",
  "personal data", "retention".
---

# Privacy Compliance — תאימות לחוק הגנת הפרטיות (תיקון 13)

אוכף את דרישות הפרטיות מאפיון §12 בכל קוד שנוגע במידע אישי — כולל תוכן מסמכים ופרטי אורחות.

## Scope

- **In scope**: consent capture, data-subject rights (view/correct/delete), data minimization, retention, privacy/terms pages, consent logging, and the personal data inside document `content` (names, dates, event details) sent to the AI provider.
- **Out of scope**: general auth/RLS and payment mechanics — see `access-control` and `backend`; table structure — see `database`. This skill defines *what privacy demands*; those skills define *how it's enforced technically*.
- **Legal text is not code**: the wording of the privacy policy / terms requires a lawyer. This skill handles the technical building blocks only.

## Rules (per spec §12)

1. **Minimize collection.** Add a personal-data field only if the feature cannot work without it. If a new column holds personal data, note *why it's needed* in the migration comment. Guest checkout collects only what payment + emailing the file requires (spec §11).
2. **Explicit, unbundled consent at registration.** An **unchecked** blocking checkbox for the privacy policy + terms. A **separate** unchecked checkbox for newsletter/marketing. Never pre-check, never bundle marketing into the mandatory consent.
3. **Log every consent** in a `consents` table: what was consented to, the version/purpose, and a timestamp. For guest purchases, capture acceptance of terms at checkout too. Consent you can't prove didn't happen.
4. **The AI provider is a data processor** (spec §7.1, §12): document `content` sent to Anthropic/OpenAI can contain personal data (names, event dates). Send only the field(s) being improved — never the whole customer record. State AI processing in the privacy policy and (phase 2) use no-training/zero-retention provider settings. Never log the prompt/response with personal data (rule 7).
5. **Data-subject rights live in the personal area** (spec §11/§12): view own data, correct profile, and **delete account**. Deletion removes or anonymizes personal data but retains records the law requires (invoices/payments) — anonymize the FK, don't hard-delete the financial row.
6. **Guest data retention**: an unpurchased guest document keyed by `session_token` holds personal data — define a retention window and purge expired guest documents/versions with a scheduled job. Purchased-order records follow the invoice-retention period.
7. **Never log personal data** (names, emails, event details, payment refs, AI prompts) into application logs or client-facing error messages.
8. **Privacy policy + terms pages** exist, in Hebrew, linked from the global footer on every page.

## Patterns

### Registration consent — unbundled, logged

```tsx
// components/ConsentFields.tsx  — rendered inside the sign-up form
<label className="flex items-start gap-2">
  <input type="checkbox" name="acceptTerms" required />   {/* blocking, unchecked */}
  <span>קראתי ואני מסכים/ה ל<a href="/privacy">מדיניות הפרטיות</a> ול<a href="/terms">תנאי השימוש</a></span>
</label>
<label className="flex items-start gap-2">
  <input type="checkbox" name="marketingConsent" />        {/* separate, optional, unchecked */}
  <span>אני מעוניין/ת לקבל עדכונים וניוזלטר במייל</span>
</label>
```

### Account deletion — anonymize, don't orphan financial records

```ts
// lib/actions/account.ts  (Server Action)
export async function deleteMyAccount() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "יש להתחבר תחילה" };
  // Anonymize retained records (orders/payments), then delete the auth user.
  await supabase.rpc("anonymize_user", { uid: user.id }); // nulls name/email, keeps order rows for invoicing
  await supabase.auth.admin.deleteUser(user.id);          // admin client only (backend skill)
  return { ok: true as const, data: null };
}
```

### Send only the field being improved to the AI

```ts
// GOOD — minimal payload (see backend `lib/ai/provider.ts`)
await improveText({ text: doc.content.greeting, instruction, documentId });
// ❌ BAD — sending the whole customer record to the provider
await improveText({ text: JSON.stringify(doc), instruction, documentId });
```

## Anti-patterns

- ❌ Pre-checked or bundled consent (marketing folded into "I accept the terms") — invalid consent.
- ❌ Hard-deleting order/payment rows on account deletion — breaks legally required retention; anonymize instead.
- ❌ Sending the entire document/customer record to the AI provider when only one field is being improved.
- ❌ Keeping guest documents with personal data forever — define and enforce a retention window.
- ❌ Collecting a field "in case we need it later" — violates minimization.
- ❌ Writing names/emails/event details/payment refs/AI prompts to logs or client-facing errors.
- ❌ A privacy/terms page that exists but isn't linked from the footer.

## Checklist

- [ ] New personal-data fields are justified (minimization) and have a retention period.
- [ ] Registration has unbundled, unchecked consent checkboxes; each consent is logged.
- [ ] AI receives only the field being improved, not whole records; processing disclosed.
- [ ] Guest documents have a defined retention/purge job.
- [ ] Personal area exposes view / correct / delete-account; deletion anonymizes retained financial rows.
- [ ] Privacy + terms pages linked from the global footer, in Hebrew.
- [ ] No personal data in logs or client-facing error messages.
