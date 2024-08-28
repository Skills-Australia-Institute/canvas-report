export interface Pseudonym {
  id: number;
  user_id: number;
  worflow_state: 'suspended' | 'active' | 'deleted';
  unique_id: string;
  sis_user_id: string | null;
  account_id: number;
}
