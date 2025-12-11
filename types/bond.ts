// 채권 상품 개별 아이템 타입 (백엔드 응답 형식)
export interface BondItem {
    id: number;                      // id
    basDt: string;                   // 기준일자 (ISO datetime)
    crno: string | null;             // 법인등록번호
    bondIsurNm: string | null;       // 채권발행자명
    bondIssuDt: string | null;       // 채권발행일 (ISO datetime)
    scrsItmsKcd: string | null;      // 유가증권종목코드
    scrsItmsKcdNm: string | null;    // 유가증권종목코드명
    isinCd: string | null;           // ISIN코드
    isinCdNm: string | null;         // ISIN코드명
    bondIssuFrmtNm: string | null;  // 채권발행형태명
    bondExprDt: string | null;       // 채권만기일 (ISO datetime)
    bondIssuCurCd: string | null;    // 채권발행통화코드
    bondIssuCurCdNm: string | null; // 채권발행통화코드명
    bondPymtAmt: number | null;      // 채권상환금액
    bondIssuAmt: number | null;      // 채권발행금액
    bondSrfcInrt: number | null;      // 채권표면이자율
    irtChngDcd: string | null;       // 이자율변동구분코드
    irtChngDcdNm: string | null;     // 이자율변동구분코드명
    bondIntTcd: string | null;       // 채권이자유형코드
    bondIntTcdNm: string | null;     // 채권이자유형코드명
}

// API 응답 타입
export type BondApiResponse = BondItem[];

// 테이블 표시용 정리된 타입
export interface BondDisplayItem extends BondItem {
    displayId: string;
}

