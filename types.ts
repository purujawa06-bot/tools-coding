
export type AppStep = 'upload' | 'prompt' | 'xml' | 'preview';

export type FileMap = Map<string, string>;

export type ChangeAction = 'add' | 'rewrite' | 'delete' | 'same';

export interface FileChange {
  action: ChangeAction;
  path: string;
  code: string | null;
  reason: string | null;
}
