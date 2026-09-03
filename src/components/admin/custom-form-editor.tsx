"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveCustomForm } from "@/app/admin/form-actions";
import { ActionMessage } from "@/components/admin/action-message";
import {
  defaultFormBlock, flattenFormBlocks, groupFormQuestions,
  initialCustomFormActionState, isChoiceQuestion, questionTypes, questionTypeLabels, slugifyFormTitle,
  type CustomForm, type CustomQuestion, type FormBlock, type QuestionType,
} from "@/lib/custom-forms";

export function CustomFormEditor({ form, emailConfigured }: { form?: CustomForm; emailConfigured: boolean }) {
  const [state, action, pending] = useActionState(saveCustomForm.bind(null, form?.id ?? null), initialCustomFormActionState);
  const [title, setTitle] = useState(form?.title ?? "");
  const [slug, setSlug] = useState(form?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(form));
  const [description, setDescription] = useState(form?.description ?? "");
  const [confirmation, setConfirmation] = useState(form?.confirmation_message ?? "Merci ! Votre réponse a bien été enregistrée.");
  const [status, setStatus] = useState(form?.status ?? "draft");
  const [questions, setQuestions] = useState<CustomQuestion[]>(() => flattenFormBlocks(groupFormQuestions(form?.blocks, form?.questions ?? [])));
  const [blocks, setBlocks] = useState<FormBlock[]>(form?.blocks?.length ? form.blocks : [defaultFormBlock]);
  const [notify, setNotify] = useState(form?.notify_on_response ?? false);
  const groupedQuestions = groupFormQuestions(blocks, questions);
  const orderedQuestions = flattenFormBlocks(groupedQuestions);

  function updateQuestion(id: string, update: Partial<CustomQuestion>) {
    setQuestions((items) => items.map((item) => item.id === id ? { ...item, ...update } : item));
  }
  function moveQuestion(id: string, targetId: string) {
    setQuestions((items) => {
      const next = [...items];
      const index = next.findIndex((item) => item.id === id);
      const target = next.findIndex((item) => item.id === targetId);
      if (index < 0 || target < 0) return items;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function addQuestion(blockId: string) {
    const id = crypto.randomUUID();
    setQuestions((items) => [...items, { id, block_id: blockId, label: "", help_text: "", type: "short_text", required: false, options: [] }]);
  }
  function moveBlock(index: number, offset: number) {
    setBlocks((items) => {
      const next = [...items];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }
  function addBlock() {
    const id = crypto.randomUUID();
    setBlocks((items) => [...items, { id, title: `Bloc ${items.length + 1}` }]);
  }

  return (
    <form action={action} className="admin-form custom-form-editor">
      <input type="hidden" name="questions" value={JSON.stringify(orderedQuestions)} />
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
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
            <div className="admin-field-wide custom-form-notification-setting">
              <label className="admin-switch-field"><input type="checkbox" name="notify_on_response" checked={notify} onChange={(event) => setNotify(event.target.checked)} />Recevoir un e-mail à chaque réponse</label>
              <p className="custom-form-hint">Notification envoyée à contact@vieavenir.fr avec un lien vers les réponses. L’adresse de réponse est également contact@vieavenir.fr.</p>
              {!emailConfigured ? <p className="custom-form-email-warning" role="status">L’envoi d’e-mails n’est pas configuré dans cet environnement. Configurez RESEND_API_KEY et RESEND_FROM_EMAIL pour recevoir les notifications. Les réponses restent enregistrées.</p> : null}
            </div>
          </div>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-card-heading"><span>02</span><div><h2>Blocs et questions <small>({questions.length}/40 questions)</small></h2><p>Regroupez les questions par thème et renommez chaque bloc. Ajoutez uniquement les informations utiles.</p></div></div>
          <div className="custom-block-list">
            {groupedQuestions.map((block, blockIndex) => <section className="custom-block-card" key={block.id} aria-label={`Bloc ${blockIndex + 1} : ${block.title}`}>
              <header className="custom-block-header">
                <label className="admin-field"><span>Nom du bloc {blockIndex + 1} <b>*</b></span><input required maxLength={120} value={block.title} onChange={(event) => setBlocks((items) => items.map((item) => item.id === block.id ? { ...item, title: event.target.value } : item))} /></label>
                <div className="custom-question-tools">
                  <button type="button" disabled={blockIndex === 0} aria-label={`Monter le bloc ${blockIndex + 1}`} onClick={() => moveBlock(blockIndex, -1)}>↑</button>
                  <button type="button" disabled={blockIndex === blocks.length - 1} aria-label={`Descendre le bloc ${blockIndex + 1}`} onClick={() => moveBlock(blockIndex, 1)}>↓</button>
                  <button type="button" disabled={blocks.length === 1 || block.questions.length > 0} title="Déplacez ou retirez d’abord les questions. Conservez au moins un bloc." onClick={() => setBlocks((items) => items.filter((item) => item.id !== block.id))}>Retirer le bloc</button>
                </div>
              </header>
              <div className="custom-question-list">
            {block.questions.map((question, index) => {
              const number = orderedQuestions.findIndex((item) => item.id === question.id) + 1;
              return <section className="custom-question-card" aria-label={`Question ${number}`} key={question.id}>
                <header><strong>Question {number}</strong><div className="custom-question-tools">
                  <button type="button" disabled={index === 0} aria-label={`Monter la question ${number}`} onClick={() => moveQuestion(question.id, block.questions[index - 1].id)}>↑</button>
                  <button type="button" disabled={index === block.questions.length - 1} aria-label={`Descendre la question ${number}`} onClick={() => moveQuestion(question.id, block.questions[index + 1].id)}>↓</button>
                  <button type="button" onClick={() => setQuestions((items) => items.filter((item) => item.id !== question.id))}>Retirer</button>
                </div></header>
                <div className="admin-fields-grid">
                  <label className="admin-field"><span>Intitulé <b>*</b></span><input required maxLength={200} value={question.label} onChange={(event) => updateQuestion(question.id, { label: event.target.value })} /></label>
                  <label className="admin-field"><span>Type de réponse</span><select value={question.type} onChange={(event) => { const type = event.target.value as QuestionType; updateQuestion(question.id, { type, options: isChoiceQuestion(type) ? (question.options.length ? question.options : ["Option 1", "Option 2"]) : [] }); }}>{questionTypes.map((type) => <option value={type} key={type}>{questionTypeLabels[type]}</option>)}</select></label>
                  <label className="admin-field admin-field-wide"><span>Aide à la réponse (facultative)</span><input maxLength={500} value={question.help_text} onChange={(event) => updateQuestion(question.id, { help_text: event.target.value })} /></label>
                  {blocks.length > 1 ? <label className="admin-field admin-field-wide"><span>Déplacer vers un bloc</span><select value={block.id} onChange={(event) => updateQuestion(question.id, { block_id: event.target.value, block_title: undefined })}>{blocks.map((item, position) => <option key={item.id} value={item.id}>{position + 1}. {item.title || "Bloc sans nom"}</option>)}</select></label> : null}
                  {isChoiceQuestion(question.type) ? <label className="admin-field admin-field-wide"><span>Choix proposés <b>*</b></span><textarea required rows={Math.min(6, Math.max(3, question.options.length))} value={question.options.join("\n")} onChange={(event) => updateQuestion(question.id, { options: event.target.value.split("\n") })} /><small className="admin-field-note">Une option par ligne, de 2 à 20 options, sans ligne vide.</small></label> : null}
                  <label className="admin-switch-field"><input type="checkbox" checked={question.required} onChange={(event) => updateQuestion(question.id, { required: event.target.checked })} />Réponse obligatoire</label>
                </div>
              </section>;
            })}
            {!block.questions.length ? <p className="custom-form-hint">Ce bloc est vide. Ajoutez une question ou déplacez-en une ici.</p> : null}
              </div>
              <button className="custom-form-add-button" type="button" disabled={questions.length >= 40} onClick={() => addQuestion(block.id)}>＋ Ajouter une question dans ce bloc</button>
            </section>)}
          </div>
          <button className="custom-form-add-button" type="button" disabled={blocks.length >= 20} onClick={addBlock}>＋ Ajouter un bloc ({blocks.length}/20)</button>
          <p className="custom-form-hint">Pour retirer un bloc, déplacez ou retirez d’abord ses questions. Les blocs vides ne sont pas affichés au public.</p>
          {form ? <p className="custom-form-hint">Les réponses déjà reçues conservent les questions et les noms des blocs de leur version d’origine.</p> : null}
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
