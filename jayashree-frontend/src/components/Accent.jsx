/** Renders "with *Trust*" as "with <em>Trust</em>" (orange italic accent). Safe: no HTML is interpreted. */
export default function Accent({ text }) {
  const parts = String(text || '').split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em> : part,
  );
}

/** Plain text without the accent markers, for document titles and alt text. */
export const plain = (text) => String(text || '').replace(/\*/g, '');
