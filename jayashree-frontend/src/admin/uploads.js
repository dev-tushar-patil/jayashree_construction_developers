import { adminApi } from '../services/api.js';
import { chunk, compressImage } from '../services/imageCompression.js';

const BATCH = 4;

/**
 * Compresses and uploads picked photos in small batches, reporting progress (0-100).
 * `send(formData)` posts one batch and returns its response data. Returns the last response.
 */
export async function uploadInBatches(picked, buildForm, send, onProgress) {
  const groups = chunk(picked, BATCH);
  let done = 0;
  let last = null;
  onProgress?.(1, `Preparing ${picked.length} photo${picked.length === 1 ? '' : 's'}…`);
  for (const group of groups) {
    const files = await Promise.all(group.map((p) => compressImage(p.file)));
    const form = buildForm(files, group);
    last = await send(form);
    done += group.length;
    onProgress?.(Math.round((done / picked.length) * 100), `Uploaded ${done} of ${picked.length}`);
  }
  return last;
}

export const projectImageUpload = (projectId, picked, onProgress) =>
  uploadInBatches(
    picked,
    (files) => {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      return form;
    },
    (form) => adminApi.post(`/admin/projects/${projectId}/images`, form).then((r) => r.data),
    onProgress,
  );
