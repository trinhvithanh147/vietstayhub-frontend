import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Icon from "../../../assets/Icon/Icon";
import flatVN from "../../../assets/images/Vn@3x.png";
import { userService } from "../../../services/users.service";
import { path } from "../../../hooks/path";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      if (form.password !== form.confirmPassword) {
        alert("Mật khẩu không khớp");
        return;
      }

      await userService.create({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });

      navigate(path.login);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_26%),linear-gradient(180deg,#003b95_0%,#0c4cab_30%,#f3f8ff_30%,#ffffff_100%)]">
      <div className="pointer-events-none absolute left-[-80px] top-[180px] h-[260px] w-[260px] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-100px] top-[260px] h-[240px] w-[240px] rounded-full bg-[#57a5ff]/18 blur-3xl" />

      <div className="bg-primary pt-2 text-white">
        <div className="container-custom">
          <div className="flex items-center justify-between pb-3 pt-2">
            <Link to={path.homePage}>
              <Icon.logoBrand className="h-[24px] w-[144px]" />
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

      <div className="container-custom relative z-10 pb-16 pt-12">
        <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_510px]">
          <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(155deg,#4f83d8_0%,#245fbe_38%,#0b3f97_100%)] p-8 text-white shadow-[0_24px_70px_rgba(0,59,149,0.28)]">
            <div className="max-w-[520px]">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold tracking-[0.02em] text-white">
                New host & guest account
              </span>

              <h1 className="mt-6 text-[42px] font-bold leading-[1.12] text-white">
                Tạo tài khoản để bắt đầu đặt phòng và quản lý chỗ nghỉ
              </h1>

              <p className="mt-5 max-w-[500px] text-[18px] leading-8 text-white/88">
                Mở một tài khoản để lưu lịch sử đặt phòng, sử dụng ưu đãi thành
                viên và quản lý property trên cùng hệ thống.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Đặt phòng nhanh hơn trên mọi thiết bị",
                  "Lưu thông tin và danh sách yêu thích",
                  "Quản lý chỗ nghỉ và room trên cùng dashboard",
                  "Nhận ưu đãi và thông báo phù hợp hơn",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/12 bg-[rgba(255,255,255,0.08)] px-4 py-4 text-sm font-medium leading-6 text-white"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[28px] border border-white/12 bg-[rgba(255,255,255,0.08)] p-5">
                <span className="block text-[18px] font-semibold text-white">
                  Tài khoản này dùng được cho cả người đặt phòng và chủ chỗ nghỉ
                </span>
                <span className="mt-2 block text-sm leading-7 text-white/82">
                  Sau khi tạo tài khoản, bạn có thể đặt phòng, quản lý booking
                  và thêm property, room trên cùng một dashboard.
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-[#dbe7ff] bg-white/95 p-8 shadow-[0_22px_60px_rgba(0,59,149,0.12)] backdrop-blur">
            <span className="text-[34px] font-bold text-primary">
              Tạo tài khoản
            </span>

            <p className="mt-3 text-[15px] leading-7 text-secondary-2">
              Điền thông tin cơ bản để bắt đầu sử dụng Booking.com cho hành
              trình và việc quản lý chỗ nghỉ của bạn.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
                  Họ và tên
                </label>
                <input
                  value={form.full_name}
                  onChange={handleChange}
                  name="full_name"
                  type="text"
                  placeholder="Nhập họ tên của bạn"
                  className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
                  Địa chỉ email
                </label>
                <input
                  value={form.email}
                  onChange={handleChange}
                  name="email"
                  type="text"
                  placeholder="Nhập địa chỉ email của bạn"
                  className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
                  Mật khẩu
                </label>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
                  Nhập lại mật khẩu
                </label>
                <input
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                />
              </div>
            </div>

            <button
              onClick={handleRegister}
              className="mt-8 h-13 w-full cursor-pointer rounded-2xl bg-primary-2 px-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,108,228,0.26)] transition hover:bg-primary"
            >
              Tạo tài khoản
            </button>

            <button
              onClick={() => (window.location.href = `${apiBaseUrl}/auth/google`)}
              className="mt-4 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#d9e2f1] bg-white font-semibold text-secondary transition hover:border-[#006ce4] hover:bg-[#f6faff]"
            >
              <Icon.google />
              Đăng ký với Google
            </button>

            <div className="mt-6 rounded-2xl bg-[#f8fbff] p-4 text-sm leading-7 text-secondary-2">
              Tạo tài khoản đồng nghĩa với việc bạn chấp nhận các điều khoản và
              chính sách bảo mật của Booking.com.
            </div>

            <div className="mt-6 text-center text-sm text-secondary-2">
              Đã có tài khoản?{" "}
              <Link
                to={path.login}
                className="cursor-pointer font-semibold text-primary-2"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
