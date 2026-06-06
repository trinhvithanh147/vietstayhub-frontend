import React, { useMemo, useState } from "react";
import ManageUser from "./components/ManageUser";
import ManageProperty from "./components/ManageProperty";
import ManageRoom from "./components/ManageRoom";
import ManageReview from "./components/ManageReview";
import ManageBooking from "./components/ManageBooking";

const AdminPage = () => {
  const [tab, setTab] = useState("users");

  const tabs = useMemo(
    () => [
      { id: "users", label: "Users" },
      { id: "properties", label: "Properties" },
      { id: "rooms", label: "Rooms" },
      { id: "bookings", label: "Bookings" },
      { id: "reviews", label: "Reviews" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_55px_rgba(0,59,149,0.08)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-4 py-2 text-xs font-semibold tracking-[0.16em] text-[#0b2f6a]">
              ADMIN CONSOLE
            </div>
            <h1 className="mt-4 text-[28px] font-bold text-[#0b2f6a] md:text-[34px]">
              Quản lý hệ thống
            </h1>
            <p className="mt-2 max-w-[720px] text-sm leading-7 text-[#5b6b86]">
              Xem nhanh danh sách dữ liệu và thao tác CRUD.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={
                  tab === item.id
                    ? "h-10 rounded-full bg-[#006ce4] px-4 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,108,228,0.22)]"
                    : "h-10 rounded-full border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "users" && <ManageUser />}
      {tab === "properties" && <ManageProperty />}
      {tab === "rooms" && <ManageRoom />}
      {tab === "bookings" && <ManageBooking />}
      {tab === "reviews" && <ManageReview />}
    </div>
  );
};

export default AdminPage;
