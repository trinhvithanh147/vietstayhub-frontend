import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import proPertiesService from "../../../../services/properties.service";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./idealStaySwiper.scss";

const formatPriceVn = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price || 0);

const amenityLabels = {
  outdoor_pool: "Hồ bơi ngoài trời",
  free_wifi: "WiFi miễn phí",
  airport_shuttle: "Xe đưa đón sân bay",
  non_smoking_room: "Phòng không hút thuốc",
  room_service: "Dịch vụ phòng",
  restaurant: "Nhà hàng",
  free_parking: "Đậu xe miễn phí",
  family_room: "Phòng gia đình",
  bar: "Quầy bar",
  breakfast: "Bữa sáng",
};

const IdealStayShowcase = () => {
  const [properties, setProperties] = useState([]);
  const visibleProperties = properties.slice(0, 10);

  useEffect(() => {
    proPertiesService
      .getAll()
      .then((res) => {
        setProperties(res.data.metaData || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <section className="container-custom mt-10 rounded-[24px] border border-[#dbe7ff] bg-white px-5 py-7 text-[#1a1a1a] shadow-[0_14px_40px_rgba(0,59,149,0.06)] sm:mt-14 sm:rounded-[32px] md:px-8 md:py-8 lg:rounded-[36px]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-[rgba(0,59,149,0.08)] px-4 py-1 text-sm font-semibold text-primary">
            Gợi ý cho bạn
          </span>
          <h2 className="mt-4 text-24">Chỗ nghỉ hợp gu và dễ chọn</h2>
          <p className="mt-2 text-[16px] leading-7 text-[#5f6b7a]">
            Những khách sạn có mức giá cân bằng, hình ảnh đẹp và phù hợp để đi
            nhanh cuối tuần hoặc kỳ nghỉ ngắn ngày.
          </p>
        </div>

        <div className="rounded-2xl bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-2)_100%)] px-5 py-4 text-white shadow-[0_16px_35px_rgba(0,59,149,0.2)]">
          <span className="block text-sm text-white/80">Lựa chọn hiện có</span>
          <span className="mt-1 block text-lg font-semibold">
            {visibleProperties.length} điểm lưu trú
          </span>
        </div>
      </div>

      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 14 },
          640: { slidesPerView: 1.35, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 18 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        className="ideal-stay-swiper mt-8"
      >
        {visibleProperties.map((item) => (
          <SwiperSlide key={item._id} className="h-auto pb-10">
            <Link
              to={`/properties/${item.city}/${item.slug}`}
              className="group flex h-full min-h-[460px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eefb] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_55px_rgba(15,23,42,0.14)] sm:rounded-[28px] md:min-h-[500px]"
            >
              <div className="relative h-[200px] overflow-hidden sm:h-[220px]">
                <img
                  src={item.main_image_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-primary">
                  {item.city}
                </div>
              </div>

              <div className="flex h-full flex-col space-y-4 p-5">
                <div>
                  <span className="block min-h-[64px] text-[21px] font-bold leading-tight text-primary">
                    {item.title}
                  </span>
                  <span className="mt-2 block text-sm text-[#64748b]">
                    {item.address}
                  </span>
                </div>

                <p className="min-h-[72px] line-clamp-3 text-sm leading-6 text-[#5f6b7a]">
                  {item.description}
                </p>

                <div className="min-h-[72px] flex flex-wrap content-start gap-2">
                  {Object.entries(item.amenities || {})
                    .filter(([, value]) => value)
                    .slice(0, 4)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="rounded-full bg-[rgba(0,108,228,0.08)] px-3 py-1 text-xs font-medium text-primary-2"
                      >
                        {amenityLabels[key] || key.replaceAll("_", " ")}
                      </span>
                    ))}
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-[#e8eef8] pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div>
                    <span className="block text-sm text-[#64748b]">Giá từ</span>
                    <span className="mt-1 block text-xl font-bold text-primary">
                      {formatPriceVn(item.base_price)}
                    </span>
                  </div>
                  <span className="rounded-2xl border border-primary-2 px-4 py-2 text-sm font-semibold text-primary-2 transition group-hover:bg-primary-2 group-hover:text-white">
                    Khám phá ngay
                  </span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default IdealStayShowcase;
