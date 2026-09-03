import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { customFormSchema, validateCustomAnswers, slugifyFormTitle, questionTypes, defaultFormBlock, groupFormQuestions, flattenFormBlocks, groupResponseQuestions } from "../src/lib/custom-forms.ts";
import { createFormQrCode, getFormShareUrl } from "../src/lib/form-qr-code.ts";
import { buildCustomFormNotification, scheduleCustomFormNotification } from "../src/lib/custom-form-notification.ts";

const question = (type, index = 1) => ({ id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`, label: type, help_text: "", type, required: true, options: type.includes("choice") ? ["Oui", "Non"] : [] });
const form = { title: "Questionnaire", slug: "questionnaire", description: "", confirmation_message: "Merci !", status: "published", questions: [question("short_text")] };
const secondBlock = { id: "10000000-0000-4000-8000-000000000002", title: "Vos attentes" };

test("legacy forms retain all questions in one block and notifications default to off", () => {
  const parsed = customFormSchema.parse(form);
  assert.deepEqual(parsed.blocks, [defaultFormBlock]);
  assert.equal(parsed.notify_on_response, false);
  const groups = groupFormQuestions(undefined, form.questions);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].questions, form.questions);
  assert.deepEqual(groupResponseQuestions(form.questions)[0].questions, form.questions);
});

test("block names, identifiers, references and limits are validated", () => {
  const valid = { ...form, blocks: [defaultFormBlock, secondBlock], notify_on_response: true };
  assert.equal(customFormSchema.safeParse(valid).success, true);
  for (const blocks of [[], [{ ...defaultFormBlock, title: " " }], [defaultFormBlock, defaultFormBlock], Array.from({ length: 21 }, (_, i) => ({ id: question("short_text", i + 1).id, title: "Bloc" }))]) {
    assert.equal(customFormSchema.safeParse({ ...valid, blocks }).success, false);
  }
  assert.equal(customFormSchema.safeParse({ ...valid, notify_on_response: "true" }).success, false);
  assert.equal(customFormSchema.safeParse({ ...valid, questions: [{ ...question("short_text"), block_id: question("short_text", 100).id }] }).success, false);
  assert.equal(customFormSchema.safeParse({ ...valid, questions: [{ ...question("short_text"), block_id: secondBlock.id, block_title: "Wrong" }] }).success, false);
});

test("moving and renaming blocks preserves IDs, answers and historical names", () => {
  const first = { ...defaultFormBlock, title: "Coordonnées" };
  const questions = flattenFormBlocks([{ ...first, questions: [question("email", 1)] }, { ...secondBlock, questions: [question("long_text", 2)] }]);
  const reordered = groupFormQuestions([secondBlock, first], questions);
  assert.deepEqual(flattenFormBlocks(reordered).map((q) => q.id), [questions[1].id, questions[0].id]);
  const renamed = flattenFormBlocks(groupFormQuestions([{ ...first, title: "À propos de vous" }, secondBlock], questions));
  assert.equal(renamed[0].block_title, "À propos de vous");
  assert.equal(groupResponseQuestions(questions)[0].title, "Coordonnées");
  const moved = questions.map((q) => ({ ...q, block_id: secondBlock.id }));
  const groups = groupFormQuestions([first, secondBlock], moved);
  assert.equal(groups[0].questions.length, 0);
  assert.equal(groups[1].questions.length, 2);
  assert.equal(flattenFormBlocks(groups)[0].block_title, secondBlock.title);
  assert.deepEqual(questions.map((q) => q.id), renamed.map((q) => q.id));
});

const notification = { enabled: true, isNewResponse: true, formId: question("short_text").id, formTitle: 'Atelier <img src=x> & "découverte"\r\nSuite', submissionId: question("short_text", 2).id, siteUrl: "https://vieavenir.fr/" };

test("notifications use contact as recipient/reply-to, escape HTML and link to private answers", () => {
  const mail = buildCustomFormNotification(notification);
  assert.equal(mail.to, "contact@vieavenir.fr");
  assert.equal(mail.replyTo, "contact@vieavenir.fr");
  assert.match(mail.html, /&lt;img src=x&gt; &amp; &quot;découverte&quot;/);
  assert.ok(!mail.html.includes("<img"));
  assert.ok(!/[\r\n]/.test(mail.subject));
  assert.ok(mail.text.includes(`https://vieavenir.fr/admin/formulaires/${notification.formId}/reponses`));
  assert.equal(mail.idempotencyKey, buildCustomFormNotification(notification).idempotencyKey);
  assert.notEqual(mail.idempotencyKey, buildCustomFormNotification({ ...notification, submissionId: question("short_text", 3).id }).idempotencyKey);
});

test("notification dispatch is deferred; disabled forms and duplicate submissions send nothing", async () => {
  const tasks = [];
  const sent = [];
  const after = (task) => tasks.push(task);
  const send = async (mail) => { sent.push(mail); return { ok: true }; };
  const fail = () => assert.fail("unexpected mail failure");
  scheduleCustomFormNotification({ ...notification, enabled: false }, after, send, fail);
  scheduleCustomFormNotification({ ...notification, isNewResponse: false }, after, send, fail);
  assert.equal(tasks.length, 0);
  scheduleCustomFormNotification(notification, after, send, fail);
  assert.equal(tasks.length, 1);
  assert.equal(sent.length, 0);
  await tasks[0]();
  assert.equal(sent.length, 1);
});

test("Resend errors, missing configuration and scheduling failures do not throw after saving", async () => {
  for (const reason of ["missing_config", "provider_error", "network_error"]) {
    const tasks = [], failures = [];
    scheduleCustomFormNotification(notification, (task) => tasks.push(task), async () => ({ ok: false, reason }), (value) => failures.push(value));
    await assert.doesNotReject(tasks[0]);
    assert.deepEqual(failures, [reason]);
  }
  const tasks = [], failures = [];
  scheduleCustomFormNotification(notification, (task) => tasks.push(task), async () => { throw new Error("offline"); }, (reason) => failures.push(reason));
  await assert.doesNotReject(tasks[0]);
  scheduleCustomFormNotification(notification, () => { throw new Error("unavailable"); }, async () => ({ ok: true }), (reason) => failures.push(reason));
  assert.deepEqual(failures, ["network_error", "scheduling_error"]);
});

test("downloadable QR codes decode to the exact public sharing URL", async () => {
  for (const slug of ["atelier-octobre", "formulaire-" + "a".repeat(89)]) {
    const shareUrl = getFormShareUrl("https://vieavenir.fr/", slug);
    assert.equal(shareUrl, `https://vieavenir.fr/formulaires/${slug}`);
    const dataUrl = await createFormQrCode(shareUrl);
    assert.ok(dataUrl.startsWith("data:image/png;base64,"));
    const png = PNG.sync.read(Buffer.from(dataUrl.split(",")[1], "base64"));
    assert.equal(png.width, 1024);
    assert.equal(png.height, 1024);
    assert.deepEqual([...png.data.subarray(0, 4)], [255, 255, 255, 255]);
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    assert.equal(decoded?.data, shareUrl);
  }
});

test("each saved form address produces its own QR code", async () => {
  const first = getFormShareUrl("https://vieavenir.fr", "atelier-a");
  const second = getFormShareUrl("https://vieavenir.fr", "atelier-b");
  assert.notEqual(await createFormQrCode(first), await createFormQrCode(second));
});

test("drafts can be empty, published forms cannot; IDs and choices stay unique", () => {
  assert.equal(customFormSchema.safeParse(form).success, true);
  assert.equal(customFormSchema.safeParse({ ...form, status: "draft", questions: [] }).success, true);
  assert.equal(customFormSchema.safeParse({ ...form, questions: [] }).success, false);
  assert.equal(customFormSchema.safeParse({ ...form, questions: [question("short_text"), question("email")] }).success, false);
  assert.equal(customFormSchema.safeParse({ ...form, questions: [{ ...question("single_choice"), options: ["Oui", "Oui"] }] }).success, false);
});

test("all supported answer types validate and preserve their shape", () => {
  const questions = questionTypes.map((type, i) => question(type, i + 1));
  const values = ["  Un texte  ", "Plusieurs lignes\nSuite", "test@example.com", "+596 696 12 34 56", "12.5", "2026-09-03", "Oui", "Non"];
  const data = new FormData();
  questions.forEach((q, i) => data.append(`question_${q.id}`, values[i]));
  const result = validateCustomAnswers(questions, data);
  assert.equal(result.error, undefined);
  assert.equal(result.answers[questions[0].id], "Un texte");
  assert.deepEqual(result.answers[questions[7].id], ["Non"]);
});

test("required questions reject blanks while optional questions accept them", () => {
  assert.ok(validateCustomAnswers([question("short_text")], new FormData()).error);
  assert.ok(validateCustomAnswers([question("multiple_choice")], new FormData()).error);
  assert.equal(validateCustomAnswers([{ ...question("short_text"), required: false }], new FormData()).error, undefined);
});

test("invalid emails, dates, numbers, phone numbers and forged choices are rejected", () => {
  for (const [type, value] of [["email", "incorrect"], ["date", "2026-02-30"], ["number", "Infinity"], ["phone", "bonjour"], ["single_choice", "Inconnu"], ["multiple_choice", "Inconnu"]]) {
    const q = question(type);
    const data = new FormData();
    data.append(`question_${q.id}`, value);
    assert.ok(validateCustomAnswers([q], data).error, type);
  }
});

test("duplicate choices and oversized answers are rejected; slugs are safe", () => {
  const q = question("multiple_choice");
  const data = new FormData();
  data.append(`question_${q.id}`, "Oui");
  data.append(`question_${q.id}`, "Oui");
  assert.ok(validateCustomAnswers([q], data).error);
  const longData = new FormData();
  longData.set(`question_${q.id}`, "a".repeat(5001));
  assert.ok(validateCustomAnswers([question("long_text")], longData).error);
  assert.equal(slugifyFormTitle("Nos idées pour l’avenir !"), "nos-idees-pour-l-avenir");
});

test("server action modules export async functions only (registration regression)", () => {
  for (const path of ["src/app/admin/form-actions.ts", "src/app/formulaires/[slug]/actions.ts", "src/app/evenements/[slug]/registration-actions.ts"]) {
    const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
      if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
      assert.ok(ts.isFunctionDeclaration(statement) && statement.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword), path);
    }
  }
});
