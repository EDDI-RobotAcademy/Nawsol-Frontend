// ETF 상품 개별 아이템 타입 (백엔드 응답 형식)
export interface EtfItem {
    id: number;              // id
    fltRt: number;           // 등락률
    nav: number;             // 순자산가치(NAV)
    mkp: number;             // 시가
    hipr: number;            // 고가
    lopr: number;            // 저가
    trqu: number;            // 거래량
    trPrc: number;           // 거래대금
    mrktTotAmt: number;      // 시가총액
    nPptTotAmt: number;      // 순자산총액
    stLstgCnt: number;       // 상장주식수
    bssIdxIdxNm: string;     // 기초지수명
    bssIdxClpr: number;      // 기초지수종가
    basDt: string;           // 기준일자 (ISO datetime)
    clpr: number;            // 종가
    vs: number;              // 대비
}

// API 응답 타입
export type EtfApiResponse = EtfItem[];

// 테이블 표시용 정리된 타입
export interface EtfDisplayItem extends EtfItem {
    displayId: string;
}