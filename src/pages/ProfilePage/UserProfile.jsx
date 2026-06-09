import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../assets/Icon/Icon";
import flatVN from "../../assets/images/Vn@3x.png";
import defaultAvatar from "../../assets/images/avatar-default.jpg";
import { path } from "../../hooks/path";
import { userService } from "../../services/users.service";
import { validateProfile } from "../../utils/validate";
import logo from "../../assets/images/logo.png";
const getUserIdFromToken = () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return null;

    const payloadBase64 = accessToken.split(".")[1];
    if (!payloadBase64) return null;

    const normalizedBase64 = payloadBase64
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedBase64 = normalizedBase64.padEnd(
      normalizedBase64.length + ((4 - (normalizedBase64.length % 4)) % 4),
      "=",
    );

    const payload = JSON.parse(window.atob(paddedBase64));
    return payload?.userId || null;
  } catch (err) {
    console.log("Decode accessToken failed:", err);
    return null;
  }
};

const genderOptions = [
  { value: "", label: "Chọn giới tính" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const createEmptyForm = () => ({
  full_name: "",
  phone_number: "",
  gender: "",
  home_address: "",
});

const UserProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    [],
  );
  const currentUserId = storedUser?._id || getUserIdFromToken();

  const [user, setUser] = useState(storedUser);
  const [form, setForm] = useState(createEmptyForm());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      alert("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await userService.changePassword(passwordForm);

      alert(res?.data?.message || "Đổi mật khẩu thành công.");

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setIsChangingPassword(false);
    }
  };
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  useEffect(() => {
    if (!currentUserId) {
      navigate(path.login);
      return;
    }

    userService
      .getById(currentUserId)
      .then((res) => {
        const currentUser = res.data.metaData;
        setUser(currentUser);
        setAvatarPreview(currentUser?.avatar?.url || "");
        setForm({
          full_name: currentUser.full_name || "",
          phone_number: currentUser.phone_number || "",
          gender: currentUser.gender || "",
          home_address: currentUser.home_address || "",
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUserId, navigate]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn đúng file ảnh.");
      return;
    }

    setAvatarFile(file);

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !user?._id) return;

    try {
      setIsUploadingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await userService.uploadCloud(formData);

      const updatedUser = {
        ...user,
        avatar: res.data.metaData?.avatar || res.data.avatar,
      };

      setUser(updatedUser);
      setAvatarFile(null);
      setAvatarPreview(updatedUser?.avatar?.url || "");
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Cập nhật ảnh đại diện thành công.");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Cập nhật ảnh đại diện thất bại.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) return;

    const errorMessage = validateProfile(form);

    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        full_name: form.full_name.trim(),
        phone_number: form.phone_number.trim(),
        gender: form.gender,
        home_address: form.home_address.trim(),
      };

      const res = await userService.update(user._id, payload);

      const updatedUser = {
        ...user,
        ...res.data.metaData,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Cập nhật thông tin thành công.");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Cập nhật thông tin thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edf4ff_0%,#ffffff_35%,#edf4ff_100%)]">
      <div className="bg-primary pt-2 text-white">
        <div className="container-custom">
          <div className="flex items-center justify-between pb-3 pt-2">
            <Link to={path.homePage}>
              <img src={logo} className="w-[160px]" alt="" />
            </Link>

            <div className="flex items-center gap-2">
              <span className="cursor-pointer rounded-full p-2 hover:bg-white/10">
                <img src={flatVN} alt="VN" className="h-6 w-6 rounded-full" />
              </span>
              <span className="cursor-pointer rounded-full p-2 hover:bg-white/10">
                <Icon.questionCircle className="w-5 fill-white" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-10">
        <button
          type="button"
          onClick={() => navigate(path.homePage)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dbe7ff] bg-white px-5 py-3 text-sm font-semibold text-[#003b95] shadow-sm transition-all duration-300 hover:-translate-x-1 hover:bg-[#f3f8ff] hover:shadow-md"
        >
          <span className="text-lg leading-none">←</span>
          <span>Quay về</span>
        </button>
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[32px] border border-[#dbe7ff] bg-[linear-gradient(135deg,#003b95_0%,#006ce4_100%)] p-8 text-white shadow-[0_24px_60px_rgba(0,59,149,0.22)]">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.24em] text-white/85">
              User profile
            </span>

            <div className="mt-6 flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatarPreview || user?.avatar?.url || defaultAvatar}
                  alt="avatar"
                  className="h-20 w-20 rounded-full border-4 border-white/20 bg-white/10 "
                />
                <div>
                  <span className="block text-[26px] font-bold">
                    {user?.full_name || "Người dùng"}
                  </span>
                  <span className="mt-1 block text-sm text-white/80">
                    {user?.email || "email@example.com"}
                  </span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleChooseAvatar}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Chọn ảnh
                </button>

                <button
                  type="button"
                  onClick={handleUploadAvatar}
                  disabled={!avatarFile || isUploadingAvatar}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUploadingAvatar ? "Đang tải ảnh..." : "Cập nhật ảnh"}
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="rounded-[22px] border border-white/20 bg-white/10 p-4">
                <span className="block text-[13px] text-white/75">
                  Số điện thoại
                </span>
                <span className="mt-2 block text-[18px] font-semibold">
                  {user?.phone_number || "Chưa cập nhật"}
                </span>
              </div>

              <div className="rounded-[22px] border border-white/20 bg-white/10 p-4">
                <span className="block text-[13px] text-white/75">
                  Giới tính
                </span>
                <span className="mt-2 block text-[18px] font-semibold">
                  {genderOptions.find((item) => item.value === user?.gender)
                    ?.label || "Chưa cập nhật"}
                </span>
              </div>

              <div className="rounded-[22px] border border-white/20 bg-white/10 p-4">
                <span className="block text-[13px] text-white/75">
                  Địa chỉ nhà
                </span>
                <span className="mt-2 block text-[18px] font-semibold">
                  {user?.home_address || "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </aside>

          <section className="rounded-[32px] border border-[#dbe7ff] bg-white p-8 shadow-[0_20px_45px_rgba(0,59,149,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-[34px] font-bold text-[#10357b]">
                  Thông tin cá nhân
                </h1>
                <p className="mt-2 text-[15px] leading-7 text-[#5b6b88]">
                  Cập nhật thông tin liên hệ và hồ sơ để quản lý booking hoặc
                  chỗ nghỉ thuận tiện hơn.
                </p>
              </div>
            </div>
            <div className="mt-8 flex rounded-2xl border border-[#dbe7ff] bg-[#f7fbff] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "profile"
                    ? "bg-white text-[#006ce4] shadow-[0_8px_20px_rgba(0,59,149,0.08)]"
                    : "text-[#5b6b88] hover:text-[#003b95]"
                }`}
              >
                Thông tin cá nhân
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("password")}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === "password"
                    ? "bg-white text-[#006ce4] shadow-[0_8px_20px_rgba(0,59,149,0.08)]"
                    : "text-[#5b6b88] hover:text-[#003b95]"
                }`}
              >
                Đổi mật khẩu
              </button>
            </div>
            {loading ? (
              <div className="mt-8 rounded-[24px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-10 text-center text-[#5b6b88]">
                Đang tải thông tin user...
              </div>
            ) : (
              <>
                {activeTab === "profile" && (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-[#375070]">
                          Họ và tên
                        </label>
                        <input
                          value={form.full_name}
                          onChange={(e) =>
                            handleChange("full_name", e.target.value)
                          }
                          className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-[#375070]">
                          Email
                        </label>
                        <input
                          value={user?.email || ""}
                          disabled
                          className="h-13 w-full rounded-2xl border border-[#dbe7ff] bg-[#f4f7fc] px-4 text-[#5b6b88] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-[#375070]">
                          Số điện thoại
                        </label>
                        <input
                          value={form.phone_number}
                          onChange={(e) =>
                            handleChange("phone_number", e.target.value)
                          }
                          className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-[#375070]">
                          Giới tính
                        </label>
                        <select
                          value={form.gender}
                          onChange={(e) =>
                            handleChange("gender", e.target.value)
                          }
                          className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                        >
                          {genderOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-[#375070]">
                        Địa chỉ nhà
                      </label>
                      <textarea
                        rows={5}
                        value={form.home_address}
                        onChange={(e) =>
                          handleChange("home_address", e.target.value)
                        }
                        className="w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 py-3 outline-none transition focus:border-[#006ce4] focus:bg-white"
                        placeholder="Nhập địa chỉ nhà của bạn"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-2xl bg-primary-2 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_14px_30px_rgba(0,108,228,0.26)] transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSaving ? "Đang cập nhật..." : "Cập nhật thông tin"}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "password" && (
                  <form
                    onSubmit={handleChangePassword}
                    className="mt-8 space-y-5"
                  >
                    <div className="rounded-[28px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-6 shadow-[0_14px_34px_rgba(0,59,149,0.06)]">
                      <div className="mb-6">
                        <span className="inline-flex rounded-full bg-[#e8f2ff] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#006ce4]">
                          Bảo mật tài khoản
                        </span>

                        <h2 className="mt-3 text-[26px] font-bold text-[#10357b]">
                          Đổi mật khẩu
                        </h2>

                        <p className="mt-2 text-[15px] leading-7 text-[#5b6b88]">
                          Cập nhật mật khẩu mới để bảo vệ tài khoản và thông tin
                          đặt phòng của bạn.
                        </p>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-[#375070]">
                            Mật khẩu hiện tại
                          </label>

                          <input
                            type="password"
                            value={passwordForm.oldPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "oldPassword",
                                e.target.value,
                              )
                            }
                            className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-white px-4 text-[#1f2f46] outline-none transition focus:border-[#006ce4] focus:ring-4 focus:ring-[#006ce4]/10"
                            placeholder="Nhập mật khẩu hiện tại"
                          />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-[#375070]">
                              Mật khẩu mới
                            </label>

                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "newPassword",
                                  e.target.value,
                                )
                              }
                              className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-white px-4 text-[#1f2f46] outline-none transition focus:border-[#006ce4] focus:ring-4 focus:ring-[#006ce4]/10"
                              placeholder="Nhập mật khẩu mới"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-[#375070]">
                              Xác nhận mật khẩu mới
                            </label>

                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "confirmPassword",
                                  e.target.value,
                                )
                              }
                              className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-white px-4 text-[#1f2f46] outline-none transition focus:border-[#006ce4] focus:ring-4 focus:ring-[#006ce4]/10"
                              placeholder="Nhập lại mật khẩu mới"
                            />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#dbe7ff] bg-white px-4 py-4 text-[14px] leading-6 text-[#5b6b88]">
                          Mật khẩu nên có ít nhất 6 ký tự. Không nên dùng lại
                          mật khẩu cũ hoặc các thông tin dễ đoán như ngày sinh,
                          số điện thoại.
                        </div>

                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="rounded-2xl bg-primary-2 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_14px_30px_rgba(0,108,228,0.24)] transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isChangingPassword
                            ? "Đang đổi mật khẩu..."
                            : "Đổi mật khẩu"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
