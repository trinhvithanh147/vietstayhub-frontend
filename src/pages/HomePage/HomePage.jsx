import HomeIntroShowcase from "./components/HomeIntroShowcase/HomeIntroShowcase";
import TrendingDestinationsPage from "./components/TrendingDestinations/TrendingDestinationsPage";
import GuestFavoritesShowcase from "./components/GuestFavoritesPage/GuestFavoritesShowcase";
import IdealStayShowcase from "./components/IdealStayPage/IdealStayShowcase";

const HomePage = () => {
  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#f3f8ff_0%,#ffffff_32%,#f7fbff_100%)] pb-16">
      <HomeIntroShowcase />

      <div className="mt-16">
        <TrendingDestinationsPage />
      </div>

      <div className="mt-16">
        <GuestFavoritesShowcase />
      </div>

      <section className="container-custom mt-16">
        <div className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#003b95_0%,#006ce4_100%)] px-6 py-10 text-white shadow-[0_24px_60px_rgba(0,59,149,0.24)] md:px-10">
          <div className="relative z-[2] max-w-[680px]">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/85">
              Dành cho chủ chỗ nghỉ
            </span>

            <h2 className="mt-5 text-[30px] font-bold leading-tight md:text-[40px]">
              Đăng chỗ nghỉ của bạn và quản lý booking dễ dàng hơn
            </h2>

            <p className="mt-4 text-[16px] leading-7 text-white/80">
              Theo dõi phòng, đơn đặt, đánh giá và trạng thái booking trong một
              dashboard trực quan, phù hợp để mở rộng thành đồ án hoàn chỉnh.
            </p>

            <button className="mt-6 rounded-2xl bg-white px-6 py-3 text-[15px] font-bold text-[#003b95] transition hover:bg-[#eef5ff]">
              Bắt đầu quản lý chỗ nghỉ
            </button>
          </div>

          <div className="absolute -right-16 -top-16 h-[260px] w-[260px] rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-24 h-[220px] w-[220px] rounded-full bg-white/10" />
        </div>
      </section>

      <div className="mt-16">
        <IdealStayShowcase />
      </div>
    </main>
  );
};

export default HomePage;
