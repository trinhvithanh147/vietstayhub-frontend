import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { BookingService } from "../../../../services/booking.service";

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
    if (isLoading) {
      return {
        title: "Đang xác nhận thanh toán",
        description:
          "Hệ thống đang kiểm tra giao dịch với PayOS cho đơn đặt phòng của bạn.",
        titleClass: "text-[#006ce4]",
      };
    }

    if (errorMessage) {
      return {
        title: "Chưa xác nhận được thanh toán",
        description: errorMessage,
        titleClass: "text-[#b42318]",
      };
    }

    if (booking?.payment_status === "paid") {
      return {
        title: "Thanh toán thành công",
        description: "Đơn đặt phòng của bạn đã được xác nhận.",
        titleClass: "text-[#0f6b3f]",
      };
    }

    if (booking?.payment_status === "cancelled" || isCancelPage) {
      return {
        title: "Thanh toán đã bị hủy",
        description:
          "Giao dịch chưa hoàn tất. Bạn có thể quay lại chỗ nghỉ để đặt lại.",
        titleClass: "text-[#b45309]",
      };
    }

    return {
      title: "Thanh toán chưa hoàn tất",
      description:
        "PayOS chưa ghi nhận giao dịch thành công cho đơn đặt phòng này.",
      titleClass: "text-[#b45309]",
    };
  }, [booking?.payment_status, errorMessage, isCancelPage, isLoading]);

  return (
    <div className="container-custom py-16">
      <div className="mx-auto max-w-[620px] rounded-[28px] border border-[#dbe7ff] bg-white p-8 text-center shadow-[0_18px_45px_rgba(0,59,149,0.08)]">
        <h1 className={`text-[28px] font-bold ${viewState.titleClass}`}>
          {viewState.title}
        </h1>

        <p className="mt-3 text-[#5b6b88]">{viewState.description}</p>

        {bookingId && (
          <p className="mt-2 text-sm text-[#6b7a99]">Mã booking: {bookingId}</p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/host-dashboard"
            className="inline-flex rounded-xl bg-[#006ce4] px-5 py-3 font-semibold text-white"
          >
            Xem đơn đặt phòng
          </Link>
          <Link
            to="/"
            className="inline-flex rounded-xl border border-[#c9d8f2] px-5 py-3 font-semibold text-[#1f3b63]"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
