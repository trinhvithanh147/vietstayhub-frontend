import React, { useEffect, useMemo, useState } from "react";
import ManageUser from "./components/ManageUser";
import ManageProperty from "./components/ManageProperty";
import ManageRoom from "./components/ManageRoom";
import ManageReview from "./components/ManageReview";
import ManageBooking from "./components/ManageBooking";
import AdminStatisticsCharts from "./components/AdminStatisticsCharts";
import { statisticService } from "../../services/statistic.service";

const AdminPage = () => {
  const [tab, setTab] = useState("statistics");
  const [statistics, setStatistics] = useState(null);
  const [statisticsError, setStatisticsError] = useState("");

  const tabs = useMemo(
    () => [
      { id: "statistics", label: "Thống kê" },
      { id: "users", label: "Người dùng" },
      { id: "properties", label: "Lưu trú" },
      { id: "rooms", label: "Phòng" },
      { id: "bookings", label: "Đặt phòng" },
      { id: "reviews", label: "Đánh giá" },
    ],
    [],
  );

  useEffect(() => {
    statisticService
      .getAdminStatistics()
      .then((res) => {
        setStatistics(res.data.metaData);
      })
      .catch((err) => {
        console.log(err);
        setStatisticsError("Không tải được dữ liệu thống kê");
      });
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-[22px] border border-[#dbe7ff] bg-white p-5 shadow-[0_18px_55px_rgba(0,59,149,0.08)] sm:rounded-[28px] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-4 py-2 text-xs font-semibold tracking-[0.1em] text-[#0b2f6a] sm:tracking-[0.16em]">
              ADMIN CONSOLE
            </div>
            <h1 className="mt-4 text-[26px] font-bold leading-tight text-[#0b2f6a] md:text-[34px]">
              Quản lý hệ thống
            </h1>
            <p className="mt-2 max-w-[720px] text-sm leading-7 text-[#5b6b86]">
              Xem nhanh thống kê dữ liệu và thao tác CRUD.
            </p>
          </div>

          <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={
                  tab === item.id
                    ? "h-10 shrink-0 rounded-full bg-[#006ce4] px-4 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,108,228,0.22)]"
                    : "h-10 shrink-0 rounded-full border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "statistics" && (
        <>
          {statisticsError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {statisticsError}
            </div>
          )}

          {!statistics && !statisticsError && (
            <div className="rounded-2xl border border-[#dbe7ff] bg-white p-5 text-sm text-[#5b6b86]">
              Đang tải thống kê...
            </div>
          )}

          {statistics && <AdminStatisticsCharts charts={statistics.charts} />}
        </>
      )}

      {tab === "users" && <ManageUser />}
      {tab === "properties" && <ManageProperty />}
      {tab === "rooms" && <ManageRoom />}
      {tab === "bookings" && <ManageBooking />}
      {tab === "reviews" && <ManageReview />}
    </div>
  );
};

export default AdminPage;
