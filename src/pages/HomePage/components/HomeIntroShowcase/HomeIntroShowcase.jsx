import Icon from "../../../../assets/Icon/Icon";

const highlights = [
  {
    title: "Tìm đúng chỗ nghỉ, đúng phong cách",
    description:
      "Từ khách sạn trung tâm đến resort nghỉ dưỡng, bạn có thể bắt đầu hành trình với bộ lọc đơn giản và gợi ý rõ ràng hơn.",
    badge: "Gợi ý thông minh",
  },
  {
    title: "Đặt nhanh và theo dõi booking gọn gàng",
    description:
      "Lịch ở, số khách, tổng tiền và trạng thái booking được hiển thị rõ trong một giao diện dễ theo dõi.",
    badge: "Quản lý dễ dàng",
  },
  {
    title: "Danh sách điểm đến đang hot được làm nổi bật hơn",
    description:
      "Thêm một lớp nội dung ở giữa hero và city grid giúp trang có nhịp hơn, không bị rơi thẳng vào danh sách ảnh.",
    badge: "Chuyển nhịp tốt hơn",
  },
];

const metrics = [
  { value: "5", label: "Thành phố nổi bật" },
  { value: "100+", label: "Lựa chọn chỗ nghỉ" },
  { value: "24/7", label: "Sẵn sàng đặt phòng" },
];

const HomeIntroShowcase = () => {
  return (
    <section className="container-custom relative z-[2] mt-8 sm:mt-12 lg:mt-28">
      <div className="overflow-hidden rounded-[24px] border border-[#d7e5ff] bg-[linear-gradient(135deg,#ffffff_0%,#f5f9ff_55%,#eaf3ff_100%)] shadow-[0_20px_50px_rgba(0,59,149,0.12)] sm:rounded-[32px]">
        <div className="grid gap-6 p-5 sm:p-6 md:p-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f1ff] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#003b95] sm:text-[13px] sm:tracking-[0.18em]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#006ce4]" />
              Bắt đầu hành trình
            </span>

            <h2 className="mt-5 max-w-[560px] text-[26px] font-bold leading-tight text-[#10357b] sm:text-[32px] md:text-[38px]">
              Lên kế hoạch nhanh hơn trước khi khám phá điểm đến đang thịnh
              hành.
            </h2>

            <p className="mt-4 max-w-[600px] text-[15px] leading-7 text-[#4f6283] sm:text-[16px]">
              Một lớp nội dung đệm ở giữa hero và danh sách thành phố sẽ giúp
              home page có nhịp tốt hơn, trông sạch hơn và tạo cảm giác sản phẩm
              chau chuốt ngay từ màn hình đầu tiên.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 md:gap-4">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-[#d9e5fb] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(0,59,149,0.06)] sm:rounded-[22px] sm:px-5"
                >
                  <span className="block text-[26px] font-bold text-[#003b95]">
                    {item.value}
                  </span>
                  <span className="mt-1 block text-[14px] text-[#6a7b97]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((item, index) => (
              <div
                key={item.title}
              className={`rounded-[20px] border border-[#d8e5fb] bg-white p-4 shadow-[0_16px_36px_rgba(0,59,149,0.08)] sm:rounded-[24px] sm:p-5 ${
                  index === 1 ? "xl:translate-x-6" : ""
                } ${index === 2 ? "xl:translate-x-12" : ""}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#003b95_0%,#006ce4_100%)]">
                    {index === 0 && (
                      <Icon.localtion className="h-5 w-5 fill-white" />
                    )}
                    {index === 1 && (
                      <Icon.stay className="h-5 w-5 fill-white" />
                    )}
                    {index === 2 && (
                      <Icon.earth className="h-5 w-5 fill-white" />
                    )}
                  </div>

                  <div>
                    <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-[12px] font-semibold text-[#003b95]">
                      {item.badge}
                    </span>
                    <h3 className="mt-3 text-[19px] font-bold text-[#133a7c]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-7 text-[#5f7291]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeIntroShowcase;
