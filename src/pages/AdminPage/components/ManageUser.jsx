import React, { useEffect, useMemo, useState } from "react";
import { userService } from "../../../services/users.service";

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  role: "user",
  phone_number: "",
  gender: "",
  home_address: "",
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const ManageUser = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setItems(res?.data?.metaData || []);
    } catch (err) {
      console.log(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const total = items.length;
    const admins = items.filter((u) => u.role === "admin").length;
    return { total, admins };
  }, [items]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa tài khoản này?")) return;
    try {
      await userService.delete(id);
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
      phone_number: user.phone_number || "",
      gender: user.gender || "",
      home_address: user.home_address || "",
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatar?.url || "");
  };

  const handleReset = () => {
    setEditingId("");
    setForm(initialForm);
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleSubmit = async () => {
    try {
      let targetUserId = editingId;

      if (editingId) {
        const payload = {
          full_name: form.full_name,
          role: form.role,
          phone_number: form.phone_number,
          gender: form.gender,
          home_address: form.home_address,
        };

        if (form.password?.trim()) {
          payload.password = form.password;
        }

        await userService.update(editingId, payload);

        if (avatarFile) {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          await userService.uploadCloudById(editingId, formData);
        }
      } else {
        const payload = {
          ...form,
        };

        const createRes = await userService.create(payload);
        const createdUserId = createRes?.data?.metaData?._id;
        targetUserId = createdUserId;

        if (avatarFile && createdUserId) {
          const formData = new FormData();
          formData.append("avatar", avatarFile);
          await userService.uploadCloudById(createdUserId, formData);
        }
      }

      if (targetUserId) {
        const refreshedUserRes = await userService.getById(targetUserId);
        const refreshedUser = refreshedUserRes?.data?.metaData || null;
        const currentUser = getStoredUser();

        if (refreshedUser && currentUser?._id === targetUserId) {
          localStorage.setItem("user", JSON.stringify(refreshedUser));
          window.dispatchEvent(new Event("user-updated"));
        }
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
          <h2 className="text-[22px] font-bold text-[#0b2f6a]">
            Quản lý tài khoản
          </h2>
          <p className="mt-1 text-sm text-[#5b6b86]">
            Danh sách tài khoản người dùng và quản trị viên.
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
            <div className="text-xs font-semibold text-[#6a7da5]">Admin</div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {totals.admins}
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
              {editingId ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
            </h3>
            <p className="mt-1 text-sm text-[#5b6b86]">
              Admin có thể tạo tài khoản mới và cập nhật quyền/thông tin nhanh.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-2xl bg-[#006ce4] px-4 text-sm font-semibold text-white hover:bg-[#003b95]"
            >
              {editingId ? "Cập nhật tài khoản" : "Tạo tài khoản"}
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
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={Boolean(editingId)}
            placeholder="Email"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none disabled:bg-[#f2f6fc] focus:border-[#006ce4]"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder={
              editingId ? "Mật khẩu giữ nguyên nếu để trống" : "Mật khẩu"
            }
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="Số điện thoại"
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="">Giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[140px_1fr]">
          <div className="rounded-2xl border border-[#dbe7ff] bg-white p-3">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="h-[110px] w-full rounded-xl "
              />
            ) : (
              <div className="flex h-[110px] items-center justify-center rounded-xl bg-[#f8fbff] text-sm text-[#6a7da5]">
                Chưa có ảnh
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#dbe7ff] bg-white p-4">
            <div className="text-sm font-semibold text-[#0b2f6a]">
              Ảnh đại diện
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-3 block w-full text-sm text-[#0b2f6a]"
            />
            <p className="mt-2 text-xs text-[#6a7da5]">
              Chọn ảnh trước khi tạo hoặc cập nhật tài khoản.
            </p>
          </div>
        </div>

        <textarea
          name="home_address"
          value={form.home_address}
          onChange={handleChange}
          placeholder="Địa chỉ nhà"
          className="mt-4 min-h-[110px] w-full rounded-2xl border border-[#dbe7ff] bg-white px-4 py-3 outline-none focus:border-[#006ce4]"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#edf3ff]">
        <div className="grid grid-cols-[1.1fr_1.2fr_0.6fr_0.7fr] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-semibold tracking-[0.06em] text-[#6a7da5]">
          <div>Họ tên</div>
          <div>Email</div>
          <div>Vai trò</div>
          <div>Hành động</div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Đang tải dữ liệu...
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Không có tài khoản nào.
          </div>
        ) : (
          <div className="divide-y divide-[#edf3ff]">
            {items.map((u) => (
              <div
                key={u._id}
                className="grid grid-cols-[1.1fr_1.2fr_0.6fr_0.7fr] gap-3 px-4 py-4 text-sm text-[#0b2f6a]"
              >
                <div className="truncate font-semibold">
                  {u.full_name || "-"}
                </div>
                <div className="truncate text-[#5b6b86]">{u.email || "-"}</div>
                <div>
                  <span className="inline-flex rounded-full border border-[#dbe7ff] bg-[#f6faff] px-3 py-1 text-xs font-semibold text-[#0b2f6a]">
                    {u.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleEdit(u)}
                    className="mr-2 h-9 rounded-xl bg-[#006ce4] px-3 text-xs font-semibold text-white hover:bg-[#003b95]"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(u._id)}
                    className="h-9 rounded-xl border border-[#ffd0d0] bg-[#fff5f5] px-3 text-xs font-semibold text-[#b42318] hover:bg-[#ffecec]"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUser;
