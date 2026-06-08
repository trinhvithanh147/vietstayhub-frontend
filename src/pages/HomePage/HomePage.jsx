import HomeIntroShowcase from "./components/HomeIntroShowcase/HomeIntroShowcase";
import TrendingDestinationsPage from "./components/TrendingDestinations/TrendingDestinationsPage";
import GuestFavoritesShowcase from "./components/GuestFavoritesPage/GuestFavoritesShowcase";
import IdealStayShowcase from "./components/IdealStayPage/IdealStayShowcase";

const HomePage = () => {
  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,#f3f8ff_0%,#ffffff_32%,#f7fbff_100%)] pb-10 sm:pb-14 lg:pb-16">
      <HomeIntroShowcase />

      <div className="mt-10 sm:mt-12 lg:mt-16">
        <TrendingDestinationsPage />
      </div>

      <div className="mt-10 sm:mt-12 lg:mt-16">
        <GuestFavoritesShowcase />
      </div>

      <section className="container-custom mt-10 sm:mt-12 lg:mt-16">
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#003b95_0%,#006ce4_100%)] px-5 py-8 text-white shadow-[0_24px_60px_rgba(0,59,149,0.24)] sm:rounded-[30px] md:px-10 md:py-10 lg:rounded-[36px]">
          <div className="relative z-[2] max-w-[680px]">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/85 sm:text-[13px] sm:tracking-[0.18em]">
              Dành cho chủ chỗ nghỉ
            </span>

            <h2 className="mt-5 text-[26px] font-bold leading-tight sm:text-[32px] md:text-[40px]">
              Đăng chỗ nghỉ của bạn và quản lý booking dễ dàng hơn
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-white/80 sm:text-[16px]">
              Theo dõi phòng, đơn đặt, đánh giá và trạng thái booking trong một
              dashboard trực quan, phù hợp để mở rộng thành đồ án hoàn chỉnh.
            </p>

            <button className="mt-6 rounded-2xl bg-white px-6 py-3 text-[15px] font-bold text-[#003b95] transition hover:bg-[#eef5ff]">
              Bắt đầu quản lý chỗ nghỉ
            </button>
          </div>

          <div className="absolute -right-20 -top-20 hidden h-[260px] w-[260px] rounded-full bg-white/10 lg:block" />
          <div className="absolute -bottom-24 right-24 hidden h-[220px] w-[220px] rounded-full bg-white/10 lg:block" />
        </div>
      </section>

      <div className="mt-10 sm:mt-12 lg:mt-16">
        <IdealStayShowcase />
      </div>
    </main>
  );
};

export default HomePage;
