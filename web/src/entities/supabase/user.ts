export interface User {
  id: number;
  name: string;
  workflow_state: string;
  unique_id: string;
  sis_user_id: string;
  account_id: number;
  integration_id: string | null;
  sis_batch_id: number | null;
}
