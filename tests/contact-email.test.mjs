import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildContactReplyEmail } from "../src/lib/contact-reply-email.ts";
import { getProfessionalFollowUp, professionalInterventionFormUrl } from "../src/lib/professional-followup.ts";

const templateMigration = readFileSync(
  new URL("../supabase/migrations/20260913111249_manage_contact_reply_templates.sql", import.meta.url),
  "utf8",
);

test("professional acknowledgements include the exact supplied form URL in HTML and plain text", () => {
  const expected = "https://www.vieavenir.fr/formulaires/devenez-une-voix-de-l-avenir-avec-l-association-vie-avenir";
  assert.equal(professionalInterventionFormUrl, expected);
  const followUp = getProfessionalFollowUp("professional");
  assert.ok(followUp.html.includes(`href="${expected}"`));
  assert.ok(followUp.html.includes(`>${expected}</a>`), "copyable fallback link");
  assert.ok(followUp.text.includes(expected));
  assert.match(followUp.html, /Compléter le formulaire/);
  assert.match(followUp.text, /préparer vos futures interventions/);
});

for (const profile of ["young", "parent", "partner"]) {
  test(`${profile} acknowledgements receive no professional follow-up`, () => {
    assert.deepEqual(getProfessionalFollowUp(profile), { html: "", text: "" });
  });
}

test("reply templates are stored in an admin-only table with all initial profiles", () => {
  assert.match(templateMigration, /create table public\.contact_reply_templates/);
  assert.match(templateMigration, /enable row level security/);
  assert.match(templateMigration, /for select to authenticated[\s\S]*private\.is_admin/);
  assert.match(templateMigration, /revoke all privileges on public\.contact_reply_templates from public, anon, authenticated/);
  assert.doesNotMatch(templateMigration, /grant select[^;]+to anon/);
  for (const profile of ["young", "parent", "professional", "partner"]) {
    assert.ok(templateMigration.includes(`'${profile}'`), profile);
  }
  assert.ok(templateMigration.includes(professionalInterventionFormUrl));
});

test("admin reply email follows the brand, escapes edited content and replies to contact", () => {
  const cta = { label: "Compléter le formulaire", url: professionalInterventionFormUrl };
  const email = buildContactReplyEmail({
    requestId: "00000000-0000-4000-8000-000000000001",
    replyToken: "00000000-0000-4000-8000-000000000002",
    profile: "professional",
    recipientName: "Marie <Claude>",
    recipientEmail: "marie@example.com",
    subject: "Préparons votre intervention",
    heading: "Un titre <important>",
    body: "Une première ligne & la suite\nDeuxième ligne",
    cta,
  });

  assert.equal(email.to, "marie@example.com");
  assert.equal(email.replyTo, "contact@vieavenir.fr");
  assert.match(email.html, /linear-gradient\(90deg,#e6007e/);
  assert.match(email.html, /Marie &lt;Claude&gt;/);
  assert.match(email.html, /Un titre &lt;important&gt;/);
  assert.match(email.html, /Une première ligne &amp; la suite<br>Deuxième ligne/);
  assert.ok(!email.html.includes("Marie <Claude>"));
  assert.ok(email.html.includes(professionalInterventionFormUrl));
  assert.ok(email.text.includes(professionalInterventionFormUrl));
  assert.equal(email.idempotencyKey, "contact-reply-00000000-0000-4000-8000-000000000001-00000000-0000-4000-8000-000000000002");
});
