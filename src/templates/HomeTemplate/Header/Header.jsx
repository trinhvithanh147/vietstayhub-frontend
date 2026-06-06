import { Link, useNavigate } from "react-router-dom";
import Icon from "../../../assets/Icon/Icon";
import ButtonCustom from "../../../components/ButtonCustom/ButtonCustom";

import flatVN from "../../../assets/images/Vn@3x.png";
import defaultAvatar from "../../../assets/images/avatar-default.jpg";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { vi } from "date-fns/locale";
import "./header.scss";
import { path } from "../../../hooks/path";
import proPertiesService from "../../../services/properties.service";
import { roomService } from "../../../services/room.service";
import { BookingService } from "../../../services/booking.service";
import { userService } from "../../../services/users.service";

const cityLabelMap = {
  "da-lat": "Đà Lạt",
  "da-nang": "Đà Nẵng",
  "ha-noi": "Hà Nội",
  "ho-chi-minh": "Hồ Chí Minh",
  "vung-tau": "Vũng Tàu",
};

const citySearchKeywords = {
  "da-lat": ["đà lạt", "da lat", "dalat", "tp da lat", "thanh pho da lat"],
  "da-nang": [
    "đà nẵng",
    "da nang",
    "danang",
    "tp da nang",
    "thanh pho da nang",
  ],
  "ha-noi": [
    "hà nội",
    "ha noi",
    "hanoi",
    "thu do",
    "tp ha noi",
    "thanh pho ha noi",
  ],
  "ho-chi-minh": [
    "hồ chí minh",
    "ho chi minh",
    "hochiminh",
    "sài gòn",
    "sai gon",
    "tp hcm",
    "tphcm",
    "tp ho chi minh",
    "thanh pho ho chi minh",
    "hcm",
  ],
  "vung-tau": [
    "vũng tàu",
    "vung tau",
    "vungtau",
    "tp vung tau",
    "thanh pho vung tau",
  ],
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getTomorrow = () => {
  const tomorrow = getToday();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const formatLocalDateParam = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeSearchText = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/tp\./g, "tp")
    .replace(/\s+/g, " ")
    .trim();

const getAvailableRoomQuantity = (room, bookings) => {
  const bookedRooms = bookings.reduce((total, booking) => {
    const bookingRoomId =
      typeof booking.room_id === "object"
        ? booking.room_id?._id
        : booking.room_id;
    const normalizedBookingRoomId = String(bookingRoomId || "");
    const normalizedRoomId = String(room._id || "");

    if (normalizedBookingRoomId !== normalizedRoomId) {
      return total;
    }

    return total + (Number(booking.rooms_count) || 0);
  }, 0);

  return Math.max(0, (Number(room.quantity) || 0) - bookedRooms);
};

const resolveCitySlug = (value) => {
  const normalized = normalizeSearchText(value);
  const cityMap = {
    "da lat": "da-lat",
    dalat: "da-lat",
    "da nang": "da-nang",
    danang: "da-nang",
    "ha noi": "ha-noi",
    hanoi: "ha-noi",
    "ho chi minh": "ho-chi-minh",
    hochiminh: "ho-chi-minh",
    "tp ho chi minh": "ho-chi-minh",
    "tp hcm": "ho-chi-minh",
    tphcm: "ho-chi-minh",
    hcm: "ho-chi-minh",
    "sai gon": "ho-chi-minh",
    "vung tau": "vung-tau",
    vungtau: "vung-tau",
  };

  return cityMap[normalized] || "";
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());

  const avatarRef = useRef(null);
  const dateRef = useRef(null);
  const guestRef = useRef(null);
  const destinationRef = useRef(null);

  const [avatar, setAvatar] = useState(false);
  const [open, setOpen] = useState(false);
  const [openGuest, setOpenGuest] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [range, setRange] = useState([
    {
      startDate: getToday(),
      endDate: getTomorrow(),
      key: "selection",
    },
  ]);

  const [mode, setMode] = useState("calendar");
  const [destination, setDestination] = useState("");
  const [guest, setGuest] = useState({
    adults: 1,
    rooms: 1,
  });

  const start = range[0].startDate;
  const end = range[0].endDate;

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const [propertyRes, roomRes, bookingRes] = await Promise.all([
          proPertiesService.getAll(),
          roomService.getAll(),
          BookingService.getAll(),
        ]);

        setProperties(propertyRes?.data?.metaData || []);
        setRooms(roomRes?.data?.metaData || []);
        setBookings(
          (bookingRes?.data?.metaData || []).filter(
            (booking) => booking.status === "confirmed",
          ),
        );
      } catch (err) {
        console.log(err);
        setProperties([]);
        setRooms([]);
        setBookings([]);
      }
    };

    loadSearchData();
  }, []);

  const destinationSuggestions = useMemo(() => {
    const keyword = normalizeSearchText(destination);
    if (!keyword) return [];

    const citySuggestions = Object.entries(cityLabelMap)
      .map(([slug, label]) => {
        const searchableValues = [
          label,
          slug,
          slug.replaceAll("-", " "),
          ...(citySearchKeywords[slug] || []),
        ].map((value) => normalizeSearchText(value));

        const isMatched = searchableValues.some((value) =>
          value.includes(keyword),
        );
        if (!isMatched) return null;

        const exactMatch = searchableValues.some((value) => value === keyword);
        const startsWithMatch = searchableValues.some((value) =>
          value.startsWith(keyword),
        );

        return {
          key: `city-${slug}`,
          type: "city",
          title: label,
          subtitle: "Thành phố",
          citySlug: slug,
          score: exactMatch ? 100 : startsWithMatch ? 80 : 60,
        };
      })
      .filter(Boolean);

    const propertySuggestions = properties
      .map((property) => {
        const cityLabel = cityLabelMap[property.city] || property.city;
        const searchableValues = [
          property.title,
          property.address,
          cityLabel,
          property.city,
          property.city?.replaceAll("-", " "),
        ].map((value) => normalizeSearchText(value || ""));

        const isMatched = searchableValues.some((value) =>
          value.includes(keyword),
        );
        if (!isMatched) return null;

        const titleText = normalizeSearchText(property.title || "");
        const addressText = normalizeSearchText(property.address || "");

        return {
          key: `property-${property._id}`,
          type: "property",
          title: property.title,
          subtitle: `${property.address} · ${cityLabel}`,
          citySlug: property.city,
          score: titleText.startsWith(keyword)
            ? 40
            : addressText.startsWith(keyword)
              ? 30
              : 20,
        };
      })
      .filter(Boolean);

    const uniqueSuggestions = [
      ...citySuggestions,
      ...propertySuggestions,
    ].filter(
      (item, index, array) =>
        array.findIndex(
          (candidate) =>
            normalizeSearchText(candidate.title) ===
              normalizeSearchText(item.title) &&
            candidate.citySlug === item.citySlug &&
            candidate.type === item.type,
        ) === index,
    );

    return uniqueSuggestions.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [destination, properties]);

  const handleChange = (type, value) => {
    setGuest((prev) => ({
      ...prev,
      [type]: Math.max(1, prev[type] + value),
    }));
  };

  const applySuggestion = (suggestion) => {
    setDestination(suggestion.title);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const normalizedDestination = destination.trim();
    const directCitySlug = resolveCitySlug(normalizedDestination);
    const matchedSuggestion =
      selectedSuggestion &&
      normalizeSearchText(selectedSuggestion.title) ===
        normalizeSearchText(normalizedDestination)
        ? selectedSuggestion
        : null;
    const citySlug = directCitySlug || matchedSuggestion?.citySlug || "";

    if (!citySlug) {
      alert("Hãy nhập điểm đến hợp lệ để tìm kiếm.");
      return;
    }

    const guestsNeeded = Number(guest.adults) || 1;
    const roomsNeeded = Number(guest.rooms) || 1;

    const startDate = range[0].startDate;
    const endDate = range[0].endDate;
    const today = getToday();

    if (startDate < today) {
      alert("Không thể tìm kiếm với ngày check-in trong quá khứ.");
      return;
    }

    if (endDate <= startDate) {
      alert("Ngày check-out phải lớn hơn ngày check-in.");
      return;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((endDate - startDate) / millisecondsPerDay) || 1;

    const matchedProperties = properties.filter(
      (property) => property.city === citySlug,
    );

    if (matchedProperties.length === 0) {
      alert("Không tìm thấy chỗ nghỉ nào tại khu vực bạn chọn.");
      return;
    }

    const validPropertiesByDate = matchedProperties.filter((property) => {
      const maxStayDays = Number(property.max_stay_days) || 30;
      return nights <= maxStayDays;
    });

    const minMaxStayDays = Math.min(
      ...matchedProperties.map(
        (property) => Number(property.max_stay_days) || 30,
      ),
    );

    if (validPropertiesByDate.length === 0) {
      alert(`Khu vực này chỉ cho phép đặt tối đa ${minMaxStayDays} đêm.`);
      return;
    }

    const validPropertyIds = validPropertiesByDate.map(
      (property) => property._id,
    );

    const matchedRooms = rooms.filter((room) => {
      const propertyId =
        typeof room.property_id === "object"
          ? room.property_id?._id
          : room.property_id;

      const capacity = Number(room.capacity) || 0;
      const quantity = getAvailableRoomQuantity(room, bookings);

      return (
        validPropertyIds.includes(propertyId) &&
        quantity >= roomsNeeded &&
        capacity * roomsNeeded >= guestsNeeded
      );
    });

    if (matchedRooms.length === 0) {
      alert(
        `Không có phòng phù hợp cho ${guestsNeeded} người, ${roomsNeeded} phòng và ${nights} đêm tại khu vực bạn chọn.`,
      );
      return;
    }

    const params = new URLSearchParams({
      q: normalizedDestination,
      checkIn: formatLocalDateParam(startDate),
      checkOut: formatLocalDateParam(endDate),
      guests: String(guestsNeeded),
      rooms: String(roomsNeeded),
    });

    setShowSuggestions(false);
    navigate(`${path.city.replace(":city", citySlug)}?${params.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isInsideDropdown = [
        avatarRef,
        dateRef,
        guestRef,
        destinationRef,
      ].some((dropdownRef) => dropdownRef.current?.contains(e.target));

      if (!isInsideDropdown) {
        setOpen(false);
        setOpenGuest(false);
        setAvatar(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogOut = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      window.location.reload();
    }
  };

  return (
    <>
      <div className="bg-primary pt-2 text-white">
        <div className="header container-custom">
          <div className="header_top">
            <div className="top flex items-center justify-between pb-2 pt-1">
              <Link to={path.homePage}>
                <Icon.logoBrand className="h-[24px] w-[144px]" />
              </Link>

              <div className="flex items-center justify-center gap-2">
                <span className="cursor-pointer px-3 py-2 font-medium hover:rounded-sm hover:bg-white/10">
                  VND
                </span>

                <span className="cursor-pointer px-3 py-2 hover:rounded-sm hover:bg-white/10">
                  <img src={flatVN} alt="" className="h-6 w-6 rounded-full" />
                </span>

                <span className="cursor-pointer px-3 py-2 hover:rounded-sm hover:bg-white/10">
                  <Icon.questionCircle className="w-5 fill-white" />
                </span>

                {user ? (
                  <>
                    <Link
                      to={path.hostDashboardPage}
                      className="px-3 py-2 text-[16px] font-medium hover:rounded-sm hover:bg-white/10"
                    >
                      Quản lý chỗ nghỉ
                    </Link>

                    <div ref={avatarRef} className="relative z-[100] h-10 w-10">
                      <button
                        type="button"
                        onClick={() => setAvatar(!avatar)}
                        className="h-full w-full cursor-pointer rounded-full"
                      >
                        <img
                          src={user.avatar?.url || defaultAvatar}
                          alt=""
                          className="h-full w-full rounded-full"
                        />
                      </button>

                      {avatar && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-1/2 top-full z-[120] mt-3 w-[260px] -translate-x-1/2 overflow-hidden rounded-[22px] border border-[#d9e2f1] bg-white text-[#1a1a1a] shadow-[0_22px_50px_rgba(0,0,0,0.18)]"
                        >
                          <div className="border-b border-[#eef3fb] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatar?.url || defaultAvatar}
                                alt=""
                                className="h-12 w-12 rounded-full border border-[#d9e2f1]"
                              />
                              <div className="min-w-0">
                                <span className="block truncate text-[15px] font-semibold text-[#10357b]">
                                  {user.full_name}
                                </span>
                                <span className="block truncate text-[13px] text-[#6b7a99]">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 p-3">
                            <Link
                              to={path.profile}
                              className="flex w-full items-center justify-between rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#003b95] transition hover:border-[#bfd3f6] hover:bg-[#eef5ff]"
                            >
                              Hồ sơ cá nhân
                            </Link>

                            <button
                              onClick={handleLogOut}
                              className="z-[100] w-full cursor-pointer rounded-xl bg-primary-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary"
                            >
                              Đăng xuất
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link to={path.register}>
                      <ButtonCustom className="bg-white px-3 py-1 font-medium text-[#006ce4] hover:bg-primary-2 hover:opacity-90">
                        Đăng ký
                      </ButtonCustom>
                    </Link>

                    <Link to={path.login}>
                      <ButtonCustom className="bg-white px-3 py-1 font-medium text-[#006ce4] hover:bg-primary-2 hover:opacity-90">
                        Đăng nhập
                      </ButtonCustom>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="bot flex items-center">
              <Link className="flex items-center gap-2 rounded-3xl border bg-white/10 px-4 py-[11px]">
                <Icon.stay className="h-5 w-5 fill-white" />
                <span>Lưu trú</span>
              </Link>

              <Link className="flex items-center gap-2 rounded-3xl px-4 py-[11px] transition duration-300 hover:bg-white/10">
                <Icon.flight className="h-5 w-5 fill-white" />
                <span>Chuyến bay</span>
              </Link>

              <Link className="flex items-center gap-2 rounded-3xl px-4 py-[11px] hover:bg-white/10">
                <Icon.earth className="h-5 w-5 fill-white" />
                <span>Chuyến bay + Khách sạn</span>
              </Link>

              <Link className="flex items-center gap-2 rounded-3xl px-4 py-[11px] hover:bg-white/10">
                <Icon.activities className="h-5 w-5 fill-white" />
                <span>Hoạt động</span>
              </Link>

              <Link className="flex items-center gap-2 rounded-3xl px-4 py-[11px] hover:bg-white/10">
                <Icon.taxi className="h-5 w-5 fill-white" />
                <span>Taxi sân bay</span>
              </Link>
            </div>
          </div>

          <div className="header_bottom relative z-30 overflow-visible pb-[98px] pt-[64px]">
            <h1 className="text-48 inline">Tìm chỗ nghỉ tiếp theo</h1>
            <h2 className="mt-1 pb-3 text-24">
              Tìm ưu đãi, chỗ nghỉ dạng nhà và nhiều hơn nữa
            </h2>

            <div
              id="search-form"
              className="absolute bottom-0 left-0 z-40 mt-10 w-[1060px] translate-y-1/2 rounded-md bg-[#febb02] p-[5px] shadow-[0_16px_45px_rgba(0,59,149,0.24)]"
            >
              <div className="flex h-auto flex-col overflow-visible rounded-md bg-white lg:h-[54px] lg:flex-row">
                <div className="border-r-[4px] border-[#febb02]">
                  <div
                    ref={destinationRef}
                    className="relative h-[54px] w-full bg-white p-2 lg:w-[350px] lg:rounded-l-[12px] lg:rounded-tr-none"
                  >
                    <div className="flex h-full w-full items-center gap-2">
                      <span>
                        <Icon.stay className="w-[24px]" />
                      </span>

                      <input
                        type="text"
                        value={destination}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setSelectedSuggestion(null);
                          setShowSuggestions(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        placeholder="Bạn muốn đến đâu?"
                        className="w-full text-[#595959] outline-none"
                      />
                    </div>

                    {showSuggestions &&
                      destination.trim() &&
                      destinationSuggestions.length > 0 && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-[18px] border border-[#dbe7ff] bg-white shadow-[0_16px_40px_rgba(0,59,149,0.16)]">
                          {destinationSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.key}
                              type="button"
                              onClick={() => applySuggestion(suggestion)}
                              className="flex w-full items-start gap-3 border-b border-[#eef3fb] px-4 py-3 text-left transition hover:bg-[#f7fbff] last:border-b-0"
                            >
                              <span className="mt-0.5 rounded-full bg-[#eef4ff] p-2">
                                <Icon.stay className="w-4" />
                              </span>
                              <span className="block min-w-0">
                                <span className="block truncate text-[14px] font-semibold text-[#10357b]">
                                  {suggestion.title}
                                </span>
                                <span className="block truncate text-[12px] text-[#6b7a99]">
                                  {suggestion.subtitle}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                <div className="border-r-[4px] border-[#febb02]">
                  <div
                    ref={dateRef}
                    className="relative flex h-[54px] w-full items-center bg-white p-2 lg:w-[297px]"
                  >
                    <button
                      onClick={() => {
                        setOpen((prev) => !prev);
                        setOpenGuest(false);
                        setShowSuggestions(false);
                      }}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Icon.calender className="w-6" />
                      <span className="font-semibold text-[#1a1a1a]">
                        {format(start, "EEE, dd/MM", { locale: vi })}
                        <span className="px-1">—</span>
                        {format(end, "EEE, dd/MM", { locale: vi })}
                      </span>
                    </button>

                    {open && (
                      <div className="absolute left-0 top-full z-50">
                        <div className="mt-2 min-h-auto w-[700px] overflow-hidden rounded-[24px] bg-white text-primary-2 shadow-[0px_18px_40px_0px_rgba(26,26,26,0.18)]">
                          <div className="h-full w-full">
                            <button
                              onClick={() => setMode("calendar")}
                              className={`relative w-full p-4 text-[16px] ${
                                mode === "calendar"
                                  ? "text-blue-400"
                                  : "cursor-pointer text-red-500"
                              }`}
                            >
                              <span
                                className={`absolute bottom-0 left-0 h-[2px] w-full origin-right bg-blue-500 transition-transform duration-300 ease-in ${
                                  mode === "calendar"
                                    ? "scale-x-100"
                                    : "scale-x-0"
                                }`}
                              />
                            </button>

                            <div className="p-4">
                              {mode === "calendar" && (
                                <DateRange
                                  ranges={range}
                                  onChange={(item) =>
                                    setRange([item.selection])
                                  }
                                  minDate={getToday()}
                                  months={2}
                                  direction="horizontal"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-r-[4px] border-[#febb02]">
                  <div
                    ref={guestRef}
                    className="relative h-[54px] w-full bg-white p-3 lg:w-[310px]"
                  >
                    <div
                      onClick={() => {
                        setOpenGuest((prev) => !prev);
                        setOpen(false);
                        setShowSuggestions(false);
                      }}
                      className="flex h-full w-full cursor-pointer items-center justify-around gap-2"
                    >
                      <span>
                        <Icon.customer className="w-6" />
                      </span>

                      <span className="overflow-hidden font-semibold text-[#1a1a1a]">
                        {`${guest.adults} người · ${guest.rooms} phòng`}
                      </span>

                      <span className="pl-3">
                        <Icon.arrowDown className="w-4" />
                      </span>
                    </div>

                    {openGuest && (
                      <div className="absolute right-0 top-full z-50">
                        <div className="mt-2 h-auto w-[350px] rounded-[20px] bg-white shadow-[0px_18px_40px_0px_rgba(26,26,26,0.18)]">
                          <div className="flex h-full w-full flex-col items-center justify-between gap-3 p-8 font-semibold text-[#1a1a1a]">
                            <div className="flex h-full w-full items-center justify-between">
                              <span className="font-semibold text-[#1a1a1a]">
                                Người
                              </span>

                              <div className="flex items-center justify-around rounded-md border border-[#868686]">
                                <button
                                  onClick={() => handleChange("adults", -1)}
                                  className="flex h-[40px] w-[40px] cursor-pointer justify-center overflow-hidden hover:bg-[#006ce4]/10"
                                >
                                  {guest.adults > 1 ? (
                                    <Icon.minus className="w-4 fill-[#006ce4]" />
                                  ) : (
                                    <Icon.minus className="w-4 fill-[#565656]" />
                                  )}
                                </button>

                                <span className="m-1 min-w-[36px] text-center text-[#1a1a1a]">
                                  {guest.adults}
                                </span>

                                <button
                                  onClick={() => handleChange("adults", 1)}
                                  className="flex h-[40px] w-[40px] cursor-pointer justify-center hover:bg-[#006ce4]/10"
                                >
                                  <Icon.plus className="w-4 cursor-pointer fill-[#006ce4]" />
                                </button>
                              </div>
                            </div>

                            <div className="flex h-full w-full items-center justify-between">
                              <span className="font-semibold text-[#1a1a1a]">
                                Phòng
                              </span>

                              <div className="flex items-center justify-around rounded-md border border-[#868686]">
                                <button
                                  onClick={() => handleChange("rooms", -1)}
                                  className="flex h-[40px] w-[40px] cursor-pointer justify-center overflow-hidden hover:bg-[#006ce4]/10"
                                >
                                  {guest.rooms > 1 ? (
                                    <Icon.minus className="w-4 fill-[#006ce4]" />
                                  ) : (
                                    <Icon.minus className="w-4 fill-[#565656]" />
                                  )}
                                </button>

                                <span className="m-1 min-w-[36px] text-center text-[#1a1a1a]">
                                  {guest.rooms}
                                </span>

                                <button
                                  onClick={() => handleChange("rooms", 1)}
                                  className="flex h-[40px] w-[40px] cursor-pointer justify-center hover:bg-[#006ce4]/10"
                                >
                                  <Icon.plus className="w-4 cursor-pointer fill-[#006ce4]" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 w-full border border-[#868686]/10" />

                            <button
                              onClick={() => setOpenGuest(false)}
                              className="h-[36px] w-full cursor-pointer rounded-md border border-[#006ce4] bg-white px-3 py-1 text-[#006ce4] hover:bg-[#006ce4]/10"
                            >
                              Xong
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  onClick={handleSearch}
                  className="h-[54px] w-full cursor-pointer bg-primary-2 transition duration-200 hover:bg-[#003b95] lg:w-[100px] lg:rounded-r-md"
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <ButtonCustom className="text-[20px] font-medium leading-7">
                      Tìm
                    </ButtonCustom>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
