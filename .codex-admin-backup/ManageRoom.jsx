import React, { useEffect, useMemo, useState } from "react";
import { roomService } from "../../../services/room.service";
import proPertiesService from "../../../services/properties.service";

const roomBadgeFields = [
  ["balcony", "Ban c�ng"],
  ["air_conditioning", "�i?u h�a"],
  ["private_bathroom", "Ph�ng t?m ri�ng"],
  ["terrace", "S�n hi�n"],
  ["free_wifi", "WiFi mi?n ph�"],
  ["garden_view", "Nh�n ra vu?n"],
  ["courtyard_view", "Hu?ng s�n trong"],
];

const roomAmenityFields = [
  ["toiletries", "�? d�ng v? sinh"],
  ["shower", "V�i sen"],
  ["toilet", "Nh� v? sinh"],
  ["towels", "Khan t?m"],
  ["socket_near_bed", "? di?n g?n giu?ng"],
  ["sitting_area", "Khu v?c ti?p kh�ch"],
  ["private_entrance", "L?i v�o ri�ng"],
  ["slippers", "D�p"],
  ["hair_dryer", "M�y s?y t�c"],
  ["fan", "Qu?t"],
  ["electric_kettle", "?m dun nu?c"],
  ["wardrobe", "T? qu?n �o"],
  ["clothes_rack", "Gi� treo d?"],
  ["toilet_paper", "Gi?y v? sinh"],
];

const roomTypeOptions = [
  { value: "standard_room", label: "Ph�ng ti�u chu?n" },
  { value: "deluxe_room", label: "Ph�ng deluxe" },
  { value: "suite", label: "Ph�ng suite" },
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
          ? rawProperty?.title || "Ch? ngh? chua x�c d?nh"
          : properties.find((property) => property._id === rawProperty)?.title ||
            "Ch? ngh? chua x�c d?nh";

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
    if (!window.confirm("B?n c� ch?c mu?n x�a ph�ng n�y kh�ng?")) return;

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
    <div className="rounded-[22px] border border-[#dbe7ff] bg-white p-4 shadow-[0_18px_55px_rgba(0,59,149,0.08)] sm:rounded-[28px] sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#0b2f6a]">Ph�ng</h2>
          <p className="mt-1 text-sm text-[#5b6b86]">
            Danh s�ch ph�ng trong to�n h? th?ng.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">T?ng</div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.total}
            </div>
          </div>

          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">
              H?t ph�ng
            </div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.outOfStock}
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            className="col-span-2 h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff] sm:col-span-1"
          >
            T?i l?i
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#edf3ff] bg-[#f8fbff] p-4 sm:mt-6 sm:rounded-[24px] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0b2f6a]">
              {editingId ? "C?p nh?t ph�ng" : "T?o ph�ng m?i"}
            </h3>
            <p className="mt-1 text-sm text-[#5b6b86]">
              Nh?p gi� g?c v� ph?n tram gi?m, gi� hi?n t?i s? t? t�nh.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-2xl bg-[#006ce4] px-4 text-sm font-semibold text-white hover:bg-[#003b95]"
            >
              {editingId ? "C?p nh?t ph�ng" : "T?o ph�ng"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
            >
              L�m m?i
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
            <option value="">Ch?n ch? ngh?</option>
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
            placeholder="T�n ph�ng"
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
            placeholder="Gi� g?c"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="discount_percent"
            value={form.discount_percent}
            onChange={handleChange}
            placeholder="Ph?n tram gi?m gi�"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="price"
            value={form.price}
            readOnly
            placeholder="Gi� hi?n t?i t? t�nh"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-[#eef4ff] px-4 outline-none"
          />

          <input
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            placeholder="S?c ch?a"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="S? lu?ng ph�ng"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="bed_info"
            value={form.bed_info}
            onChange={handleChange}
            placeholder="Th�ng tin giu?ng"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="area"
            value={form.area}
            onChange={handleChange}
            placeholder="Di?n t�ch"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="view"
            value={form.view}
            onChange={handleChange}
            placeholder="Hu?ng nh�n"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-[#0b2f6a]">
            �i?m n?i b?t
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
            Ti?n nghi
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
        <div className="flex flex-col gap-3 bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-[#0b2f6a]">
            Danh s�ch ph�ng
          </span>
          <button
            type="button"
            onClick={() => setShowRoomList((prev) => !prev)}
            className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            {showRoomList ? "Thu g?n danh s�ch" : "M? danh s�ch"}
          </button>
        </div>

        {!showRoomList ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Danh s�ch ph�ng dang du?c thu g?n.
          </div>
        ) : loading ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">�ang t?i...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Kh�ng c� ph�ng.
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
                        {group.rooms.length} ph�ng
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRoomGroup(group.propertyId)}
                      className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                    >
                      {isCollapsed ? "M? ph�ng" : "Thu g?n ph�ng"}
                    </button>
                  </div>

                  {isCollapsed ? (
                    <div className="px-4 py-6 text-sm text-[#5b6b86]">
                      Nh�m ph�ng n�y dang du?c thu g?n.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 p-3 lg:hidden">
                        {group.rooms.map((r) => (
                          <div
                            key={r._id}
                            className="rounded-2xl border border-[#dbe7ff] bg-white p-4 text-sm text-[#0b2f6a]"
                          >
                            <div className="font-semibold">{r.name || "-"}</div>
                            <div className="mt-1 text-xs text-[#6a7da5]">
                              {typeof r.property_id === "object"
                                ? r.property_id?.title || group.propertyTitle
                                : group.propertyTitle}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#5b6b86]">
                              <div>
                                <span className="block font-semibold text-[#6a7da5]">
                                  Lo?i ph�ng
                                </span>
                                <span className="mt-1 block text-[#0b2f6a]">
                                  {roomTypeOptions.find(
                                    (item) => item.value === r.room_type,
                                  )?.label ||
                                    r.room_type ||
                                    "-"}
                                </span>
                              </div>
                              <div>
                                <span className="block font-semibold text-[#6a7da5]">
                                  S? lu?ng
                                </span>
                                <span className="mt-1 block text-[#0b2f6a]">
                                  {r.quantity ?? 0}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 text-sm font-semibold">
                              {(r.price || 0).toLocaleString("vi-VN")} VND
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(r)}
                                className="h-10 rounded-xl bg-[#006ce4] px-3 text-xs font-semibold text-white hover:bg-[#003b95]"
                              >
                                S?a
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(r._id)}
                                className="h-10 rounded-xl border border-[#ffd0d0] bg-[#fff5f5] px-3 text-xs font-semibold text-[#b42318] hover:bg-[#ffecec]"
                              >
                                X�a
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="hidden overflow-x-auto lg:block">
                        <div className="min-w-[820px]">
                      <div className="grid grid-cols-[1.2fr_0.9fr_0.6fr_0.6fr_0.7fr] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-semibold tracking-[0.06em] text-[#6a7da5]">
                        <div>T�n ph�ng</div>
                        <div>Lo?i ph�ng</div>
                        <div>Gi�</div>
                        <div>S? lu?ng</div>
                        <div>Thao t�c</div>
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
                                S?a
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(r._id)}
                                className="h-9 rounded-xl border border-[#ffd0d0] bg-[#fff5f5] px-3 text-xs font-semibold text-[#b42318] hover:bg-[#ffecec]"
                              >
                                X�a
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                        </div>
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
