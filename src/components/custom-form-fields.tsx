"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitCustomForm } from "@/app/formulaires/[slug]/actions";
import { groupFormQuestions, initialCustomFormActionState, type CustomForm, type CustomAnswers } from "@/lib/custom-forms";

export function CustomFormFields({ form, submissionId }: { form: CustomForm; submissionId: string }) {
  const [state, action, pending] = useActionState(submitCustomForm.bind(null, form.slug), initialCustomFormActionState);
  const [answers, setAnswers] = useState<CustomAnswers>({});
  const [consent, setConsent] = useState(false);
  const blocks = groupFormQuestions(form.blocks, form.questions).filter((block) => block.questions.length);
  const questionIds = blocks.flatMap((block) => block.questions.map((question) => question.id));
  const update = (id: string, value: string | string[]) => setAnswers((previous) => ({ ...previous, [id]: value }));
  if (state.status === "success") return <div className="custom-form-success" role="status"><h2>Réponse enregistrée</h2><p>{state.message}</p><Link href="/">Retour au site →</Link></div>;
  return (
    <form action={action} className="custom-public-form">
      <input type="hidden" name="submission_id" value={submissionId} />
      <input type="hidden" name="revision" value={form.revision} />
      <p className="custom-form-hint">Les champs marqués d’un * sont obligatoires.</p>
      <fieldset disabled={pending} className="custom-public-fields">
        {blocks.map((block) => <section className="custom-public-block" key={block.id} aria-labelledby={`block_${block.id}`}>
          <h2 id={`block_${block.id}`}>{block.title}</h2>
        {block.questions.map((question) => {
          const index = questionIds.indexOf(question.id);
          const name = `question_${question.id}`;
          const helpId = `${name}_help`;
          const value = typeof answers[question.id] === "string" ? answers[question.id] as string : "";
          const label = <>{index + 1}. {question.label}{question.required ? <b aria-label="obligatoire"> *</b> : null}</>;
          if (question.type === "single_choice" || question.type === "multiple_choice") {
            const selected = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : [];
            return <fieldset className="custom-public-question" key={question.id} aria-describedby={question.help_text ? helpId : undefined}>
              <legend>{label}</legend>
              {question.help_text ? <p id={helpId} className="custom-form-hint">{question.help_text}</p> : null}
              <div className="custom-public-choices">{question.options.map((option) => <label key={option}>
                <input type={question.type === "multiple_choice" ? "checkbox" : "radio"} name={name} value={option} required={question.type === "single_choice" && question.required} checked={question.type === "multiple_choice" ? selected.includes(option) : value === option} onChange={(event) => update(question.id, question.type === "multiple_choice" ? (event.target.checked ? [...selected, option] : selected.filter((item) => item !== option)) : option)} /><span>{option}</span>
              </label>)}</div>
            </fieldset>;
          }
          return <div className="custom-public-question" key={question.id}>
            <label htmlFor={name}>{label}</label>
            {question.help_text ? <p id={helpId} className="custom-form-hint">{question.help_text}</p> : null}
            {question.type === "long_text" ? <textarea id={name} name={name} rows={4} maxLength={5000} required={question.required} aria-describedby={question.help_text ? helpId : undefined} value={value} onChange={(event) => update(question.id, event.target.value)} />
              : <input id={name} name={name} type={question.type === "short_text" ? "text" : question.type === "phone" ? "tel" : question.type} step={question.type === "number" ? "any" : undefined} maxLength={question.type === "phone" ? 30 : 500} required={question.required} aria-describedby={question.help_text ? helpId : undefined} value={value} onChange={(event) => update(question.id, event.target.value)} />}
          </div>;
        })}
        </section>)}
        <label className="custom-form-consent"><input type="checkbox" name="privacy_consent" required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>J’accepte que VIE AVENIR utilise mes réponses pour traiter ce formulaire. Elles sont accessibles uniquement à l’équipe autorisée. <Link href="/politique-confidentialite" target="_blank" rel="noreferrer">Politique de confidentialité ↗</Link></span></label>
        <label className="custom-form-honeypot" aria-hidden="true">Site web<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </fieldset>
      {state.status === "error" ? <p className="custom-form-error" role="alert">{state.message}</p> : null}
      <button type="submit" className="button button-pink" disabled={pending}>{pending ? "Envoi en cours…" : "Envoyer mes réponses"}</button>
    </form>
  );
}
