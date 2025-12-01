"use client";

import { useState } from "react";

const TermsPage = () => {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const handleNext = () => {
    if (agreedTerms && agreedPrivacy) {
      // Google OAuth 로그인 페이지로 이동
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_GOOGLE_LOGIN_PATH}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-3xl w-full bg-white p-6 rounded-2xl shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center">서비스 약관 및 개인정보 처리방침</h1>

        <div className="bg-gray-50 p-4 rounded-xl space-y-4 max-h-[400px] overflow-y-auto">
          <h2 className="text-xl font-semibold">서비스 약관 (Terms of Service)</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>구글 OAuth 계정을 통해 로그인하며, 사용자는 자신의 계정 정보 보안에 책임이 있습니다.</li>
            <li>사용자는 불법 활동, 타인 권리 침해, 서비스 오용을 금지합니다.</li>
            <li>앱 내 콘텐츠와 브랜드는 회사 소유이며, 사용자가 생성한 콘텐츠는 회사에 비독점적 사용 권한을 부여합니다.</li>
            <li>서비스는 있는 그대로 제공되며, 특정 목적에 대한 보증은 없습니다. 서비스 이용으로 발생한 손해에 대해 회사는 책임을 지지 않습니다.</li>
            <li>회사는 사전 고지 없이 약관을 변경하거나 서비스를 중단할 수 있습니다.</li>
            <li>본 약관은 대한민국 법을 준거법으로 하며, 분쟁 발생 시 서울중앙지방법원을 관할 법원으로 합니다.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">개인정보 처리방침 (Privacy Policy)</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>구글 로그인 시 사용자의 이름, 이메일, 프로필 사진 등을 수집합니다.</li>
            <li>사용자가 업로드한 개인 자산 내역은 AI 분석 및 맞춤 재무 가이드 제공 목적으로만 사용됩니다.</li>
            <li>업로드된 데이터는 24시간 동안만 서버에 저장되며, 사용자가 로그아웃하면 즉시 삭제됩니다.</li>
            <li>사용자의 데이터를 제3자와 공유하지 않습니다.</li>
            <li>사용자는 언제든지 자신의 데이터 접근, 수정, 삭제를 요청할 수 있습니다.</li>
            <li>데이터는 안전한 암호화와 전송 방식(HTTPS)으로 보호됩니다.</li>
            <li>자세한 구글 개인정보 사용 방식은 <a href="https://policies.google.com/technologies/partner-sites" target="_blank" className="text-blue-600 underline">여기</a>를 참조하세요.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-800">서비스 약관에 동의합니다.</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-800">개인정보 처리방침에 동의합니다.</span>
          </label>
        </div>

        <button
          onClick={handleNext}
          disabled={!(agreedTerms && agreedPrivacy)}
          className={`w-full py-2 rounded-xl text-white font-semibold transition ${
            agreedTerms && agreedPrivacy
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Google 로그인 하기
        </button>
      </div>
    </div>
  );
};

export default TermsPage;
