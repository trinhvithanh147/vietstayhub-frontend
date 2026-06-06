import { differenceInCalendarDays, format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { path } from "../../../../hooks/path";
import proPertiesService from "../../../../services/properties.service";
import { roomService } from "../../../../services/room.service";
import { BookingService } from "../../../../services/booking.service";

const cityMeta = {
  "da-lat": {
    title: "Đà Lạt",
    subtitle:
      "Không gian se lạnh, đồi thông và những khách sạn ấm cúng cho kỳ nghỉ nhẹ nhàng.",
  },
  "da-nang": {
    title: "Đà Nẵng",
    subtitle:
      "Những khách sạn gần biển, phòng sáng và không gian nghỉ dưỡng hiện đại.",
  },
  "ha-noi": {
    title: "Hà Nội",
    subtitle:
      "Lựa chọn lưu trú gần phố cổ, thú vị cho chuyến đi công tác và khám phá thành phố.",
  },
  "ho-chi-minh": {
    title: "Hồ Chí Minh",
    subtitle:
      "Khách sạn trung tâm, thuận tiện di chuyển và phù hợp cho những ngày ở năng động.",
  },
  "vung-tau": {
    title: "Vũng Tàu",
    subtitle:
      "Chỗ nghỉ gần biển với ban công, gió mát và những phòng nhìn ra thành phố biển.",
  },
};

const formatPriceVn = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price || 0);

const normalizeText = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const getSafeNumber = (value, fallback) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

const parseLocalDateParam = (value) => {
  if (!value) return new Date();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
};

const getAvailableRoomQuantity = (room, bookings) => {
  const bookedRooms = bookings.reduce((total, booking) => {
    const bookingRoomId =
      typeof booking.room_id === "object" ? booking.room_id?._id : booking.room_id;
    const normalizedBookingRoomId = String(bookingRoomId || "");
    const normalizedRoomId = String(room._id || "");

    if (normalizedBookingRoomId !== normalizedRoomId) {
      return total;
    }

    return total + (Number(booking.rooms_count) || 0);
  }, 0);

  return Math.max(0, (Number(room.quantity) || 0) - bookedRooms);
};

const isCityKeyword = (keyword, cityValue, cityTitle) => {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;

  const normalizedCitySlug = normalizeText(cityValue).replaceAll("-", " ");
  const normalizedCityTitle = normalizeText(cityTitle);

  return (
    normalizedKeyword === normalizedCitySlug ||
    normalizedKeyword === normalizeText(cityValue) ||
    normalizedKeyword === normalizedCityTitle
  );
};

const getDisplayDestination = (keyword, cityValue, cityTitle) => {
  if (isCityKeyword(keyword, cityValue, cityTitle)) {
    return cityTitle;
  }

  return keyword || cityTitle;
};

const getOwnerDisplay = (property) => {
  if (!property?.user_id) return "Chưa cập nhật";

  if (typeof property.user_id === "object") {
    return property.user_id.full_name || property.user_id.email || "Chưa cập nhật";
  }

  return "Chưa cập nhật";
};

const amenityLabels = {
  outdoor_pool: "Hồ bơi ngoài trời",
  free_wifi: "WiFi miễn phí",
  airport_shuttle: "Xe đưa đón sân bay",
  non_smoking_room: "Phòng không hút thuốc",
  room_service: "Dịch vụ phòng",
  restaurant: "Nhà hàng",
  free_parking: "Chỗ đỗ xe miễn phí",
  family_room: "Phòng gia đình",
  bar: "Quầy bar",
  breakfast: "Bữa sáng",
  balcony: "Ban công",
  air_conditioning: "Điều hòa",
  private_bathroom: "Phòng tắm riêng",
  terrace: "Sân hiên",
  garden_view: "Nhìn ra vườn",
  courtyard_view: "Hướng sân trong",
};

const CityProperties = () => {
  const { city } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const cityKey = city === "tp-hochiminh" ? "ho-chi-minh" : city;
  const cityInfo = cityMeta[cityKey] || {
    title: cityKey,
    subtitle: "Danh sách khách sạn phù hợp với tìm kiếm của bạn.",
  };

  useEffect(() => {
    Promise.all([
      proPertiesService.getCity(cityKey),
      roomService.getAll(),
      BookingService.getAll(),
    ])
      .then(([propertiesRes, roomsRes, bookingRes]) => {
        setProperties(propertiesRes.data.metaData || []);
        setRooms(roomsRes.data.metaData || []);
        setBookings(
          (bookingRes?.data?.metaData || []).filter(
            (booking) => booking.status === "confirmed",
          ),
        );
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cityKey]);

  const searchKeyword = searchParams.get("q") || cityInfo.title;
  const displayDestination = getDisplayDestination(
    searchKeyword,
    cityKey,
    cityInfo.title,
  );
  const guests = getSafeNumber(searchParams.get("guests"), 1);
  const roomsCount = getSafeNumber(searchParams.get("rooms"), 1);
  const checkIn = parseLocalDateParam(searchParams.get("checkIn"));
  const checkOut = parseLocalDateParam(searchParams.get("checkOut"));
  const nightCount = Math.max(1, differenceInCalendarDays(checkOut, checkIn));

  const propertyCards = useMemo(() => {
    return properties
      .map((item) => {
        const propertyRooms = rooms.filter((room) => {
          const roomPropertyId =
            typeof room.property_id === "object"
              ? room.property_id?._id
              : room.property_id;

          return roomPropertyId === item._id;
        });

        const availableRooms = propertyRooms.filter((room) => {
          const availableQuantity = getAvailableRoomQuantity(
            room,
            bookings,
          );

          return (
            availableQuantity >= roomsCount &&
            room.capacity * roomsCount >= guests &&
            nightCount <= (item.max_stay_days || 30)
          );
        });

        const minRoomPrice = availableRooms.length
          ? Math.min(...availableRooms.map((room) => room.price || 0))
          : item.base_price;

        const normalizedKeyword = normalizeText(searchKeyword);
        const keywordIsCity = isCityKeyword(
          searchKeyword,
          cityKey,
          cityInfo.title,
        );

        const keywordMatch =
          !normalizedKeyword ||
          keywordIsCity ||
          normalizeText(item.title).includes(normalizedKeyword) ||
          normalizeText(item.address).includes(normalizedKeyword) ||
          normalizeText(item.city).includes(normalizedKeyword);

        return {
          ...item,
          availableRooms,
          minRoomPrice,
          keywordMatch,
        };
      })
      .filter((item) => item.keywordMatch && item.availableRooms.length > 0)
      .sort((a, b) => {
        if (a.is_preferred === b.is_preferred) {
          return a.minRoomPrice - b.minRoomPrice;
        }

        return a.is_preferred ? -1 : 1;
      });
  }, [
    properties,
    rooms,
    bookings,
    roomsCount,
    guests,
    nightCount,
    searchKeyword,
    cityKey,
    cityInfo.title,
  ]);

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-[#1a1a1a]">
      <div className="bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-2)_100%)] px-4 pb-12 pt-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white backdrop-blur-sm">
              Thành phố đang tìm kiếm
            </span>
            <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
              Khách sạn tại {cityInfo.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-7 text-white/90">
              {cityInfo.subtitle}
            </p>
          </div>

          <div className="mt-8 grid gap-4 rounded-[28px] bg-white/92 p-5 shadow-[0_20px_80px_rgba(12,39,88,0.18)] backdrop-blur md:grid-cols-4">
            <div className="rounded-2xl bg-[#f6f9ff] p-4">
              <span className="block text-sm text-[#6b7280]">Điểm đến</span>
              <span className="mt-2 block text-lg font-semibold">
                {displayDestination}
              </span>
            </div>
            <div className="rounded-2xl bg-[#f6f9ff] p-4">
              <span className="block text-sm text-[#6b7280]">Lịch lưu trú</span>
              <span className="mt-2 block text-lg font-semibold">
                {format(checkIn, "dd/MM/yyyy")} - {format(checkOut, "dd/MM/yyyy")}
              </span>
            </div>
            <div className="rounded-2xl bg-[#f6f9ff] p-4">
              <span className="block text-sm text-[#6b7280]">Khách và phòng</span>
              <span className="mt-2 block text-lg font-semibold">
                {guests} khách - {roomsCount} phòng
              </span>
            </div>
            <div className="rounded-2xl bg-primary p-4 text-white">
              <span className="block text-sm text-white/80">Kết quả</span>
              <span className="mt-2 block text-lg font-semibold">
                {propertyCards.length} khách sạn
              </span>
              <span className="mt-1 block text-sm text-white/80">
                {nightCount} đêm được áp dụng để tìm phòng
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-8 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-[28px] border border-[#dce7f6] bg-white p-6 shadow-[0_8px_30px_rgba(15,56,110,0.06)] lg:sticky lg:top-6">
          <span className="text-2xl font-semibold">Tóm tắt tìm kiếm</span>
          <Link
            to={path.homePage}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#dbe7ff] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-primary transition hover:border-[#bfd3f6] hover:bg-[#eef5ff]"
          >
            <span className="text-base leading-none">←</span>
            <span>Quay về trang chủ</span>
          </Link>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-[#f8fbff] p-4">
              <span className="block text-sm text-[#64748b]">Thành phố</span>
              <span className="mt-1 block font-semibold">{cityInfo.title}</span>
            </div>

            <div className="rounded-2xl bg-[#f8fbff] p-4">
              <span className="block text-sm text-[#64748b]">Số đêm</span>
              <span className="mt-1 block font-semibold">{nightCount} đêm</span>
            </div>

            <div className="rounded-2xl bg-[#f8fbff] p-4">
              <span className="block text-sm text-[#64748b]">Số lượng đặt</span>
              <span className="mt-1 block font-semibold">
                {guests} khách - {roomsCount} phòng
              </span>
            </div>

            <div className="rounded-2xl bg-[rgba(0,108,228,0.08)] p-4">
              <span className="block text-sm text-primary-2">Mẹo đặt phòng</span>
              <p className="mt-2 text-sm leading-6 text-[#334155]">
                Nên ưu tiên những khách sạn còn phòng, có giá theo đêm rõ ràng và
                số đêm tối đa phù hợp với lịch đi của bạn.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex flex-col gap-5">
          {loading && (
            <div className="col-span-full rounded-[28px] border border-[#dce7f6] bg-white p-10 text-center shadow-[0_8px_30px_rgba(15,56,110,0.06)]">
              Đang tải danh sách khách sạn...
            </div>
          )}

          {!loading && propertyCards.length === 0 && (
            <div className="col-span-full rounded-[28px] border border-[#dce7f6] bg-white p-10 text-center shadow-[0_8px_30px_rgba(15,56,110,0.06)]">
              <span className="block text-2xl font-semibold">
                Chưa tìm thấy khách sạn phù hợp
              </span>
              <p className="mt-3 text-[#64748b]">
                Thử đổi thành phố, giảm số khách hoặc số phòng để xem thêm kết quả.
              </p>
            </div>
          )}

          {!loading &&
            propertyCards.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-[24px] border border-[#dce7f6] bg-white shadow-[0_10px_35px_rgba(0,59,149,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,59,149,0.14)]"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-[220px] w-full shrink-0 overflow-hidden md:h-auto md:w-[300px]">
                    <img
                      src={item.main_image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                      {item.is_preferred && (
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                          Ưu tiên
                        </span>
                      )}

                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1a1a1a]">
                        Tối đa {item.max_stay_days} đêm
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 md:p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/properties/${item.city}/${item.slug}${location.search}`}
                          className="line-clamp-2 text-[24px] font-bold leading-tight text-primary transition hover:text-primary-2"
                        >
                          {item.title}
                        </Link>

                        <span className="mt-2 block line-clamp-1 text-sm text-[#64748b]">
                          {item.address}, {item.country}
                        </span>

                        <span className="mt-3 inline-flex w-fit rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#0b4ecb]">
                          Chủ sở hữu: {getOwnerDisplay(item)}
                        </span>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#334155]">
                          {item.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {Object.entries(item.amenities || {})
                            .filter(([, value]) => value)
                            .slice(0, 3)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="rounded-full border border-[#dce7f6] bg-[#f8fbff] px-3 py-1 text-xs text-primary"
                              >
                                {amenityLabels[key] || key.replaceAll("_", " ")}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="w-full shrink-0 rounded-[18px] bg-[#f8fbff] p-4 md:w-[220px]">
                        <span className="block text-sm text-[#64748b]">Giá từ</span>
                        <span className="mt-1 block text-[28px] font-bold text-primary">
                          {formatPriceVn(item.minRoomPrice)}
                        </span>
                        <span className="mt-1 block text-sm text-[#64748b]">/ đêm</span>
                        <span className="mt-3 block text-sm font-medium text-[#008234]">
                          {item.availableRooms.length} phòng phù hợp
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 border-t border-[#e8eef8] pt-4 md:flex-row md:items-center md:justify-between">
                      <span className="text-sm text-[#64748b]">
                        {guests} khách - {roomsCount} phòng - {nightCount} đêm
                      </span>

                      <Link
                        to={`/properties/${item.city}/${item.slug}${location.search}`}
                        className="inline-flex items-center justify-center rounded-xl bg-primary-2 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </section>
      </div>
    </div>
  );
};

export default CityProperties;
