export interface Client {
  id?: string;          // generado por Firestore
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: number;
}
