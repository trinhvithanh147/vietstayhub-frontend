import React, { useEffect, useMemo, useState } from "react";
import { BookingService } from "../../../services/booking.service";
import { userService } from "../../../services/users.service";
import proPertiesService from "../../../services/properties.service";
import { roomService } from "../../../services/room.service";

const initialForm = {
  user_id: "",
  property_id: "",
  room_id: "",
  check_in: "",
  check_out: "",
  guests: "",
  rooms_count: "",
  nights: "",
  price_per_night: "",
  total_price: "",
  status: "pending",
};

const statusTone = (status) => {
  if (status === "pending")
    return "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]";
  if (status === "confirmed")
    return "bg-[#eef5ff] text-[#0b2f6a] border-[#c7ddff]";
  if (status === "completed")
    return "bg-[#ecfdf3] text-[#027a48] border-[#abefc6]";
  if (status === "cancelled")
    return "bg-[#fff5f5] text-[#b42318] border-[#ffd0d0]";
  return "bg-[#f6faff] text-[#0b2f6a] border-[#dbe7ff]";
};

const statusLabel = (status) => {
  if (status === "pending") return "Chờ xác nhận";
  if (status === "confirmed") return "Đã xác nhận";
  if (status === "completed") return "Đã hoàn thành";
  if (status === "cancelled") return "Đã hủy";
  return status;
};

const padDatePart = (value) => String(value).padStart(2, "0");

const parseLocalDate = (value) => {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateInputValue = (value) => {
  const date = parseLocalDate(value);
  if (!date) return "";

  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`;
};

const formatDateDisplay = (value) => {
  const date = parseLocalDate(value);
  if (!date) return "";

  return `${padDatePart(date.getDate())}/${padDatePart(
    date.getMonth() + 1,
  )}/${date.getFullYear()}`;
};

const getTodayInputValue = () => formatDateInputValue(new Date());

const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  if (!start || !end) return 1;
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil((end - start) / millisecondsPerDay));
};

const ManageBooking = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [showBookingList, setShowBookingList] = useState(true);
  const [collapsedBookingGroups, setCollapsedBookingGroups] = useState({});
  const todayInputValue = getTodayInputValue();

  const load = async () => {
    setLoading(true);
    try {
      const [bookingRes, userRes, propertyRes, roomRes] = await Promise.all([
        BookingService.getAll(),
        userService.getAll(),
        proPertiesService.getAll(),
        roomService.getAll(),
      ]);

      const allUsers = userRes?.data?.metaData || [];

      setItems(bookingRes?.data?.metaData || []);
      setUsers(allUsers);
      setProperties(propertyRes?.data?.metaData || []);
      setRooms(roomRes?.data?.metaData || []);
    } catch (err) {
      console.log(err);
      setItems([]);
      setUsers([]);
      setProperties([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const total = items.length;
    const pending = items.filter(
      (booking) => booking.status === "pending",
    ).length;
    const confirmed = items.filter(
      (booking) => booking.status === "confirmed",
    ).length;
    return { total, pending, confirmed };
  }, [items]);

  const visibleRooms = useMemo(() => {
    if (!form.property_id) return rooms;
    return rooms.filter((room) => {
      const propertyId =
        typeof room.property_id === "object"
          ? room.property_id?._id
          : room.property_id;
      return propertyId === form.property_id;
    });
  }, [form.property_id, rooms]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room._id === form.room_id) || null,
    [form.room_id, rooms],
  );

  const groupedBookings = useMemo(() => {
    return items.reduce((groups, booking) => {
      const rawProperty = booking.property_id;
      const propertyId =
        typeof rawProperty === "object" ? rawProperty?._id || "unknown" : rawProperty || "unknown";
      const propertyTitle =
        typeof rawProperty === "object"
          ? rawProperty?.title || "Chỗ nghỉ chưa xác định"
          : properties.find((property) => property._id === rawProperty)?.title ||
            "Chỗ nghỉ chưa xác định";

      if (!groups[propertyId]) {
        groups[propertyId] = {
          propertyId,
          propertyTitle,
          bookings: [],
        };
      }

      groups[propertyId].bookings.push(booking);
      return groups;
    }, {});
  }, [items, properties]);

  const toggleBookingGroup = (propertyId) => {
    setCollapsedBookingGroups((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSubmitError("");

    setForm((prev) => {
      if (name === "property_id") {
        return {
          ...prev,
          property_id: value,
          room_id: "",
          guests: "",
          rooms_count: "",
          nights: "",
          price_per_night: "",
          total_price: "",
        };
      }

      if (name === "room_id") {
        const room = rooms.find((item) => item._id === value);
        return {
          ...prev,
          room_id: value,
          guests: prev.guests || (room?.capacity ? String(room.capacity) : ""),
          rooms_count: prev.rooms_count || "1",
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleReset = () => {
    setEditingId("");
    setForm(initialForm);
    setSubmitError("");
  };

  const handleEdit = (booking) => {
    setEditingId(booking._id);
    setForm({
      user_id:
        typeof booking.user_id === "object"
          ? booking.user_id?._id || ""
          : booking.user_id || "",
      property_id:
        typeof booking.property_id === "object"
          ? booking.property_id?._id || ""
          : booking.property_id || "",
      room_id:
        typeof booking.room_id === "object"
          ? booking.room_id?._id || ""
          : booking.room_id || "",
      check_in: formatDateInputValue(booking.check_in),
      check_out: formatDateInputValue(booking.check_out),
      guests: String(booking.guests ?? ""),
      rooms_count: String(booking.rooms_count ?? ""),
      nights: String(booking.nights ?? ""),
      price_per_night: booking.price_per_night || "",
      total_price: booking.total_price || "",
      status: booking.status || "pending",
    });
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn xóa booking này không?")) return;
    try {
      await BookingService.delete(bookingId);
      await load();
      if (editingId === bookingId) {
        handleReset();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const roomsCount = Number(form.rooms_count) || 1;
    const nights = calculateNights(form.check_in, form.check_out);
    const pricePerNight = Number(selectedRoom?.price) || 0;

    setForm((prev) => {
      const nextForm = {
        ...prev,
        nights: String(nights),
        price_per_night: String(pricePerNight),
        total_price: String(pricePerNight * nights * roomsCount),
      };

      if (
        prev.nights === nextForm.nights &&
        prev.price_per_night === nextForm.price_per_night &&
        prev.total_price === nextForm.total_price
      ) {
        return prev;
      }

      return nextForm;
    });
  }, [form.check_in, form.check_out, form.rooms_count, selectedRoom]);

  const handleSubmit = async () => {
    if (!form.user_id || !form.property_id || !form.room_id) {
      setSubmitError("Vui lòng chọn đầy đủ người dùng, chỗ nghỉ và phòng.");
      return;
    }

    if (!form.check_in || !form.check_out) {
      setSubmitError("Vui lòng chọn đầy đủ ngày check-in và check-out.");
      return;
    }

    const checkInDate = parseLocalDate(form.check_in);
    const checkOutDate = parseLocalDate(form.check_out);
    if (!checkInDate || !checkOutDate) {
      setSubmitError("Ngày check-in/check-out không hợp lệ.");
      return;
    }
    if (checkOutDate <= checkInDate) {
      setSubmitError("Ngày check-out phải lớn hơn ngày check-in.");
      return;
    }

    if (form.check_in < todayInputValue) {
      setSubmitError("Không được đặt check-in trong quá khứ.");
      return;
    }

    const roomsCount = Number(form.rooms_count) || 1;
    const roomCapacity = Number(selectedRoom?.capacity) || 1;
    const roomQuantity = Number(selectedRoom?.quantity ?? 0);
    const guests = Number(form.guests);
    const nights = calculateNights(form.check_in, form.check_out);
    const pricePerNight = Number(selectedRoom?.price) || 0;

    if (roomsCount < 1) {
      setSubmitError("Số phòng phải lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(guests) || guests < 1) {
      setSubmitError("Số khách phải lớn hơn 0.");
      return;
    }

    if (roomQuantity > 0 && roomsCount > roomQuantity) {
      setSubmitError(`Số phòng vượt quá khả dụng (${roomQuantity}).`);
      return;
    }

    if (guests > roomCapacity * roomsCount) {
      setSubmitError(
        `Số khách vượt quá sức chứa tối đa (${roomCapacity * roomsCount}).`,
      );
      return;
    }

    const payload = {
      user_id: form.user_id,
      property_id: form.property_id,
      room_id: form.room_id,
      check_in: form.check_in,
      check_out: form.check_out,
      guests,
      rooms_count: roomsCount,
      nights,
      price_per_night: pricePerNight,
      total_price: pricePerNight * nights * roomsCount,
      status: form.status,
    };

    try {
      if (editingId) {
        await BookingService.update(editingId, payload);
      } else {
        await BookingService.create(payload);
      }
      setSubmitError("");
      handleReset();
      await load();
    } catch (err) {
      console.log(err);
      setSubmitError(
        err?.response?.data?.message || "Tạo/Cập nhật booking thất bại.",
      );
    }
  };

  return (
    <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_55px_rgba(0,59,149,0.08)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#0b2f6a]">Đặt phòng</h2>
          <p className="mt-1 text-sm text-[#5b6b86]">
            Quản lý booking đầy đủ cho quản trị viên, gồm tạo, sửa, xóa và cập
            nhật trạng thái.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">Tổng</div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.total}
            </div>
          </div>
          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">
              Chờ xác nhận
            </div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.pending}
            </div>
          </div>
          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">
              Đã xác nhận
            </div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.confirmed}
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            className="h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            Tải lại
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-[#edf3ff] bg-[#f8fbff] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0b2f6a]">
              {editingId ? "Cập nhật booking" : "Tạo booking mới"}
            </h3>
            <p className="mt-1 text-sm text-[#5b6b86]">
              Điền đầy đủ người dùng, chỗ nghỉ, phòng, ngày ở và tổng tiền để
              tạo booking.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-2xl bg-[#006ce4] px-4 text-sm font-semibold text-white hover:bg-[#003b95]"
            >
              {editingId ? "Cập nhật booking" : "Tạo booking"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
            >
              Làm mới
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="">Chọn người dùng</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.full_name} - {user.email} - {user.role}
              </option>
            ))}
          </select>

          <select
            name="property_id"
            value={form.property_id}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="">Chọn chỗ nghỉ</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.title}
              </option>
            ))}
          </select>

          <select
            name="room_id"
            value={form.room_id}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="">Chọn phòng</option>
            {visibleRooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>

          <input
            name="check_in"
            value={form.check_in}
            onChange={handleChange}
            type="date"
            min={todayInputValue}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <input
            name="check_out"
            value={form.check_out}
            onChange={handleChange}
            type="date"
            min={form.check_in || todayInputValue}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <input
            name="guests"
            value={form.guests}
            onChange={handleChange}
            placeholder="Số khách"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <input
            name="rooms_count"
            value={form.rooms_count}
            onChange={handleChange}
            placeholder="Số phòng"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <input
            name="nights"
            value={form.nights}
            readOnly
            placeholder="Số đêm"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-[#eef4ff] px-4 outline-none"
          />

          <input
            name="price_per_night"
            value={form.price_per_night}
            readOnly
            placeholder="Giá mỗi đêm"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-[#eef4ff] px-4 outline-none"
          />
          <input
            name="total_price"
            value={form.total_price}
            readOnly
            placeholder="Tổng tiền"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-[#eef4ff] px-4 outline-none"
          />
        </div>

        {submitError && (
          <div className="mt-4 rounded-xl border border-[#ffd0d0] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#b42318]">
            {submitError}
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#edf3ff]">
        <div className="flex items-center justify-between bg-[#f8fbff] px-4 py-3">
          <span className="text-sm font-semibold text-[#0b2f6a]">
            Danh sách booking
          </span>
          <button
            type="button"
            onClick={() => setShowBookingList((prev) => !prev)}
            className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            {showBookingList ? "Thu gọn danh sách" : "Mở danh sách"}
          </button>
        </div>

        {!showBookingList ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Danh sách booking đang được thu gọn.
          </div>
        ) : (
          <>
            {loading ? (
              <div className="px-4 py-8 text-sm text-[#5b6b86]">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-sm text-[#5b6b86]">
                Không có booking.
              </div>
            ) : (
              <div className="space-y-4 px-4 py-4">
                {Object.values(groupedBookings).map((group) => {
                  const isCollapsed = Boolean(
                    collapsedBookingGroups[group.propertyId],
                  );

                  return (
                    <div
                      key={group.propertyId}
                      className="overflow-hidden rounded-2xl border border-[#dbe7ff] bg-white"
                    >
                      <div className="flex flex-col gap-3 border-b border-[#edf3ff] bg-[#f8fbff] px-4 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm font-bold text-[#0b2f6a]">
                            {group.propertyTitle}
                          </div>
                          <div className="mt-1 text-xs text-[#6a7da5]">
                            {group.bookings.length} booking
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleBookingGroup(group.propertyId)}
                          className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                        >
                          {isCollapsed ? "Mở booking" : "Thu gọn booking"}
                        </button>
                      </div>

                      {isCollapsed ? (
                        <div className="px-4 py-6 text-sm text-[#5b6b86]">
                          Nhóm booking này đang được thu gọn.
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-[1.1fr_0.85fr_0.85fr_0.75fr_0.8fr_1fr] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-semibold tracking-[0.06em] text-[#6a7da5]">
                            <div>Chỗ nghỉ / Phòng</div>
                            <div>Người dùng</div>
                            <div>Thời gian ở</div>
                            <div>Thông tin</div>
                            <div>Trạng thái</div>
                            <div>Thao tác</div>
                          </div>

                          <div className="divide-y divide-[#edf3ff]">
                            {group.bookings.map((booking) => (
                              <div
                                key={booking._id}
                                className="grid grid-cols-[1.1fr_0.85fr_0.85fr_0.75fr_0.8fr_1fr] gap-3 px-4 py-4 text-sm text-[#0b2f6a]"
                              >
                                <div className="min-w-0">
                                  <div className="truncate font-semibold">
                                    {booking.property_id?.title ||
                                      group.propertyTitle}
                                  </div>
                                  <div className="truncate text-xs text-[#6a7da5]">
                                    {booking.room_id?.name || ""}
                                  </div>
                                </div>

                                <div className="min-w-0">
                                  <div className="truncate font-semibold">
                                    {booking.user_id?.full_name || "Người dùng"}
                                  </div>
                                  <div className="truncate text-xs text-[#6a7da5]">
                                    {booking.user_id?.email || ""}
                                  </div>
                                </div>

                                <div className="text-xs leading-6 text-[#5b6b86]">
                                  <div>{formatDateDisplay(booking.check_in)}</div>
                                  <div>{formatDateDisplay(booking.check_out)}</div>
                                  <div>{booking.nights} đêm</div>
                                </div>

                                <div className="text-xs leading-6 text-[#5b6b86]">
                                  <div>{booking.guests} khách</div>
                                  <div>{booking.rooms_count} phòng</div>
                                  <div>
                                    {(booking.total_price || 0).toLocaleString(
                                      "vi-VN",
                                    )}{" "}
                                    VND
                                  </div>
                                </div>

                                <div>
                                  <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(
                                      booking.status,
                                    )}`}
                                  >
                                    {statusLabel(booking.status)}
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(booking)}
                                    className="h-9 rounded-xl bg-[#006ce4] px-3 text-xs font-semibold text-white hover:bg-[#003b95]"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(booking._id)}
                                    className="h-9 rounded-xl border border-[#ffd0d0] bg-[#fff5f5] px-3 text-xs font-semibold text-[#b42318] hover:bg-[#ffecec]"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageBooking;
