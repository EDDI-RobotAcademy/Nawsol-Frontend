export interface CreateFinanceRequest {
    user_id: string;
    type: "ETF" | "FUND" | "BOND";
    base_dt: string;
    key: string;
    value: string;
}

export interface FinanceResponse {
    id?: string;
    user_id: string;
    type: string;
    base_dt: string;
    key: string;
    value: string;
    created_at?: string;
}