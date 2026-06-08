import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaHome,
  FaReceipt,
  FaTimesCircle,
} from "react-icons/fa";
import { BookingService } from "../../../../services/booking.service";

const stateStyles = {
  loading: {
    icon: FaClock,
    eyebrow: "Đang xử lý",
    title: "Đang xác nhận thanh toán",
    description:
      "Hệ thống đang kiểm tra giao dịch với PayOS cho đơn đặt phòng của bạn.",
    accent: "text-[#006ce4]",
    iconWrap: "bg-[#e8f2ff] text-[#006ce4]",
    panel: "border-[#cfe0ff] bg-[#f7fbff]",
  },
  error: {
    icon: FaExclamationTriangle,
    eyebrow: "Cần kiểm tra lại",
    title: "Chưa xác nhận được thanh toán",
    accent: "text-[#b42318]",
    iconWrap: "bg-[#fff1f0] text-[#b42318]",
    panel: "border-[#ffd6d1] bg-[#fff8f7]",
  },
  paid: {
    icon: FaCheckCircle,
    eyebrow: "Thanh toán hoàn tất",
    title: "Thanh toán thành công",
    description: "Đơn đặt phòng của bạn đã được xác nhận.",
    accent: "text-[#0f6b3f]",
    iconWrap: "bg-[#e8f7ef] text-[#0f6b3f]",
    panel: "border-[#cdebd9] bg-[#f5fbf7]",
  },
  cancelled: {
    icon: FaTimesCircle,
    eyebrow: "Giao dịch đã hủy",
    title: "Thanh toán đã bị hủy",
    description:
      "Giao dịch chưa hoàn tất. Bạn có thể quay lại chỗ nghỉ để đặt lại.",
    accent: "text-[#b45309]",
    iconWrap: "bg-[#fff4df] text-[#b45309]",
    panel: "border-[#ffe3aa] bg-[#fffbf2]",
  },
  pending: {
    icon: FaClock,
    eyebrow: "Chưa hoàn tất",
    title: "Thanh toán chưa hoàn tất",
    description:
      "PayOS chưa ghi nhận giao dịch thành công cho đơn đặt phòng này.",
    accent: "text-[#b45309]",
    iconWrap: "bg-[#fff4df] text-[#b45309]",
    panel: "border-[#ffe3aa] bg-[#fffbf2]",
  },
};

const PaymentSuccessPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const isCancelPage = location.pathname.includes("payment-cancel");
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(bookingId));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false);
      setErrorMessage("Không tìm thấy mã booking trong đường dẫn thanh toán.");
      return;
    }

    let isMounted = true;

    const syncPaymentStatus = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const res = await BookingService.syncPayOSPaymentStatus(bookingId);
        if (isMounted) {
          setBooking(res?.data?.metaData || null);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error?.response?.data?.message ||
              "Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    syncPaymentStatus();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const viewState = useMemo(() => {
    if (isLoading) return stateStyles.loading;

    if (errorMessage) {
      return {
        ...stateStyles.error,
        description: errorMessage,
      };
    }

    if (booking?.payment_status === "paid") return stateStyles.paid;

    if (booking?.payment_status === "cancelled" || isCancelPage) {
      return stateStyles.cancelled;
    }

    return stateStyles.pending;
  }, [booking?.payment_status, errorMessage, isCancelPage, isLoading]);

  const StatusIcon = viewState.icon;

  return (
    <section className="min-h-[calc(100vh-120px)] bg-[linear-gradient(180deg,#f4f8ff_0%,#ffffff_60%)] py-10 sm:py-14">
      <div className="container-custom">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dbe7ff] bg-white px-4 py-2 text-sm font-semibold text-[#003b95] shadow-sm transition hover:bg-[#f3f8ff]"
        >
          <FaArrowLeft className="text-[12px]" />
          Về trang chủ
        </Link>

        <div className="mx-auto max-w-[760px] overflow-hidden rounded-[28px] border border-[#dbe7ff] bg-white shadow-[0_24px_70px_rgba(0,59,149,0.12)]">
          <div className="bg-[linear-gradient(135deg,#003b95_0%,#006ce4_100%)] px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">
                  VietStayHub
                </p>
                <h1 className="mt-2 text-[26px] font-bold leading-tight sm:text-[34px]">
                  Kết quả thanh toán
                </h1>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20">
                <FaReceipt />
                PayOS
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div
              className={`rounded-[22px] border px-5 py-5 sm:px-6 ${viewState.panel}`}
            >
              <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                <div
                  className={`mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[30px] sm:mx-0 ${viewState.iconWrap}`}
                >
                  <StatusIcon />
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] shadow-sm ${viewState.accent}`}
                  >
                    {viewState.eyebrow}
                  </span>
                  <h2
                    className={`mt-3 text-[24px] font-bold leading-tight sm:text-[30px] ${viewState.accent}`}
                  >
                    {viewState.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-6 text-[#52657f]">
                    {viewState.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[20px] border border-[#dbe7ff] bg-[#f8fbff] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7a99]">
                  Mã booking
                </p>
                <p className="mt-2 break-all text-[15px] font-bold text-[#1f3b63]">
                  {bookingId || "Không có dữ liệu"}
                </p>
              </div>

              <div className="rounded-[20px] border border-[#dbe7ff] bg-[#f8fbff] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b7a99]">
                  Trạng thái đơn
                </p>
                <p className="mt-2 text-[15px] font-bold text-[#1f3b63]">
                  {booking?.status || (isLoading ? "Đang kiểm tra" : "Chưa xác định")}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/host-dashboard"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#006ce4] px-5 text-[15px] font-bold text-white shadow-[0_14px_28px_rgba(0,108,228,0.24)] transition hover:bg-[#003b95]"
              >
                Xem đơn đặt phòng
              </Link>
              <Link
                to="/"
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#c9d8f2] bg-white px-5 text-[15px] font-bold text-[#1f3b63] transition hover:bg-[#f3f8ff]"
              >
                <FaHome />
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccessPage;
