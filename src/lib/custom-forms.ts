import { z } from "zod";

export const questionTypes = ["short_text", "long_text", "email", "phone", "number", "date", "single_choice", "multiple_choice"] as const;
export type QuestionType = (typeof questionTypes)[number];
export const questionTypeLabels: Record<QuestionType, string> = {
  short_text: "Réponse courte", long_text: "Réponse longue", email: "E-mail", phone: "Téléphone",
  number: "Nombre", date: "Date", single_choice: "Choix unique", multiple_choice: "Choix multiples",
};
export const formStatusLabels = { draft: "Brouillon", published: "Publié", closed: "Fermé" } as const;
export const isChoiceQuestion = (type: QuestionType) => type === "single_choice" || type === "multiple_choice";
export const defaultFormBlock = { id: "00000000-0000-4000-8000-000000000001", title: "Questions" };
export const formBlockSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1, "Donnez un nom à chaque bloc.").max(120),
});

export const questionSchema = z.object({
  id: z.uuid(),
  label: z.string().trim().min(1, "Chaque question doit avoir un intitulé.").max(200),
  help_text: z.string().trim().max(500),
  type: z.enum(questionTypes),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1, "Une option est vide.").max(120)).max(20),
  block_id: z.uuid().optional(),
  block_title: z.string().trim().min(1).max(120).optional(),
}).superRefine((question, ctx) => {
  if (isChoiceQuestion(question.type) && question.options.length < 2) {
    ctx.addIssue({ code: "custom", message: `« ${question.label} » doit proposer au moins deux choix.` });
  }
  if (new Set(question.options).size !== question.options.length) {
    ctx.addIssue({ code: "custom", message: `« ${question.label} » contient des choix identiques.` });
  }
});

export const customFormSchema = z.object({
  title: z.string().trim().min(2, "Le titre est requis.").max(120),
  slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "L’adresse doit contenir des lettres minuscules, chiffres et tirets."),
  description: z.string().trim().max(2000),
  confirmation_message: z.string().trim().min(2, "Le message de confirmation est requis.").max(1000),
  status: z.enum(["draft", "published", "closed"]),
  blocks: z.array(formBlockSchema).min(1, "Conservez au moins un bloc.").max(20, "Un formulaire peut contenir jusqu’à 20 blocs.").default([defaultFormBlock]),
  notify_on_response: z.boolean().default(false),
  questions: z.array(questionSchema).max(40, "Un formulaire peut contenir jusqu’à 40 questions."),
}).superRefine((form, ctx) => {
  if (form.status === "published" && !form.questions.length) ctx.addIssue({ code: "custom", message: "Ajoutez une question avant de publier." });
  if (new Set(form.questions.map((question) => question.id)).size !== form.questions.length) ctx.addIssue({ code: "custom", message: "Deux questions partagent le même identifiant." });
  if (new Set(form.blocks.map((block) => block.id)).size !== form.blocks.length) ctx.addIssue({ code: "custom", message: "Deux blocs partagent le même identifiant." });
  for (const question of form.questions) {
    const block = form.blocks.find((item) => item.id === (question.block_id ?? form.blocks[0]?.id));
    if (!block || (question.block_title !== undefined && question.block_title !== block.title)) {
      ctx.addIssue({ code: "custom", message: `Vérifiez le bloc de « ${question.label} ».` });
    }
  }
});

export type CustomQuestion = z.infer<typeof questionSchema>;
export type FormBlock = z.infer<typeof formBlockSchema>;
export type QuestionBlock = FormBlock & { questions: CustomQuestion[] };
export type CustomForm = z.infer<typeof customFormSchema> & { id: string; revision: number; created_at: string; updated_at: string };
export type CustomAnswers = Record<string, string | string[]>;
export type CustomFormResponse = { id: string; form_id: string; revision: number; questions_snapshot: CustomQuestion[]; answers: CustomAnswers; created_at: string };
export type CustomFormActionState = { status: "idle" | "success" | "error"; message: string; revision?: number };
export const initialCustomFormActionState: CustomFormActionState = { status: "idle", message: "" };

// Legacy forms have no block metadata. Keep every question in the first block.
export function groupFormQuestions(blocks: FormBlock[] | undefined, questions: CustomQuestion[]): QuestionBlock[] {
  const groups = (blocks?.length ? blocks : [defaultFormBlock]).map((block) => ({ ...block, questions: [] as CustomQuestion[] }));
  for (const question of questions) {
    const group = groups.find((block) => block.id === question.block_id) ?? groups[0];
    group.questions.push(question);
  }
  return groups;
}

export function flattenFormBlocks(blocks: QuestionBlock[]): CustomQuestion[] {
  return blocks.flatMap((block) => block.questions.map((question) => ({
    ...question, block_id: block.id, block_title: block.title.trim(),
  })));
}

// Use the saved snapshot, never the current form's names or ordering.
export function groupResponseQuestions(questions: CustomQuestion[]): QuestionBlock[] {
  const blocks: FormBlock[] = [];
  for (const question of questions) {
    const id = question.block_id ?? defaultFormBlock.id;
    if (!blocks.some((block) => block.id === id)) blocks.push({ id, title: question.block_title ?? defaultFormBlock.title });
  }
  return groupFormQuestions(blocks, questions);
}

export function slugifyFormTitle(title: string) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100).replace(/-$/, "");
}

export function validateCustomAnswers(questions: CustomQuestion[], formData: FormData): { answers: CustomAnswers; error?: string } {
  const answers: CustomAnswers = {};
  for (const question of questions) {
    const key = `question_${question.id}`;
    const values = formData.getAll(key);
    if (values.some((value) => typeof value !== "string")) return { answers, error: "Les pièces jointes ne sont pas acceptées." };
    if (question.type === "multiple_choice") {
      const selected = values as string[];
      if ((question.required && !selected.length) || selected.some((value) => !question.options.includes(value)) || new Set(selected).size !== selected.length) {
        return { answers, error: `Vérifiez les choix pour « ${question.label} ».` };
      }
      answers[question.id] = selected;
      continue;
    }
    if (values.length > 1) return { answers, error: `Une seule réponse est attendue pour « ${question.label} ».` };
    const value = (values[0] as string | undefined ?? "").trim();
    if (question.required && !value) return { answers, error: `Répondez à « ${question.label} ».` };
    const maxLength = question.type === "long_text" ? 5000 : 500;
    if (value.length > maxLength) return { answers, error: `La réponse à « ${question.label} » est trop longue.` };
    if (value) {
      const invalid = (question.type === "email" && !z.email().safeParse(value).success)
        || (question.type === "phone" && !/^\+?[0-9\s().-]{6,30}$/.test(value))
        || (question.type === "number" && (!/^-?\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value))))
        || (question.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value))
        || (question.type === "single_choice" && !question.options.includes(value));
      if (invalid) return { answers, error: `La réponse à « ${question.label} » n’est pas valide.` };
    }
    answers[question.id] = value;
  }
  return { answers };
}
