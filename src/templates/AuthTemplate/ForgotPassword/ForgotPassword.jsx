import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../assets/Icon/Icon";
import flatVN from "../../../assets/images/Vn@3x.png";
import { path } from "../../../hooks/path";
import { userService } from "../../../services/users.service";

const STEP_SEND_EMAIL = 1;
const STEP_VERIFY_CODE = 2;
const STEP_RESET_PASSWORD = 3;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_SEND_EMAIL);
  const [form, setForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepTitle = useMemo(() => {
    if (step === STEP_VERIFY_CODE) return "Nhập mã xác thực";
    if (step === STEP_RESET_PASSWORD) return "Đặt mật khẩu mới";
    return "Quên mật khẩu";
  }, [step]);

  const handleFieldChange = (field, value) => {
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ email.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await userService.requestPasswordReset({
        email: form.email.trim(),
      });

      setStep(STEP_VERIFY_CODE);
      setSuccessMessage(
        "Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
      );
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Không thể gửi mã xác thực. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      setErrorMessage("Vui lòng nhập mã xác thực.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await userService.verifyResetCode({
        email: form.email.trim(),
        code: form.code.trim(),
      });

      setStep(STEP_RESET_PASSWORD);
      setSuccessMessage("Mã xác thực hợp lệ. Bạn có thể đặt mật khẩu mới.");
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Mã xác thực không hợp lệ. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!form.newPassword || !form.confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }

    if (form.newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await userService.resetPassword({
        email: form.email.trim(),
        code: form.code.trim(),
        newPassword: form.newPassword,
      });

      setSuccessMessage("Đổi mật khẩu thành công. Đang chuyển về trang đăng nhập...");

      setTimeout(() => {
        navigate(path.login);
      }, 1200);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepForm = () => {
    if (step === STEP_VERIFY_CODE) {
      return (
        <form onSubmit={handleVerifyCode} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
              Địa chỉ email
            </label>
            <input
              value={form.email}
              type="email"
              disabled
              className="h-13 w-full rounded-2xl border border-[#dbe7ff] bg-[#f3f7ff] px-4 text-[#5b6b88] outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
              Mã xác thực
            </label>
            <input
              value={form.code}
              onChange={(e) => handleFieldChange("code", e.target.value)}
              type="text"
              maxLength={6}
              placeholder="Nhập mã gồm 6 số"
              className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 tracking-[0.3em] outline-none transition focus:border-[#006ce4] focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-13 flex-1 rounded-2xl bg-primary-2 px-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,108,228,0.26)] transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Đang xác thực..." : "Xác thực mã"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSendCode}
              className="h-13 rounded-2xl border border-[#cfdcf1] bg-white px-5 text-sm font-semibold text-[#26446d] transition hover:bg-[#f7fbff] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Gửi lại mã
            </button>
          </div>
        </form>
      );
    }

    if (step === STEP_RESET_PASSWORD) {
      return (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
              Mật khẩu mới
            </label>
            <input
              value={form.newPassword}
              onChange={(e) => handleFieldChange("newPassword", e.target.value)}
              type="password"
              placeholder="Nhập mật khẩu mới"
              className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
              Nhập lại mật khẩu mới
            </label>
            <input
              value={form.confirmPassword}
              onChange={(e) =>
                handleFieldChange("confirmPassword", e.target.value)
              }
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-13 w-full rounded-2xl bg-primary-2 px-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,108,228,0.26)] transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={handleSendCode} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-[13px] font-semibold tracking-[0.04em] text-secondary">
            Địa chỉ email
          </label>
          <input
            value={form.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            className="h-13 w-full rounded-2xl border border-[#c9d8ef] bg-[#fbfdff] px-4 outline-none transition focus:border-[#006ce4] focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-13 w-full rounded-2xl bg-primary-2 px-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(0,108,228,0.26)] transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Đang gửi mã..." : "Gửi mã xác thực"}
        </button>
      </form>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,#003b95_0%,#0c4cab_28%,#f3f8ff_28%,#ffffff_100%)]">
      <div className="pointer-events-none absolute left-[-120px] top-[160px] h-[280px] w-[280px] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] top-[220px] h-[220px] w-[220px] rounded-full bg-[#57a5ff]/20 blur-3xl" />

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
        <div className="grid items-start gap-8 lg:grid-cols-[1.02fr_500px]">
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(155deg,#4f83d8_0%,#245fbe_38%,#0b3f97_100%)] p-8 text-white shadow-[0_24px_70px_rgba(0,59,149,0.28)]">
            <div className="max-w-[520px]">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold tracking-[0.02em] text-white">
                Khôi phục tài khoản
              </span>

              <h1 className="mt-6 text-[42px] font-bold leading-[1.12] text-white">
                Lấy lại tài khoản bằng mã xác thực gửi qua email
              </h1>

              <p className="mt-5 max-w-[500px] text-[18px] leading-8 text-white/88">
                Nhập email đã đăng ký để nhận mã xác thực. Sau khi xác nhận mã,
                bạn có thể đặt lại mật khẩu mới ngay trên hệ thống.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "1", text: "Nhập email" },
                  { label: "2", text: "Nhập mã xác thực" },
                  { label: "3", text: "Đổi mật khẩu mới" },
                ].map((item, index) => {
                  const isActive = step >= index + 1;

                  return (
                    <div
                      key={item.label}
                      className={`rounded-2xl border px-4 py-4 text-sm font-medium leading-6 ${
                        isActive
                          ? "border-white/20 bg-[rgba(255,255,255,0.14)] text-white"
                          : "border-white/10 bg-[rgba(255,255,255,0.08)] text-white/72"
                      }`}
                    >
                      <span className="mb-2 block text-[24px] font-bold">
                        {item.label}
                      </span>
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[28px] border border-white/12 bg-[rgba(255,255,255,0.08)] p-5">
                <span className="block text-[18px] font-semibold text-white">
                  Mã xác thực có hiệu lực trong 10 phút
                </span>
                <span className="mt-2 block text-sm leading-7 text-white/82">
                  Nếu không thấy email, bạn hãy kiểm tra thêm mục thư rác hoặc gửi
                  lại mã xác thực ở bước tiếp theo.
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-[#dbe7ff] bg-white/95 p-8 shadow-[0_22px_60px_rgba(0,59,149,0.12)] backdrop-blur">
            <span className="text-[34px] font-bold text-primary">
              {stepTitle}
            </span>

            <p className="mt-3 text-[15px] leading-7 text-secondary-2">
              {step === STEP_SEND_EMAIL &&
                "Bắt đầu bằng email đã đăng ký để nhận mã xác thực qua Gmail."}
              {step === STEP_VERIFY_CODE &&
                "Nhập đúng mã gồm 6 số đã được gửi về email của bạn."}
              {step === STEP_RESET_PASSWORD &&
                "Mã đã được xác thực. Bây giờ bạn có thể đặt mật khẩu mới."}
            </p>

            {renderStepForm()}

            {(errorMessage || successMessage) && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-4 text-sm leading-7 ${
                  errorMessage
                    ? "border-[#f0c6c2] bg-[#fff5f4] text-[#b42318]"
                    : "border-[#b9ddc5] bg-[#f3fff6] text-[#166534]"
                }`}
              >
                {errorMessage || successMessage}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-secondary-2">
              <Link to={path.login} className="font-semibold text-primary-2">
                Quay lại đăng nhập
              </Link>
              <Link to={path.register} className="font-semibold text-primary-2">
                Tạo tài khoản mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
