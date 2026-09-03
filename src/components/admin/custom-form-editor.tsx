"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveCustomForm } from "@/app/admin/form-actions";
import { ActionMessage } from "@/components/admin/action-message";
import {
  initialCustomFormActionState, isChoiceQuestion, questionTypes, questionTypeLabels, slugifyFormTitle,
  type CustomForm, type CustomQuestion, type QuestionType,
} from "@/lib/custom-forms";

export function CustomFormEditor({ form }: { form?: CustomForm }) {
  const [state, action, pending] = useActionState(saveCustomForm.bind(null, form?.id ?? null), initialCustomFormActionState);
  const [title, setTitle] = useState(form?.title ?? "");
  const [slug, setSlug] = useState(form?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(form));
  const [description, setDescription] = useState(form?.description ?? "");
  const [confirmation, setConfirmation] = useState(form?.confirmation_message ?? "Merci ! Votre réponse a bien été enregistrée.");
  const [status, setStatus] = useState(form?.status ?? "draft");
  const [questions, setQuestions] = useState<CustomQuestion[]>(form?.questions ?? []);

  function updateQuestion(id: string, update: Partial<CustomQuestion>) {
    setQuestions((items) => items.map((item) => item.id === id ? { ...item, ...update } : item));
  }
  function moveQuestion(index: number, offset: number) {
    setQuestions((items) => {
      const next = [...items];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }
  function addQuestion() {
    setQuestions((items) => [...items, { id: crypto.randomUUID(), label: "", help_text: "", type: "short_text", required: false, options: [] }]);
  }

  return (
    <form action={action} className="admin-form custom-form-editor">
      <input type="hidden" name="questions" value={JSON.stringify(questions)} />
      <input type="hidden" name="revision" value={state.revision ?? form?.revision ?? 1} />
      <fieldset className="custom-form-editor-fields" disabled={pending}>
        <section className="admin-form-card">
          <div className="admin-form-card-heading"><span>01</span><div><h2>Le formulaire</h2><p>Donnez un titre clair et expliquez à quoi serviront les réponses.</p></div></div>
          <div className="admin-fields-grid">
            <label className="admin-field admin-field-wide"><span>Titre <b>*</b></span><input name="title" required maxLength={120} value={title} onChange={(event) => { setTitle(event.target.value); if (!slugEdited) setSlug(slugifyFormTitle(event.target.value)); }} /></label>
            <label className="admin-field admin-field-wide"><span>Adresse du formulaire <b>*</b></span><div className="custom-form-slug"><span>/formulaires/</span><input name="slug" required minLength={3} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlugEdited(true); setSlug(event.target.value); }} /></div><small className="admin-field-note">{form ? "Modifier cette adresse rendra l’ancien lien inutilisable." : "Cette adresse est proposée à partir du titre et reste modifiable."}</small></label>
            <label className="admin-field admin-field-wide"><span>Description et utilisation des réponses</span><textarea name="description" rows={3} maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
            <label className="admin-field"><span>État</span><select name="status" value={status} onChange={(event) => setStatus(event.target.value as CustomForm["status"])}><option value="draft">Brouillon — visible uniquement par les admins</option><option value="published">Publié — accepte les réponses</option><option value="closed">Fermé — n’accepte plus de réponses</option></select></label>
            <label className="admin-field"><span>Message après l’envoi <b>*</b></span><textarea name="confirmation_message" required rows={3} maxLength={1000} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
          </div>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-card-heading"><span>02</span><div><h2>Les questions <small>({questions.length}/40)</small></h2><p>Ajoutez uniquement les informations utiles. Évitez de demander des données sensibles.</p></div></div>
          <div className="custom-question-list">
            {questions.map((question, index) => (
              <section className="custom-question-card" aria-label={`Question ${index + 1}`} key={question.id}>
                <header><strong>Question {index + 1}</strong><div className="custom-question-tools">
                  <button type="button" disabled={index === 0} aria-label={`Monter la question ${index + 1}`} onClick={() => moveQuestion(index, -1)}>↑</button>
                  <button type="button" disabled={index === questions.length - 1} aria-label={`Descendre la question ${index + 1}`} onClick={() => moveQuestion(index, 1)}>↓</button>
                  <button type="button" onClick={() => setQuestions((items) => items.filter((item) => item.id !== question.id))}>Retirer</button>
                </div></header>
                <div className="admin-fields-grid">
                  <label className="admin-field"><span>Intitulé <b>*</b></span><input required maxLength={200} value={question.label} onChange={(event) => updateQuestion(question.id, { label: event.target.value })} /></label>
                  <label className="admin-field"><span>Type de réponse</span><select value={question.type} onChange={(event) => { const type = event.target.value as QuestionType; updateQuestion(question.id, { type, options: isChoiceQuestion(type) ? (question.options.length ? question.options : ["Option 1", "Option 2"]) : [] }); }}>{questionTypes.map((type) => <option value={type} key={type}>{questionTypeLabels[type]}</option>)}</select></label>
                  <label className="admin-field admin-field-wide"><span>Aide à la réponse (facultative)</span><input maxLength={500} value={question.help_text} onChange={(event) => updateQuestion(question.id, { help_text: event.target.value })} /></label>
                  {isChoiceQuestion(question.type) ? <label className="admin-field admin-field-wide"><span>Choix proposés <b>*</b></span><textarea required rows={Math.min(6, Math.max(3, question.options.length))} value={question.options.join("\n")} onChange={(event) => updateQuestion(question.id, { options: event.target.value.split("\n") })} /><small className="admin-field-note">Une option par ligne, de 2 à 20 options, sans ligne vide.</small></label> : null}
                  <label className="admin-switch-field"><input type="checkbox" checked={question.required} onChange={(event) => updateQuestion(question.id, { required: event.target.checked })} />Réponse obligatoire</label>
                </div>
              </section>
            ))}
            {!questions.length ? <div className="admin-empty-state"><strong>Aucune question pour l’instant.</strong><p>Ajoutez la première question pour commencer.</p></div> : null}
          </div>
          <button className="custom-form-add-button" type="button" disabled={questions.length >= 40} onClick={addQuestion}>＋ Ajouter une question</button>
          {form ? <p className="custom-form-hint">Les réponses déjà reçues conservent les questions de leur version d’origine.</p> : null}
        </section>
      </fieldset>
      <div className="admin-form-actions">
        <ActionMessage state={state} />
        {form ? <Link href={`/admin/formulaires/${form.id}/reponses`} className="admin-preview-link">Voir les réponses</Link> : null}
        <button className="admin-primary-button" type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer le formulaire"}</button>
      </div>
    </form>
  );
}
