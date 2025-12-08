// ETF 상품 개별 아이템 타입
export interface EtfItem {
    fltRt: string;           // 등락률
    nav: string;             // 순자산가치(NAV)
    mkp: string;             // 시가
    hipr: string;            // 고가
    lopr: string;            // 저가
    trqu: string;            // 거래량
    trPrc: string;           // 거래대금
    mrktTotAmt: string;      // 시가총액
    nPptTotAmt: string;      // 순자산총액
    stLstgCnt: string;       // 상장주식수
    bssIdxIdxNm: string;     // 기초지수명
    bssIdxClpr: string;      // 기초지수종가
    basDt: string;           // 기준일자
    clpr: string;            // 종가
    vs: string;              // 대비
}

// API 응답 타입
export interface EtfApiResponse {
    source: string;
    fetched_at: string;
    items: EtfItem[];
}

// 테이블 표시용 정리된 타입
export interface EtfDisplayItem extends EtfItem {
    id: string; // 고유 식별자 (basDt + bssIdxIdxNm 조합)
}