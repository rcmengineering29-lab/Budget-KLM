export type BudgetRow = {
  tanggal: string;
  jenis_budget: string;
  kode: string;
  uraian: string;
  consumable_budget: number;
  consumed_budget: number;
  available_amount: number;
  current_budget: number;
  commitment_actuals: number;
};
export type BudgetUpload = { id: string; file_name: string; uploaded_at: string; row_count: number };
