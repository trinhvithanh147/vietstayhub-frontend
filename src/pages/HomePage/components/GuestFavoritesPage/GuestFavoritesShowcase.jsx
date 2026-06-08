import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import proPertiesService from "../../../../services/properties.service";
import { reviewService } from "../../../../services/review.service";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./guestFavoritesSwiper.scss";

const formatPriceVn = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price || 0);

const GuestFavoritesShowcase = () => {
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);

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

  useEffect(() => {
    reviewService
      .getAll()
      .then((res) => {
        setReviews(res.data.metaData || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const favoriteProperties = useMemo(() => {
    return properties
      .map((property) => {
        const currentReviews = reviews.filter((item) => {
          const propertyId =
            typeof item.property_id === "object"
              ? item.property_id?._id
              : item.property_id;

          return propertyId === property._id;
        });

        const totalRating = currentReviews.reduce(
          (sum, item) => sum + item.rating,
          0,
        );
        const averageRating = currentReviews.length
          ? Number((totalRating / currentReviews.length).toFixed(1))
          : 0;

        return {
          ...property,
          averageRating,
          reviewCount: currentReviews.length,
        };
      })
      .filter((item) => item.averageRating >= 7 || item.is_preferred)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);
  }, [properties, reviews]);

  return (
    <section className="container-custom mt-10 rounded-[24px] border border-[#dbe7ff] bg-[linear-gradient(180deg,rgba(0,59,149,0.06)_0%,rgba(255,255,255,1)_100%)] px-5 py-7 text-[#1a1a1a] sm:mt-14 sm:rounded-[32px] md:px-8 md:py-8 lg:rounded-[36px]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-[rgba(0,108,228,0.1)] px-4 py-1 text-sm font-semibold text-primary-2">
            Lựa chọn nổi bật
          </span>
          <h2 className="mt-4 text-24">Khách sạn được yêu thích nhất</h2>
          <p className="mt-2 text-[16px] leading-7 text-[#5f6b7a]">
            Những điểm lưu trú có đánh giá tốt, hình ảnh đẹp và mức giá dễ chọn
            cho kỳ nghỉ tiếp theo của bạn.
          </p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,59,149,0.08)]">
          <span className="block text-sm text-[#5f6b7a]">Tổng gợi ý</span>
          <span className="mt-1 block text-lg font-semibold text-primary">
            {favoriteProperties.length} khách sạn
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
        className="guest-favorites-swiper mt-8"
      >
        {favoriteProperties.map((item) => (
          <SwiperSlide key={item._id} className="h-auto pb-10">
            <Link
              to={`/properties/${item.city}/${item.slug}`}
              className="group flex h-full min-h-[460px] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eefb] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_55px_rgba(15,23,42,0.14)] sm:rounded-[28px] md:min-h-[500px]"
            >
              <div className="relative h-[220px] overflow-hidden sm:h-[240px] md:h-[250px]">
                <img
                  src={item.main_image_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-primary">
                    {item.city}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div className="min-w-0 max-w-[70%]">
                    <span className="block line-clamp-2 text-[18px] font-bold leading-tight text-white sm:text-[22px]">
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-sm text-white/85">
                      {item.address}
                    </span>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-primary px-3 py-2 text-center text-white shadow-[0_10px_25px_rgba(0,59,149,0.24)]">
                    <span className="block text-lg font-bold">
                      {item.averageRating || "Mới"}
                    </span>
                    <span className="block text-[11px] uppercase tracking-[0.08em]">
                      score
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="block text-sm text-[#64748b]">
                      Đánh giá từ khách
                    </span>
                    <span className="mt-1 block font-semibold text-[#1a1a1a]">
                      {item.averageRating >= 8
                        ? "Tuyệt vời"
                        : item.averageRating >= 7
                          ? "Rất tốt"
                          : "Đang cập nhật"}
                    </span>
                  </div>
                  <span className="rounded-full bg-[rgba(0,108,228,0.08)] px-3 py-1 text-sm font-medium text-primary-2">
                    {item.reviewCount} đánh giá
                  </span>
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-[#e8eef8] pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div>
                    <span className="block text-sm text-[#64748b]">Giá từ</span>
                    <span className="mt-1 block text-xl font-bold text-primary">
                      {formatPriceVn(item.base_price)}
                    </span>
                  </div>
                  <span className="rounded-2xl bg-primary-2 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-primary">
                    Xem chi tiết
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

export default GuestFavoritesShowcase;
