import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log("UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f3f8ff] px-4 py-16 text-center">
          <div className="mx-auto max-w-[560px] rounded-[28px] border border-[#dbe7ff] bg-white p-8 shadow-[0_18px_45px_rgba(0,59,149,0.1)]">
            <h1 className="text-[30px] font-bold text-[#003b95]">
              Có lỗi xảy ra
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#5b6b88]">
              Trang đang gặp sự cố hiển thị. Bạn có thể tải lại trang hoặc quay
              về trang chủ để tiếp tục sử dụng VietStayHub.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="mt-6 rounded-2xl bg-[#006ce4] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#003b95]"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
