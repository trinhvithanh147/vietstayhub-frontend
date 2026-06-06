import { Link, useSearchParams } from "react-router-dom";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="container-custom py-16">
      <div className="mx-auto max-w-[620px] rounded-[28px] border border-[#dbe7ff] bg-white p-8 text-center shadow-[0_18px_45px_rgba(0,59,149,0.08)]">
        <h1 className="text-[28px] font-bold text-[#0f6b3f]">
          Thanh toán thành công
        </h1>

        <p className="mt-3 text-[#5b6b88]">
          Hệ thống đang xác nhận thanh toán cho đơn đặt phòng của bạn.
        </p>

        <p className="mt-2 text-sm text-[#6b7a99]">Mã booking: {bookingId}</p>

        <Link
          to="/host-dashboard"
          className="mt-6 inline-flex rounded-xl bg-[#006ce4] px-5 py-3 font-semibold text-white"
        >
          Xem đơn đặt phòng
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
