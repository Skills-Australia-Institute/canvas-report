export interface Account {
  id: number;
  name: string;
  parent_account_id: number | null;
  root_account_id: number | null;
  workflow_state: string;
}
