import { Link } from "react-router-dom";
import { path } from "../../hooks/path";
import usePageTitle from "../../hooks/usePageTitle";

const NotFoundPage = () => {
  usePageTitle("Không tìm thấy trang");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#edf4ff_0%,#ffffff_45%,#edf4ff_100%)] px-4 py-16">
      <section className="mx-auto max-w-[720px] rounded-[32px] border border-[#dbe7ff] bg-white p-8 text-center shadow-[0_22px_60px_rgba(0,59,149,0.12)] sm:p-10">
        <span className="inline-flex rounded-full bg-[#e8f2ff] px-4 py-2 text-sm font-semibold text-[#006ce4]">
          404
        </span>
        <h1 className="mt-5 text-[34px] font-bold leading-tight text-[#003b95] sm:text-[42px]">
          Không tìm thấy trang
        </h1>
        <p className="mx-auto mt-4 max-w-[540px] text-[16px] leading-8 text-[#5b6b88]">
          Đường dẫn này có thể đã thay đổi hoặc không còn tồn tại. Hãy quay về
          trang chủ để tiếp tục tìm chỗ nghỉ phù hợp.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={path.homePage}
            className="rounded-2xl bg-[#006ce4] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#003b95]"
          >
            Về trang chủ
          </Link>
          <Link
            to={path.login}
            className="rounded-2xl border border-[#cfdcf1] bg-white px-6 py-3 text-sm font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
          >
            Đăng nhập tài khoản
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
