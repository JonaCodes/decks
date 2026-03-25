import { useState, useEffect } from 'react';

export function useDirtyForm(
  initialValues: Record<string, string>,
  resetKey: string
) {
  const [formValues, setFormValues] =
    useState<Record<string, string>>(initialValues);
  const [baseValues, setBaseValues] =
    useState<Record<string, string>>(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
    setBaseValues(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function setField(name: string, value: string) {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  const dirtyFields = Object.entries(formValues).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value !== (baseValues[key] ?? '')) acc[key] = value;
      return acc;
    },
    {}
  );

  const isDirty = Object.keys(dirtyFields).length > 0;

  function resetDirty() {
    setBaseValues({ ...formValues });
  }

  return { formValues, setField, dirtyFields, isDirty, resetDirty };
}
