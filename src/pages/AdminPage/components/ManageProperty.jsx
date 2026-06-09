import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import proPertiesService from "../../../services/properties.service";
import { userService } from "../../../services/users.service";

const propertyAmenityFields = [
  ["outdoor_pool", "Hồ bơi ngoài trời"],
  ["free_wifi", "WiFi miễn phí"],
  ["airport_shuttle", "Xe đưa đón sân bay"],
  ["non_smoking_room", "Phòng không hút thuốc"],
  ["room_service", "Dịch vụ phòng"],
  ["restaurant", "Nhà hàng"],
  ["free_parking", "Chỗ đậu xe miễn phí"],
  ["family_room", "Phòng gia đình"],
  ["bar", "Quầy bar"],
  ["breakfast", "Bữa sáng"],
];

const createInitialForm = () => ({
  title: "",
  slug: "",
  address: "",
  city: "da-lat",
  location_lat: "",
  location_lng: "",

  type: "hotel",
  description: "",
  main_image_url: "",
  main_image_public_id: "",
  gallery_urls: "",
  is_preferred: false,
  max_stay_days: 30,
  user_id: "",
  amenities: Object.fromEntries(
    propertyAmenityFields.map(([key]) => [key, false]),
  ),
});

const buildFormFromProperty = (property) => ({
  title: property.title || "",
  slug: property.slug || "",
  address: property.address || "",
  city: property.city || "da-lat",
  location_lat: property.location?.lat ?? "",
  location_lng: property.location?.lng ?? "",

  type: property.type || "hotel",

  description: property.description || "",
  main_image_url: property.main_image_url || "",
  main_image_public_id: property.main_image_public_id || "",
  gallery_urls: (property.gallery_images || [])
    .map((item) => item.url)
    .filter(Boolean)
    .join("\n"),
  is_preferred: Boolean(property.is_preferred),
  max_stay_days: String(property.max_stay_days ?? 30),
  user_id:
    typeof property.user_id === "object"
      ? property.user_id?._id || ""
      : property.user_id || "",
  amenities: {
    ...Object.fromEntries(propertyAmenityFields.map(([key]) => [key, false])),
    ...(property.amenities || {}),
  },
});

const ManageProperty = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(createInitialForm());
  const [editingId, setEditingId] = useState("");
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [propertyImageInputKey, setPropertyImageInputKey] = useState(0);
  const [showPropertyList, setShowPropertyList] = useState(true);
  const [collapsedOwnerGroups, setCollapsedOwnerGroups] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [propertyRes, userRes] = await Promise.all([
        proPertiesService.getAll(),
        userService.getAll(),
      ]);
      const loadedUsers = userRes?.data?.metaData || [];
      setItems(propertyRes?.data?.metaData || []);
      setUsers(loadedUsers);
      setForm((prev) =>
        prev.user_id
          ? prev
          : {
              ...prev,
              user_id: loadedUsers[0]?._id || "",
            },
      );
    } catch (err) {
      console.log(err);
      setItems([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const total = items.length;
    const preferred = items.filter((p) => p.is_preferred).length;
    return { total, preferred };
  }, [items]);

  const groupedProperties = useMemo(() => {
    return items.reduce((groups, property) => {
      const rawUser = property.user_id;
      const ownerId =
        typeof rawUser === "object"
          ? rawUser?._id || "unknown"
          : rawUser || "unknown";
      const matchedUser =
        typeof rawUser === "object"
          ? rawUser
          : users.find((user) => user._id === rawUser) || null;
      const ownerName =
        matchedUser?.full_name || matchedUser?.email || "Chưa gắn chủ sở hữu";
      const ownerEmail = matchedUser?.email || "";

      if (!groups[ownerId]) {
        groups[ownerId] = {
          ownerId,
          ownerName,
          ownerEmail,
          properties: [],
        };
      }

      groups[ownerId].properties.push(property);
      return groups;
    }, {});
  }, [items, users]);

  const toggleOwnerGroup = (ownerId) => {
    setCollapsedOwnerGroups((prev) => ({
      ...prev,
      [ownerId]: !prev[ownerId],
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa chỗ nghỉ này?")) return;
    try {
      await proPertiesService.delete(id);
      if (editingId === id) handleReset();
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  const handleEdit = (property) => {
    setEditingId(property._id);
    setForm(buildFormFromProperty(property));
    setMainImageFile(null);
    setGalleryImageFiles([]);
    setPropertyImageInputKey((prev) => prev + 1);
  };

  const handleReset = () => {
    setEditingId("");
    setForm({
      ...createInitialForm(),
      user_id: users[0]?._id || "",
    });
    setMainImageFile(null);
    setGalleryImageFiles([]);
    setPropertyImageInputKey((prev) => prev + 1);
  };

  const uploadPropertyImages = async (propertyId) => {
    if (!propertyId) return;

    if (mainImageFile) {
      await proPertiesService.uploadMainImageCloud(propertyId, mainImageFile);
    }

    if (galleryImageFiles.length > 0) {
      await proPertiesService.uploadGalleryCloud(propertyId, galleryImageFiles);
    }
  };

  const handleSubmit = async () => {
    if (!form.user_id) {
      alert("Vui lòng chọn chủ sở hữu cho chỗ nghỉ");
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      address: form.address.trim(),
      city: form.city,
      location: {
        lat: form.location_lat === "" ? null : Number(form.location_lat),
        lng: form.location_lng === "" ? null : Number(form.location_lng),
      },

      type: "hotel",

      description: form.description.trim(),
      amenities: form.amenities,
      main_image_url: form.main_image_url.trim(),
      main_image_public_id: form.main_image_public_id.trim(),
      gallery_images: form.gallery_urls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => ({ url, public_id: "" })),
      is_preferred: Boolean(form.is_preferred),
      max_stay_days: Number(form.max_stay_days) || 30,
      user_id: form.user_id,
    };

    try {
      let savedPropertyId = editingId;

      if (editingId) {
        await proPertiesService.update(editingId, payload);
      } else {
        const createRes = await proPertiesService.create(payload);
        savedPropertyId = createRes?.data?.metaData?._id || "";
      }

      if (savedPropertyId) {
        await uploadPropertyImages(savedPropertyId);
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
          <h2 className="text-[22px] font-bold text-[#0b2f6a]">
            Quản lý chỗ nghỉ
          </h2>
          <p className="mt-1 text-sm text-[#5b6b86]">
            Danh sách khách sạn / chỗ nghỉ (admin).
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">Tổng</div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.total}
            </div>
          </div>
          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">Nổi bật</div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.preferred}
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            className="col-span-2 h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff] sm:col-span-1"
          >
            Tải lại
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#edf3ff] bg-[#f8fbff] p-4 sm:mt-6 sm:rounded-[24px] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0b2f6a]">
              {editingId ? "Cập nhật chỗ nghỉ" : "Tạo chỗ nghỉ mới"}
            </h3>
            <p className="mt-1 text-sm text-[#5b6b86]">
              Admin có thể tạo chỗ nghỉ, gắn chủ sở hữu và chỉnh sửa thông tin
              chi tiết.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-2xl bg-[#006ce4] px-4 text-sm font-semibold text-white hover:bg-[#003b95]"
            >
              {editingId ? "Cập nhật chỗ nghỉ" : "Tạo chỗ nghỉ"}
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

        {users.length === 0 && (
          <div className="mt-4 rounded-2xl border border-[#ffe1b5] bg-[#fff9ef] px-4 py-3 text-sm text-[#8a5a00]">
            Chưa tải được danh sách user. Không thể gắn chủ sở hữu cho chỗ nghỉ.
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Tên chỗ nghỉ"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Địa chỉ"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="da-lat">da-lat</option>
            <option value="da-nang">da-nang</option>
            <option value="ha-noi">ha-noi</option>
            <option value="ho-chi-minh">ho-chi-minh</option>
            <option value="vung-tau">vung-tau</option>
          </select>
          <input
            name="location_lat"
            type="number"
            step="any"
            value={form.location_lat}
            onChange={handleChange}
            placeholder="Vĩ độ"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <input
            name="location_lng"
            type="number"
            step="any"
            value={form.location_lng}
            onChange={handleChange}
            placeholder="Kinh độ"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />

          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            required
            className="order-first h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4] md:col-span-2 xl:col-span-4"
          >
            <option value="">Chọn chủ chỗ nghỉ</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.full_name} - {user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px] md:items-center">
          <label className="flex items-center gap-3 rounded-2xl border border-[#dbe7ff] bg-white px-4 py-3 text-sm font-semibold text-[#0b2f6a]">
            <input
              id="is_preferred"
              name="is_preferred"
              type="checkbox"
              checked={form.is_preferred}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span>Chỗ nghỉ nổi bật</span>
          </label>

          <input
            name="max_stay_days"
            value={form.max_stay_days}
            onChange={handleChange}
            placeholder="Số đêm tối đa"
            className="h-12 w-full rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-[#0b2f6a]">
            Tiện nghi
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {propertyAmenityFields.map(([key, label]) => (
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

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Mô tả"
          className="mt-4 min-h-[110px] w-full rounded-2xl border border-[#dbe7ff] bg-white px-4 py-3 outline-none focus:border-[#006ce4]"
        />

        <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-white p-4">
          <div className="text-sm font-semibold text-[#0b2f6a]">
            Ảnh chính (chọn từ máy)
          </div>
          <input
            key={`admin-main-image-${propertyImageInputKey}`}
            type="file"
            accept="image/*"
            onChange={(event) =>
              setMainImageFile(event.target.files?.[0] || null)
            }
            className="mt-3 block w-full rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-3 py-2 text-sm text-[#0b2f6a] file:mr-3 file:rounded-lg file:border-0 file:bg-[#006ce4] file:px-3 file:py-2 file:text-white"
          />
          <div className="mt-2 text-xs text-[#6a7da5]">
            {mainImageFile
              ? `Đã chọn: ${mainImageFile.name}`
              : form.main_image_url
                ? "Chưa chọn file mới. Giữ ảnh chính hiện tại."
                : "Chưa có ảnh chính."}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#dbe7ff] bg-white p-4">
          <div className="text-sm font-semibold text-[#0b2f6a]">
            Danh sách ảnh (chọn nhiều ảnh)
          </div>
          <input
            key={`admin-gallery-image-${propertyImageInputKey}`}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) =>
              setGalleryImageFiles(Array.from(event.target.files || []))
            }
            className="mt-3 block w-full rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-3 py-2 text-sm text-[#0b2f6a] file:mr-3 file:rounded-lg file:border-0 file:bg-[#006ce4] file:px-3 file:py-2 file:text-white"
          />
          <div className="mt-2 text-xs text-[#6a7da5]">
            {galleryImageFiles.length > 0
              ? `Đã chọn ${galleryImageFiles.length} ảnh mới`
              : `Chưa chọn ảnh mới. Gallery hiện tại: ${
                  (form.gallery_urls || "").split("\n").filter(Boolean).length
                } ảnh`}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#edf3ff]">
        <div className="flex flex-col gap-3 bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-[#0b2f6a]">
            Danh sách chỗ nghỉ
          </span>
          <button
            type="button"
            onClick={() => setShowPropertyList((prev) => !prev)}
            className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            {showPropertyList ? "Thu gọn danh sách" : "Mở danh sách"}
          </button>
        </div>

        {!showPropertyList ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Danh sách chỗ nghỉ đang được thu gọn.
          </div>
        ) : loading ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Đang tải dữ liệu...
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Không có chỗ nghỉ.
          </div>
        ) : (
          <div className="space-y-4 px-4 py-4">
            {Object.values(groupedProperties).map((group) => {
              const isCollapsed = Boolean(collapsedOwnerGroups[group.ownerId]);

              return (
                <div
                  key={group.ownerId}
                  className="overflow-hidden rounded-2xl border border-[#dbe7ff] bg-white"
                >
                  <div className="flex flex-col gap-3 border-b border-[#edf3ff] bg-[#f8fbff] px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#0b2f6a]">
                        {group.ownerName}
                      </div>
                      <div className="mt-1 text-xs text-[#6a7da5]">
                        {group.ownerEmail || "Chưa có email"} •{" "}
                        {group.properties.length} chỗ nghỉ
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleOwnerGroup(group.ownerId)}
                      className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                    >
                      {isCollapsed ? "Mở chỗ nghỉ" : "Thu gọn chỗ nghỉ"}
                    </button>
                  </div>

                  {isCollapsed ? (
                    <div className="px-4 py-6 text-sm text-[#5b6b86]">
                      Nhóm chỗ nghỉ này đang được thu gọn.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 p-3 lg:hidden">
                        {group.properties.map((p) => (
                          <div
                            key={p._id}
                            className="rounded-2xl border border-[#dbe7ff] bg-white p-4 text-sm text-[#0b2f6a]"
                          >
                            <div className="font-semibold">
                              {p.title || "-"}
                            </div>
                            <div className="mt-1 break-words text-xs text-[#6a7da5]">
                              {p.address || ""}
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-3 text-xs">
                              <div>
                                <span className="block font-semibold text-[#6a7da5]">
                                  Thành phố
                                </span>
                                <span className="mt-1 block">
                                  {p.city || "-"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <span className="inline-flex rounded-full border border-[#dbe7ff] bg-[#f6faff] px-3 py-1 text-xs font-semibold">
                                Nổi bật: {p.is_preferred ? "Có" : "Không"}
                              </span>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(p)}
                                className="h-10 rounded-xl bg-[#006ce4] px-3 text-xs font-semibold text-white hover:bg-[#003b95]"
                              >
                                Sửa
                              </button>
                              <Link
                                to={`/properties/${p.city}/${p.slug}`}
                                className="flex h-10 items-center justify-center rounded-xl border border-[#dbe7ff] bg-white px-3 text-xs font-semibold hover:bg-[#f6faff]"
                              >
                                Mở
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(p._id)}
                                className="h-10 rounded-xl border border-[#ffd0d0] bg-[#fff5f5] px-3 text-xs font-semibold text-[#b42318] hover:bg-[#ffecec]"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="hidden overflow-x-auto lg:block">
                        <div className="min-w-[820px]">
                          <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-semibold tracking-[0.06em] text-[#6a7da5]">
                            <div>Tên chỗ nghỉ</div>
                            <div>Thành phố</div>
                            <div>Giá</div>
                            <div>Nổi bật</div>
                            <div>Hành động</div>
                          </div>

                          <div className="divide-y divide-[#edf3ff]">
                            {group.properties.map((p) => (
                              <div
                                key={p._id}
                                className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-3 px-4 py-4 text-sm text-[#0b2f6a]"
                              >
                                <div className="min-w-0">
                                  <div className="truncate font-semibold">
                                    {p.title || "-"}
                                  </div>
                                  <div className="truncate text-xs text-[#6a7da5]">
                                    {p.address || ""}
                                  </div>
                                </div>

                                <div className="truncate text-[#5b6b86]">
                                  {p.city || "-"}
                                </div>

                                <div className="font-semibold">
                                  {(p.base_price || 0).toLocaleString("vi-VN")}{" "}
                                  VND
                                </div>

                                <div>
                                  <span className="inline-flex rounded-full border border-[#dbe7ff] bg-[#f6faff] px-3 py-1 text-xs font-semibold text-[#0b2f6a]">
                                    {p.is_preferred ? "Có" : "Không"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(p)}
                                    className="h-9 rounded-xl bg-[#006ce4] px-3 text-xs font-semibold text-white hover:bg-[#003b95]"
                                  >
                                    Sửa
                                  </button>

                                  <Link
                                    to={`/properties/${p.city}/${p.slug}`}
                                    className="flex h-9 items-center rounded-xl border border-[#dbe7ff] bg-white px-3 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                                  >
                                    Mở
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(p._id)}
                                    className="h-9 rounded-xl border border-[#ffd0d0] bg-[#fff5f5] px-3 text-xs font-semibold text-[#b42318] hover:bg-[#ffecec]"
                                  >
                                    Xóa
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

export default ManageProperty;
