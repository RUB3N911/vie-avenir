"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabaseConfig } from "@/lib/supabase/env";

const allowedTypes = new Map<string, { extension: string; type: "photo" | "video"; maxSize: number }>([
  ["image/jpeg", { extension: "jpg", type: "photo", maxSize: 10 * 1024 * 1024 }],
  ["image/png", { extension: "png", type: "photo", maxSize: 10 * 1024 * 1024 }],
  ["image/webp", { extension: "webp", type: "photo", maxSize: 10 * 1024 * 1024 }],
  ["video/mp4", { extension: "mp4", type: "video", maxSize: 50 * 1024 * 1024 }],
  ["video/webm", { extension: "webm", type: "video", maxSize: 50 * 1024 * 1024 }],
  ["video/quicktime", { extension: "mov", type: "video", maxSize: 50 * 1024 * 1024 }],
]);

const resumableThreshold = 6 * 1024 * 1024;

async function resumableUpload(file: File, path: string, accessToken: string, onProgress: (percent: number) => void) {
  const tus = await import("tus-js-client");
  const { url } = getSupabaseConfig();
  return new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${url}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: { authorization: `Bearer ${accessToken}`, "x-upsert": "false" },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName: "gallery-media",
        objectName: path,
        contentType: file.type,
        cacheControl: "3600",
      },
      onError: reject,
      onProgress(bytesUploaded, bytesTotal) {
        onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess() { resolve(); },
    });
    upload.findPreviousUploads().then((previous) => {
      if (previous[0]) upload.resumeFromPreviousUpload(previous[0]);
      upload.start();
    }).catch(reject);
  });
}

export function GalleryMediaUploader({ albumId, initialOrder }: { albumId: string; initialOrder: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function uploadFiles() {
    const files = Array.from(inputRef.current?.files ?? []);
    if (!files.length) return setMessage({ kind: "error", text: "Choisissez au moins une photo ou une vidéo." });
    if (!consent) return setMessage({ kind: "error", text: "Confirmez l’autorisation de diffusion avant l’envoi." });

    setUploading(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      setUploading(false);
      return setMessage({ kind: "error", text: "Votre session a expiré. Reconnectez-vous avant de recommencer." });
    }

    try {
      for (const [index, file] of files.entries()) {
        const config = allowedTypes.get(file.type);
        if (!config) throw new Error(`${file.name} : format non pris en charge.`);
        if (file.size > config.maxSize) throw new Error(`${file.name} dépasse la taille maximale autorisée.`);

        const path = `${albumId}/${crypto.randomUUID()}.${config.extension}`;
        setProgress(Math.round((index / files.length) * 100));
        if (file.size > resumableThreshold) {
          await resumableUpload(file, path, session.access_token, (fileProgress) => {
            setProgress(Math.round(((index + fileProgress / 100) / files.length) * 100));
          });
        } else {
          const { error } = await supabase.storage.from("gallery-media").upload(path, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });
          if (error) throw new Error(`${file.name} : ${error.message}`);
        }

        const fileUrl = supabase.storage.from("gallery-media").getPublicUrl(path).data.publicUrl;
        const { error: insertError } = await supabase.from("gallery_media").insert({
          album_id: albumId,
          media_type: config.type,
          file_url: fileUrl,
          storage_path: path,
          title: file.name.replace(/\.[^.]+$/, ""),
          mime_type: file.type,
          file_size: file.size,
          display_order: initialOrder + index,
          published: false,
          consent_confirmed: true,
          updated_by: session.user.id,
        });
        if (insertError) {
          await supabase.storage.from("gallery-media").remove([path]);
          throw new Error(`${file.name} : ${insertError.message}`);
        }
      }

      setProgress(100);
      setMessage({ kind: "success", text: `${files.length} média${files.length > 1 ? "s ont" : " a"} bien été ajouté${files.length > 1 ? "s" : ""}. Ils restent en brouillon.` });
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Envoi impossible." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="admin-form-card admin-gallery-uploader">
      <div className="admin-form-card-heading"><span>02</span><div><h2>Ajouter des médias</h2><p>Photos JPG, PNG ou WebP (10 Mo) · vidéos MP4, WebM ou MOV (50 Mo).</p></div></div>
      <label className="admin-field admin-file-field"><span>Photos et vidéos</span><input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" disabled={uploading} /></label>
      <label className="admin-check-field admin-consent-field"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} disabled={uploading} /><span><strong>Autorisation de diffusion confirmée</strong><small>Je confirme que l’association dispose des autorisations nécessaires, notamment pour toute personne mineure identifiable.</small></span></label>
      {uploading ? <div className="admin-upload-progress" aria-live="polite"><span style={{ width: `${progress}%` }} /><strong>Envoi en cours — {progress}%</strong></div> : null}
      {message ? <p className={`admin-form-message is-${message.kind}`} role="status">{message.text}</p> : null}
      <button className="admin-primary-button" type="button" onClick={uploadFiles} disabled={uploading}>{uploading ? "Envoi en cours…" : "Ajouter à l’album"}</button>
    </section>
  );
}
