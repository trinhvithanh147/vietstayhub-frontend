import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../assets/Icon/Icon";
import flatVN from "../../../assets/images/Vn@3x.png";
import { userService } from "../../../services/users.service";
import { path } from "../../../hooks/path";
import logo from "../../../assets/images/logo.png";
const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Login = () => {
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    if (errorMessage) {
      setErrorMessage("");
    }

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async () => {
    const emailValue =
      emailInputRef.current?.value?.trim() || form.email.trim();
    const passwordValue = passwordInputRef.current?.value || form.password;

    setForm({
      email: emailValue,
      password: passwordValue,
    });

    if (!emailValue || !passwordValue) {
      setErrorMessage("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const res = await userService.login({
        email: emailValue,
        password: passwordValue,
      });

      localStorage.setItem("accessToken", res.data.metaData.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.metaData.user));

      const nextPath =
        res.data.metaData.user?.role === "admin"
          ? path.adminPage
          : path.homePage;

      setTimeout(() => {
        navigate(nextPath);
      }, 300);
    } catch (err) {
      console.log(err);
      setErrorMessage(
        err?.response?.data?.message ||
          "Đăng nhập thất bại, kiểm tra lại thông tin.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginGoogle = () => {
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,#003b95_0%,#0c4cab_30%,#f3f8ff_30%,#ffffff_100%)]">
      <div className="pointer-events-none absolute left-[-120px] top-[160px] h-[280px] w-[280px] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] top-[220px] h-[220px] w-[220px] rounded-full bg-[#57a5ff]/20 blur-3xl" />

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

      <div className="container-custom relative z-10 pb-16 pt-12">
        <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_490px]">
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(155deg,#4f83d8_0%,#245fbe_38%,#0b3f97_100%)] p-8 text-white shadow-[0_24px_70px_rgba(0,59,149,0.28)]">
            <div className="max-w-[520px]">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold tracking-[0.02em] text-white">
                Tài khoản VietStayHub
              </span>

              <h1 className="mt-6 text-[42px] font-bold leading-[1.12] text-white">
                Đăng nhập để quản lý lịch đặt phòng và khám phá ưu đãi tốt hơn
              </h1>

              <p className="mt-5 max-w-[500px] text-[18px] leading-8 text-white/88">
                Theo dõi đơn đặt phòng, lưu chỗ nghỉ yêu thích và tiếp tục hành
                trình của bạn trên cùng một tài khoản.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Theo dõi tình trạng đặt phòng nhanh hơn",
                  "Lưu chỗ nghỉ yêu thích trên mọi thiết bị",
                  "Nhận ưu đãi và giá dành riêng cho thành viên",
                  "Đồng bộ lịch trình và thông tin tài khoản",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/12 bg-[rgba(255,255,255,0.08)] px-4 py-4 text-sm font-medium leading-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.08)] px-5 py-4">
                  <span className="block text-[28px] font-bold text-white">
                    24/7
                  </span>
                  <span className="text-sm text-white/80">
                    Hỗ trợ hành trình
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.08)] px-5 py-4">
                  <span className="block text-[28px] font-bold text-white">
                    1 tài khoản
                  </span>
                  <span className="text-sm text-white/80">
                    "Tất cả lịch đặt và chỗ nghỉ"
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-[#dbe7ff] bg-white/95 p-8 shadow-[0_22px_60px_rgba(0,59,149,0.12)] backdrop-blur">
            <span className="text-[34px] font-bold text-primary">
              Đăng nhập
            </span>

            <p className="mt-3 text-[15px] leading-7 text-secondary-2">
              Đăng nhập tài khoản VietStayHub của bạn để theo dõi lịch đặt
              phòng, lưu chỗ nghỉ yêu thích và quản lý hành trình dễ dàng hơn.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
                  Địa chỉ email
                </label>
                <input
                  ref={emailInputRef}
                  value={form.email}
                  onChange={handleChange}
                  name="email"
                  type="text"
                  autoComplete="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
                  Mật khẩu
                </label>
                <input
                  ref={passwordInputRef}
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-4 text-right">
              <Link
                to={path.forgotpassword}
                className="text-sm font-semibold text-primary-2 hover:text-primary"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="mt-8 h-13 w-full cursor-pointer rounded-2xl bg-primary-2 px-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,108,228,0.26)] transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-[#f0c6c2] bg-[#fff5f4] px-4 py-3 text-sm font-medium text-[#b42318]">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <hr className="h-[1px] flex-1 border-none bg-[#d9e2f1]" />
              <span className="whitespace-nowrap text-sm font-medium text-secondary-2">
                hoặc tiếp tục với
              </span>
              <hr className="h-[1px] flex-1 border-none bg-[#d9e2f1]" />
            </div>

            <button
              onClick={handleLoginGoogle}
              className="mt-6 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#d9e2f1] bg-white font-semibold text-secondary transition hover:border-[#006ce4] hover:bg-[#f6faff]"
            >
              <Icon.google />
              Đăng nhập với Google
            </button>

            <div className="mt-6 rounded-2xl bg-[#f8fbff] p-4 text-sm leading-7 text-secondary-2">
              Đăng nhập đồng nghĩa với việc bạn chấp nhận các điều khoản và
              chính sách bảo mật của VietStayHub.
            </div>

            <div className="mt-6 text-center text-sm text-secondary-2">
              Chưa có tài khoản?{" "}
              <Link to={path.register} className="font-semibold text-primary-2">
                Tạo tài khoản ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
