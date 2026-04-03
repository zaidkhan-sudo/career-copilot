export interface ResumeVariant {
  id: string;
  variantTag: string;
  framingStrategy: string;
  targetCompany: string;
  targetRole: string;
  callbackCount: number;
  totalSent: number;
  callbackRate: number;
  companyNewsUsed?: string;
  createdAt: string;
  status: "ready" | "applied" | "draft";
}
