import React from "react";
import { Link } from "react-router-dom";

const footerLinks = [
  "Đặt phòng",
  "Khách sạn",
  "Khuyến mãi",
  "Hỗ trợ khách hàng",
];

const Footer = () => {
  return (
    <footer className="mt-16 bg-[linear-gradient(180deg,var(--color-primary)_0%,#02285f_100%)] text-white">
      <div className="container-custom grid gap-10 py-12 md:grid-cols-[1.3fr_1fr]">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-white/90">
            Booking style
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            Đặt phòng nhanh, giao diện gọn và dễ quản lý trên một hệ thống.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/80">
            Tìm kiếm theo thành phố, xem chi tiết khách sạn, đặt phòng và quản
            lý đơn đặt phòng trong một trải nghiệm đồng bộ.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {footerLinks.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-white/8 p-5 backdrop-blur-sm">
            <span className="block text-sm text-white/70">Danh mục</span>
            <div className="mt-4 space-y-3 text-sm text-white/90">
              <Link to="/" className="block transition hover:text-white">
                Trang chủ
              </Link>
              <Link
                to="/properties/da-lat"
                className="block transition hover:text-white"
              >
                Khách sạn Đà Lạt
              </Link>
              <Link
                to="/properties/da-nang"
                className="block transition hover:text-white"
              >
                Khách sạn Đà Nẵng
              </Link>
              <Link
                to="/host-dashboard"
                className="block transition hover:text-white"
              >
                Quản lý đặt phòng
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] bg-white/8 p-5 backdrop-blur-sm">
            <span className="block text-sm text-white/70">Thông tin nhanh</span>
            <div className="mt-4 space-y-3 text-sm text-white/90">
              <span className="block">Email: support@bookingweb.local</span>
              <span className="block">Hotline: 1900 1234</span>
              <span className="block">Hỗ trợ đặt phòng 24/7</span>
              <span className="block">
                Giao diện xây dựng bằng React + Tailwind
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col gap-3 px-4 py-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Booking Web. All rights reserved.</span>
          <span>Designed with the primary brand colors of your project.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
