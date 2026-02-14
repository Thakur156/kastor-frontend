import { Cell } from "./cell";

export interface Notebook {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  cells: Cell[];
  metadata?: {
    icebergSnapshotId?: string;
    branch?: string;
    transactionId?: string;
  };
}
