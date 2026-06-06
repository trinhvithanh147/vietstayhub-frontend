import React, { useEffect, useMemo, useState } from "react";
import { roomService } from "../../../services/room.service";
import proPertiesService from "../../../services/properties.service";

const roomBadgeFields = [
  ["balcony", "Ban công"],
  ["air_conditioning", "Điều hòa"],
  ["private_bathroom", "Phòng tắm riêng"],
  ["terrace", "Sân hiên"],
  ["free_wifi", "WiFi miễn phí"],
  ["garden_view", "Nhìn ra vườn"],
  ["courtyard_view", "Hướng sân trong"],
];

const roomAmenityFields = [
  ["toiletries", "Đồ dùng vệ sinh"],
  ["shower", "Vòi sen"],
  ["toilet", "Nhà vệ sinh"],
  ["towels", "Khăn tắm"],
  ["socket_near_bed", "Ổ điện gần giường"],
  ["sitting_area", "Khu vực tiếp khách"],
  ["private_entrance", "Lối vào riêng"],
  ["slippers", "Dép"],
  ["hair_dryer", "Máy sấy tóc"],
  ["fan", "Quạt"],
  ["electric_kettle", "Ấm đun nước"],
  ["wardrobe", "Tủ quần áo"],
  ["clothes_rack", "Giá treo đồ"],
  ["toilet_paper", "Giấy vệ sinh"],
];

const roomTypeOptions = [
  { value: "standard_room", label: "Phòng tiêu chuẩn" },
  { value: "deluxe_room", label: "Phòng deluxe" },
  { value: "suite", label: "Phòng suite" },
];

const createInitialForm = () => ({
  property_id: "",
  name: "",
  room_type: "standard_room",
  description: "",
  price: "",
  original_price: "",
  discount_percent: "",
  capacity: "",
  quantity: "",
  bed_info: "",
  area: "",
  view: "",
  badges: Object.fromEntries(roomBadgeFields.map(([key]) => [key, false])),
  amenities: Object.fromEntries(roomAmenityFields.map(([key]) => [key, false])),
});

const buildFormFromRoom = (room) => ({
  property_id:
    typeof room.property_id === "object"
      ? room.property_id?._id || ""
      : room.property_id || "",
  name: room.name || "",
  room_type: room.room_type || "standard_room",
  description: room.description || "",
  price: String(room.price ?? ""),
  original_price: String(room.original_price ?? ""),
  discount_percent: String(room.discount_percent ?? ""),
  capacity: String(room.capacity ?? ""),
  quantity: String(room.quantity ?? ""),
  bed_info: room.bed_info || "",
  area: String(room.area ?? ""),
  view: room.view || "",
  badges: {
    ...Object.fromEntries(roomBadgeFields.map(([key]) => [key, false])),
    ...(room.badges || {}),
  },
  amenities: {
    ...Object.fromEntries(roomAmenityFields.map(([key]) => [key, false])),
    ...(room.amenities || {}),
  },
});

const ManageRoom = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(createInitialForm());
  const [editingId, setEditingId] = useState("");
  const [showRoomList, setShowRoomList] = useState(true);
  const [collapsedRoomGroups, setCollapsedRoomGroups] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [roomRes, propertyRes] = await Promise.all([
        roomService.getAll(),
        proPertiesService.getAll(),
      ]);
      setItems(roomRes?.data?.metaData || []);
      setProperties(propertyRes?.data?.metaData || []);
    } catch (err) {
      console.log(err);
      setItems([]);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const total = items.length;
    const outOfStock = items.filter((r) => (r.quantity || 0) <= 0).length;
    return { total, outOfStock };
  }, [items]);

  const groupedRooms = useMemo(() => {
    return items.reduce((groups, room) => {
      const rawProperty = room.property_id;
      const propertyId =
        typeof rawProperty === "object"
          ? rawProperty?._id || "unknown"
          : rawProperty || "unknown";

      const propertyTitle =
        typeof rawProperty === "object"
          ? rawProperty?.title || "Chỗ nghỉ chưa xác định"
          : properties.find((property) => property._id === rawProperty)?.title ||
            "Chỗ nghỉ chưa xác định";

      if (!groups[propertyId]) {
        groups[propertyId] = {
          propertyId,
          propertyTitle,
          rooms: [],
        };
      }

      groups[propertyId].rooms.push(room);
      return groups;
    }, {});
  }, [items, properties]);

  const toggleRoomGroup = (propertyId) => {
    setCollapsedRoomGroups((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này không?")) return;

    try {
      await roomService.delete(id);
      if (editingId === id) {
        handleReset();
      }
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      const nextForm = { ...prev, [name]: value };

      const originalPrice = Number(nextForm.original_price) || 0;
      const discountPercent = Number(nextForm.discount_percent) || 0;

      if (name === "original_price" || name === "discount_percent") {
        nextForm.price =
          originalPrice > 0
            ? String(Math.round(originalPrice * (1 - discountPercent / 100)))
            : "";
      }

      return nextForm;
    });
  };

  const handleBadgeToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      badges: {
        ...prev.badges,
        [key]: !prev.badges[key],
      },
    }));
  };

  const handleAmenityToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm(buildFormFromRoom(room));
  };

  const handleReset = () => {
    setEditingId("");
    setForm(createInitialForm());
  };

  const handleSubmit = async () => {
    const payload = {
      property_id: form.property_id,
      name: form.name.trim(),
      room_type: form.room_type,
      description: form.description.trim(),
      original_price: Number(form.original_price) || 0,
      discount_percent: Number(form.discount_percent) || 0,
      capacity: Number(form.capacity) || 1,
      quantity: Number(form.quantity) || 1,
      bed_info: form.bed_info.trim(),
      area: Number(form.area) || 0,
      view: form.view.trim(),
      badges: form.badges,
      amenities: form.amenities,
    };

    try {
      if (editingId) {
        await roomService.update(editingId, payload);
      } else {
        await roomService.create(payload);
      }
      handleReset();
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_55px_rgba(0,59,149,0.08)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#0b2f6a]">Phòng</h2>
          <p className="mt-1 text-sm text-[#5b6b86]">
            Danh sách phòng trong toàn hệ thống.
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
              Hết phòng
            </div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.outOfStock}
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
              {editingId ? "Cập nhật phòng" : "Tạo phòng mới"}
            </h3>
            <p className="mt-1 text-sm text-[#5b6b86]">
              Nhập giá gốc và phần trăm giảm, giá hiện tại sẽ tự tính.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-2xl bg-[#006ce4] px-4 text-sm font-semibold text-white hover:bg-[#003b95]"
            >
              {editingId ? "Cập nhật phòng" : "Tạo phòng"}
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

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tên phòng"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <select
            name="room_type"
            value={form.room_type}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            {roomTypeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            name="original_price"
            value={form.original_price}
            onChange={handleChange}
            placeholder="Giá gốc"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="discount_percent"
            value={form.discount_percent}
            onChange={handleChange}
            placeholder="Phần trăm giảm giá"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="price"
            value={form.price}
            readOnly
            placeholder="Giá hiện tại tự tính"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-[#eef4ff] px-4 outline-none"
          />

          <input
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            placeholder="Sức chứa"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Số lượng phòng"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="bed_info"
            value={form.bed_info}
            onChange={handleChange}
            placeholder="Thông tin giường"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="area"
            value={form.area}
            onChange={handleChange}
            placeholder="Diện tích"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="view"
            value={form.view}
            onChange={handleChange}
            placeholder="Hướng nhìn"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-[#0b2f6a]">
            Điểm nổi bật
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            {roomBadgeFields.map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3 text-sm text-[#0b2f6a]"
              >
                <input
                  type="checkbox"
                  checked={Boolean(form.badges?.[key])}
                  onChange={() => handleBadgeToggle(key)}
                  className="h-4 w-4"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-[#0b2f6a]">
            Tiện nghi
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
            {roomAmenityFields.map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3 text-sm text-[#0b2f6a]"
              >
                <input
                  type="checkbox"
                  checked={Boolean(form.amenities?.[key])}
                  onChange={() => handleAmenityToggle(key)}
                  className="h-4 w-4"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#edf3ff]">
        <div className="flex items-center justify-between bg-[#f8fbff] px-4 py-3">
          <span className="text-sm font-semibold text-[#0b2f6a]">
            Danh sách phòng
          </span>
          <button
            type="button"
            onClick={() => setShowRoomList((prev) => !prev)}
            className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            {showRoomList ? "Thu gọn danh sách" : "Mở danh sách"}
          </button>
        </div>

        {!showRoomList ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Danh sách phòng đang được thu gọn.
          </div>
        ) : loading ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Không có phòng.
          </div>
        ) : (
          <div className="space-y-4 px-4 py-4">
            {Object.values(groupedRooms).map((group) => {
              const isCollapsed = Boolean(collapsedRoomGroups[group.propertyId]);

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
                        {group.rooms.length} phòng
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRoomGroup(group.propertyId)}
                      className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                    >
                      {isCollapsed ? "Mở phòng" : "Thu gọn phòng"}
                    </button>
                  </div>

                  {isCollapsed ? (
                    <div className="px-4 py-6 text-sm text-[#5b6b86]">
                      Nhóm phòng này đang được thu gọn.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-[1.2fr_0.9fr_0.6fr_0.6fr_0.7fr] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-semibold tracking-[0.06em] text-[#6a7da5]">
                        <div>Tên phòng</div>
                        <div>Loại phòng</div>
                        <div>Giá</div>
                        <div>Số lượng</div>
                        <div>Thao tác</div>
                      </div>

                      <div className="divide-y divide-[#edf3ff]">
                        {group.rooms.map((r) => (
                          <div
                            key={r._id}
                            className="grid grid-cols-[1.2fr_0.9fr_0.6fr_0.6fr_0.7fr] gap-3 px-4 py-4 text-sm text-[#0b2f6a]"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-semibold">
                                {r.name || "-"}
                              </div>
                              <div className="truncate text-xs text-[#6a7da5]">
                                {typeof r.property_id === "object"
                                  ? r.property_id?.title || group.propertyTitle
                                  : group.propertyTitle}
                              </div>
                            </div>

                            <div className="truncate text-[#5b6b86]">
                              {roomTypeOptions.find(
                                (item) => item.value === r.room_type
                              )?.label ||
                                r.room_type ||
                                "-"}
                            </div>

                            <div className="font-semibold">
                              {(r.price || 0).toLocaleString("vi-VN")} VND
                            </div>

                            <div className="font-semibold">
                              {r.quantity ?? 0}
                            </div>

                            <div>
                              <button
                                type="button"
                                onClick={() => handleEdit(r)}
                                className="mr-2 h-9 rounded-xl bg-[#006ce4] px-3 text-xs font-semibold text-white hover:bg-[#003b95]"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(r._id)}
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
      </div>
    </div>
  );
};

export default ManageRoom;
