// 펀드 상품 개별 아이템 타입 (백엔드 응답 형식)
export interface FundItem {
    id: number;              // id
    basDt: string;           // 기준일자 (ISO datetime)
    srtnCd: string | null;   // 단축코드
    fndNm: string | null;    // 펀드명
    ctg: string | null;      // 구분
    setpDt: string | null;   // 설정일 (ISO datetime)
    fndTp: string | null;    // 펀드유형
    prdClsfCd: string | null; // 상품분류코드
    asoStdCd: string | null;  // 협회표준코드
}

// API 응답 타입
export type FundApiResponse = FundItem[];

// 테이블 표시용 정리된 타입
export interface FundDisplayItem extends FundItem {
    displayId: string;
}

