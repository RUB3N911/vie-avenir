import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { customFormSchema, validateCustomAnswers, slugifyFormTitle, questionTypes } from "../src/lib/custom-forms.ts";

const question = (type, index = 1) => ({ id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`, label: type, help_text: "", type, required: true, options: type.includes("choice") ? ["Oui", "Non"] : [] });
const form = { title: "Questionnaire", slug: "questionnaire", description: "", confirmation_message: "Merci !", status: "published", questions: [question("short_text")] };

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
