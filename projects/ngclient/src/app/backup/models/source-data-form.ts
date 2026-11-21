import { FormBuilder } from '@angular/forms';

const fb = new FormBuilder();

export const createSourceDataForm = () => {
  return fb.group({
    excludes: fb.group({
      filesLargerThan: fb.group({
        size: fb.control<number | null>(null),
        unit: fb.control<string | null>(null),
      }),
    }),
  });
};

export type SourceDataFormValue = ReturnType<typeof createSourceDataForm>['value'] & { path?: string | null };
