export interface Pseudonym {
  id: number;
  user_id: number;
  worflow_state: string;
  unique_id: string;
  sis_user_id: string | null;
  account_id: number;
}
