/**
 * API 인터셉터 유틸리티
 * HTTP 에러 코드에 따라 적절한 에러 페이지로 리다이렉트
 */

interface FetchOptions extends RequestInit {
    skipErrorHandling?: boolean; // 에러 핸들링을 건너뛸지 여부
}

/**
 * fetch API를 래핑한 함수
 * 401, 500 등의 에러 발생 시 자동으로 해당 에러 페이지로 리다이렉트
 */
export async function apiFetch(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { skipErrorHandling, ...fetchOptions } = options;

    try {
        const response = await fetch(url, fetchOptions);

        // 에러 핸들링을 건너뛰지 않는 경우에만 처리
        if (!skipErrorHandling && !response.ok) {
            const status = response.status;

            // 401 Unauthorized - 인증 에러
            if (status === 401) {
                // 현재 경로가 이미 에러 페이지가 아닌 경우에만 리다이렉트
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/error-401')) {
                    window.location.href = '/error-401';
                    // 리다이렉트 후 응답을 반환하지 않음
                    throw new Error('Unauthorized');
                }
            }

            // 500 Internal Server Error - 서버 에러
            if (status === 500) {
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/error-500')) {
                    window.location.href = '/error-500';
                    throw new Error('Internal Server Error');
                }
            }

            // 기타 4xx, 5xx 에러는 그대로 반환 (컴포넌트에서 처리)
        }

        return response;
    } catch (error: unknown) {
        // 에러 타입 가드
        const isError = (e: unknown): e is Error => {
            return e instanceof Error;
        };

        // 네트워크 에러나 기타 에러 처리
        if (isError(error) && (error.message === 'Unauthorized' || error.message === 'Internal Server Error')) {
            // 이미 리다이렉트된 경우 에러를 다시 throw하지 않음
            throw error;
        }

        // 네트워크 에러 감지 (Failed to fetch, NetworkError, TypeError 등)
        const isNetworkError = isError(error) && (
            error.message?.toLowerCase().includes('failed to fetch') ||
            error.message?.toLowerCase().includes('networkerror') ||
            error.message?.toLowerCase().includes('network request failed') ||
            error.name === 'TypeError' ||
            error.name === 'NetworkError'
        );

        // 네트워크 에러 등의 경우 500 에러 페이지로 리다이렉트
        if (!skipErrorHandling && isNetworkError && typeof window !== 'undefined' && !window.location.pathname.startsWith('/error-500')) {
            console.error('Network error detected:', error);
            window.location.href = '/error-500';
            throw new Error('Network Error');
        }

        throw error;
    }
}

/**
 * JSON 응답을 파싱하는 헬퍼 함수
 */
export async function apiFetchJson<T = unknown>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const response = await apiFetch(url, options);
    return response.json();
}

