import type { AssessResponse } from '@/types/api';

interface FormSnapshot {
  location: string;
  budget: string;
  category: string;
  community: string;
  annualIncome: string;
  isDefaulter: boolean;
  moratoriumMode: string;
}

class ResultStore {
  private _result: AssessResponse | null = null;
  private _form: FormSnapshot | null = null;

  set(result: AssessResponse, form?: FormSnapshot) {
    this._result = result;
    if (form) this._form = form;
  }

  get result(): AssessResponse | null {
    return this._result;
  }

  get form(): FormSnapshot | null {
    return this._form;
  }

  clear() {
    this._result = null;
    this._form = null;
  }
}

export const resultStore = new ResultStore();
