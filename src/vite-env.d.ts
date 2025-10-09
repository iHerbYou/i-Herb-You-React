/// <reference types="vite/client" />

// Daum 우편번호 서비스 타입 정의
interface DaumPostcodeData {
  zonecode: string;
  address: string;
  addressEnglish: string;
  addressType: 'R' | 'J';
  userSelectedType: 'R' | 'J';
  noSelected: 'Y' | 'N';
  userLanguageType: 'K' | 'E';
  roadAddress: string;
  roadAddressEnglish: string;
  jibunAddress: string;
  jibunAddressEnglish: string;
  autoRoadAddress: string;
  autoRoadAddressEnglish: string;
  autoJibunAddress: string;
  autoJibunAddressEnglish: string;
  buildingCode: string;
  buildingName: string;
  apartment: 'Y' | 'N';
  sido: string;
  sigungu: string;
  sigunguCode: string;
  roadnameCode: string;
  bcode: string;
  roadname: string;
  bname: string;
  bname1: string;
  bname2: string;
  hname: string;
  query: string;
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
  onclose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void;
  onsearch?: (data: { q: string; count: number }) => void;
  width?: string | number;
  height?: string | number;
  animation?: boolean;
  focusInput?: boolean;
  focusContent?: boolean;
}

interface DaumPostcode {
  new (options: DaumPostcodeOptions): {
    open: () => void;
    embed: (element: HTMLElement, options?: { q?: string; autoClose?: boolean }) => void;
  };
}

interface Window {
  daum: {
    Postcode: DaumPostcode;
  };
}

// 토스페이먼츠 SDK 타입 정의 (위젯 방식)
declare namespace TossPayments {
  interface PaymentWidgetOptions {
    customerKey: string;
  }

  interface PaymentMethodWidget {
    render: () => void;
    updateAmount: (amount: number) => void;
  }

  interface AgreementWidget {
    render: () => void;
  }

  interface PaymentWidget {
    setAmount: (amount: { currency: string; value: number }) => Promise<void>;
    renderPaymentMethods: (options: {
      selector: string;
      variantKey?: string;
    }) => Promise<PaymentMethodWidget>;
    renderAgreement: (options: {
      selector: string;
      variantKey?: string;
    }) => Promise<AgreementWidget>;
    requestPayment: (options: {
      orderId: string;
      orderName: string;
      successUrl?: string;
      failUrl?: string;
      customerEmail?: string;
      customerName?: string;
      customerMobilePhone?: string;
    }) => Promise<void>;
  }

  interface TossPaymentsInstance {
    widgets: (options: PaymentWidgetOptions) => PaymentWidget;
  }
}

interface Window {
  TossPayments?: (clientKey: string) => TossPayments.TossPaymentsInstance;
}
