import { useState } from 'react';
import { sendInsertSlide } from './bridge.js';

export const TITLE_FIELD_NAME = 'title';

export function useBackgroundInserts() {
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  function insert(templateKey: string, values: Record<string, string>) {
    setPending((p) => p + 1);
    sendInsertSlide(templateKey, values)
      .catch((err) =>
        setErrors((prev) => [
          ...prev,
          err instanceof Error ? err.message : String(err),
        ])
      )
      .finally(() => setPending((p) => p - 1));
  }

  function clearErrors() {
    setErrors([]);
  }

  return { pending, errors, insert, clearErrors };
}
