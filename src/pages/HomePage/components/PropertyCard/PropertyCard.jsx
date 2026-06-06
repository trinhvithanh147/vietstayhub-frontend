import React, { useEffect, useRef, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { useLocation, useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import {
  FaSwimmingPool,
  FaWifi,
  FaParking,
  FaCocktail,
  FaMugHot,
  FaStar,
} from "react-icons/fa";
import {
  MdAirportShuttle,
  MdSmokeFree,
  MdRoomService,
  MdRestaurant,
  MdFamilyRestroom,
} from "react-icons/md";
import { DateRange } from "react-date-range";
import { vi } from "date-fns/locale";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import flatVN from "../../../../assets/images/Vn@3x.png";
import defaultAvatar from "../../../../assets/images/avatar-default.jpg";
import Icon from "../../../../assets/Icon/Icon";
import ButtonCustom from "../../../../components/ButtonCustom/ButtonCustom";
import proPertiesService from "../../../../services/properties.service";
import { path } from "../../../../hooks/path";
import { reviewService } from "../../../../services/review.service";
import { roomService } from "../../../../services/room.service";
import { BookingService } from "../../../../services/booking.service";
import { userService } from "../../../../services/users.service";
import Footer from "../../../../templates/HomeTemplate/Footer/Footer";

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const normalizeDateOnly = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatLocalDateParam = (value) => {
  const date = normalizeDateOnly(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const PropertyCard = () => {
  // State goc cua trang chi tiet: property, review, room.
  const [properties, setProperties] = useState({});
  const [review, setReview] = useState([]);
  const [room, setRoom] = useState([]);
  const [bookings, setBookings] = useState([]);

  const { slug, city } = useParams();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, city]);
  // Lay thong tin property theo slug va city.
  useEffect(() => {
    proPertiesService
      .getSlug(slug, city)
      .then((res) => {
        setProperties(res.data.metaData);
        console.log({ res: res.data.metaData });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [slug, city]);

  // Lay danh sach review de tinh diem trung binh va so danh gia.
  useEffect(() => {
    reviewService
      .getAll()
      .then((res) => {
        setReview(res.data.metaData);
        console.log({ review: res.data.metaData });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const propertyReview = review.filter(
    (item) =>
      item.is_visible !== false &&
      (item.property_id === properties?._id ||
        item.property_id?._id === properties?._id),
  );

  const totalRating = propertyReview.reduce(
    (sum, item) => sum + item.rating,
    0,
  );

  const averageRating = propertyReview.length
    ? (totalRating / propertyReview.length).toFixed(1)
    : 0;

  const totalComment = propertyReview.filter((item) => item.comment).length;

  // Map key amenities sang text va icon de render giao dien.
  const amenitiesLabel = {
    outdoor_pool: "Hồ bơi ngoài trời",
    free_wifi: "WiFi miễn phí",
    airport_shuttle: "Xe đưa đón sân bay",
    non_smoking_room: "Phòng không hút thuốc",
    room_service: "Dịch vụ phòng",
    restaurant: "Nhà hàng",
    free_parking: "Chỗ đỗ xe miễn phí",
    family_room: "Phòng gia đình",
    bar: "Quầy bar",
    breakfast: "Bữa sáng rất tốt",
  };

  const amenitiesIcon = {
    outdoor_pool: <FaSwimmingPool />,
    free_wifi: <FaWifi />,
    airport_shuttle: <MdAirportShuttle />,
    non_smoking_room: <MdSmokeFree />,
    room_service: <MdRoomService />,
    restaurant: <MdRestaurant />,
    free_parking: <FaParking />,
    family_room: <MdFamilyRestroom />,
    bar: <FaCocktail />,
    breakfast: <FaMugHot />,
  };

  const roomBadgeLabel = {
    balcony: "Ban công",
    air_conditioning: "Điều hòa",
    private_bathroom: "Phòng tắm riêng",
    terrace: "Sân hiên",
    free_wifi: "WiFi miễn phí",
    garden_view: "Nhìn ra vườn",
    courtyard_view: "Hướng sân trong",
  };

  const roomAmenityLabel = {
    toiletries: "Đồ dùng vệ sinh",
    shower: "Vòi sen",
    toilet: "Nhà vệ sinh",
    towels: "Khăn tắm",
    socket_near_bed: "Ổ điện gần giường",
    sitting_area: "Khu vực tiếp khách",
    private_entrance: "Lối vào riêng",
    slippers: "Dép",
    hair_dryer: "Máy sấy tóc",
    fan: "Quạt",
    electric_kettle: "Ấm đun nước",
    wardrobe: "Tủ quần áo",
    clothes_rack: "Giá treo đồ",
    toilet_paper: "Giấy vệ sinh",
  };

  const newProperties = {
    ...properties,
    rating: averageRating,
    review_count: totalComment,
  };

  const propertyOwner =
    properties?.user_id && typeof properties.user_id === "object"
      ? properties.user_id
      : null;

  const propertyOwnerName =
    propertyOwner?.full_name || propertyOwner?.email || "Chưa cập nhật";

  const propertyOwnerAvatar =
    propertyOwner?.avatar?.url || propertyOwner?.avatar || defaultAvatar;

  // Khi da co property id thi lay danh sach room cua property do.
  useEffect(() => {
    if (!properties?._id) return;

    Promise.all([
      roomService.getPropertyId(properties._id),
      BookingService.getAll(),
    ])
      .then(([roomRes, bookingRes]) => {
        setRoom(roomRes.data.metaData);
        setBookings(
          (bookingRes?.data?.metaData || []).filter(
            (booking) => booking.status === "confirmed",
          ),
        );
        console.log({ room: roomRes.data.metaData });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [properties?._id]);

  console.log({ properties });

  const [user, setUser] = useState(() => getStoredUser());
  console.log(user);

  const avatarRef = useRef(null);
  const dateRef = useRef(null);
  const guestRef = useRef(null);

  const [avatar, setAvatar] = useState(false);
  const [open, setOpen] = useState(false);
  const [openGuest, setOpenGuest] = useState(false);
  const [expandedRoomDetails, setExpandedRoomDetails] = useState({});

  const getInitialSearchState = () => {
    const params = new URLSearchParams(location.search);
    const checkInParam = params.get("checkIn");
    const checkOutParam = params.get("checkOut");
    const guestsParam = Number(params.get("guests")) || 1;
    const roomsParam = Number(params.get("rooms")) || 1;

    const startDate = checkInParam
      ? normalizeDateOnly(checkInParam)
      : getToday();

    const parsedEndDate = checkOutParam
      ? normalizeDateOnly(checkOutParam)
      : getToday();

    const endDate =
      parsedEndDate > startDate
        ? parsedEndDate
        : normalizeDateOnly(new Date(startDate.getTime() + 86400000));

    return {
      range: [
        {
          startDate,
          endDate,
          key: "selection",
        },
      ],
      guest: {
        guests: Math.max(1, guestsParam),
        rooms: Math.max(1, roomsParam),
      },
    };
  };

  const initialSearchState = getInitialSearchState();

  // State tam cho bo loc ngay di/ngay ve tren search box.
  const [range, setRange] = useState([
    {
      startDate: initialSearchState.range[0].startDate,
      endDate: initialSearchState.range[0].endDate,
      key: "selection",
    },
  ]);

  const start = range[0].startDate;
  console.log({ start });
  const end = range[0].endDate;
  console.log(format(start, "EEE ", { locale: vi }));

  const [mode, setMode] = useState("calendar");

  // State tam cho search box: so khach va so phong nguoi dung dang chon.
  const [guest, setGuest] = useState({
    guests: initialSearchState.guest.guests,
    rooms: initialSearchState.guest.rooms,
  });
  const [appliedSearchParams, setAppliedSearchParams] = useState({
    guest: initialSearchState.guest.guests,
    room: initialSearchState.guest.rooms,
    startDate: normalizeDateOnly(initialSearchState.range[0].startDate),
    endDate: normalizeDateOnly(initialSearchState.range[0].endDate),
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [editingReviewId, setEditingReviewId] = useState("");

  const handleChange = (type, value) => {
    setGuest((props) => ({
      ...props,
      [type]: Math.max(1, props[type] + value),
    }));
  };

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
    const handleClickOutside = (e) => {
      const isInsideDropdown = [avatarRef, dateRef, guestRef].some(
        (dropdownRef) => dropdownRef.current?.contains(e.target),
      );

      if (!isInsideDropdown) {
        setOpen(false);
        setOpenGuest(false);
        setAvatar(false);
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

  const toggleRoomDetails = (roomId) => {
    setExpandedRoomDetails((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      alert("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    if (!properties?._id) {
      alert("Không tìm thấy thông tin chỗ nghỉ để đánh giá.");
      return;
    }

    try {
      const payload = {
        user_id: user._id,
        property_id: properties._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      };

      const res = editingReviewId
        ? await reviewService.update(editingReviewId, {
            rating: payload.rating,
            comment: payload.comment,
          })
        : await reviewService.create(payload);
      const listRes = await reviewService.getAll();
      setReview(listRes.data.metaData || []);
      setReviewForm({
        rating: 5,
        comment: "",
      });
      setEditingReviewId("");

      alert(
        res.data.message ||
          (editingReviewId
            ? "Cập nhật đánh giá thành công"
            : "Gửi đánh giá thành công"),
      );
    } catch (err) {
      console.log(err);
      alert(
        err?.response?.data?.message ||
          (editingReviewId
            ? "Cập nhật đánh giá thất bại"
            : "Gửi đánh giá thất bại"),
      );
    }
  };

  const myPropertyReviews = propertyReview.filter((item) => {
    const reviewUserId =
      typeof item.user_id === "object" ? item.user_id?._id : item.user_id;
    return reviewUserId === user?._id;
  });

  const handleEditReview = (item) => {
    setEditingReviewId(item._id);
    setReviewForm({
      rating: Number(item.rating) || 5,
      comment: item.comment || "",
    });
    window.scrollTo({
      top: document.body.scrollHeight - 400,
      behavior: "smooth",
    });
  };

  const handleCancelEditReview = () => {
    setEditingReviewId("");
    setReviewForm({
      rating: 5,
      comment: "",
    });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;

    try {
      const res = await reviewService.delete(reviewId);
      const listRes = await reviewService.getAll();
      setReview(listRes.data.metaData || []);

      if (editingReviewId === reviewId) {
        handleCancelEditReview();
      }

      alert(res?.data?.message || "Xóa đánh giá thành công");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Xóa đánh giá thất bại");
    }
  };

  const draftSearchParams = {
    guest: guest.guests,
    room: guest.rooms,
    startDate: normalizeDateOnly(range[0].startDate),
    endDate: normalizeDateOnly(range[0].endDate),
  };

  const handleSearch = () => {
    if (draftSearchParams.endDate <= draftSearchParams.startDate) {
      alert("Ngày check-out phải lớn hơn ngày check-in.");
      return;
    }

    setAppliedSearchParams(draftSearchParams);
  };

  // Tinh so dem theo lua chon hien tai tren giao dien.
  const bookingDateLogic = Math.max(
    1,
    differenceInCalendarDays(
      appliedSearchParams.endDate,
      appliedSearchParams.startDate,
    ),
  );

  // Tinh gia hien thi cho tung room theo so dem va so phong dang chon.
  const roomWithTotalPrice = room.map((item) => {
    const roomsCount = appliedSearchParams.room;
    const currentPrice = Number(item.price) || 0;
    const originalPrice = Number(item.original_price) || 0;
    const availableQuantity = getAvailableRoomQuantity(item, bookings);

    return {
      ...item,
      available_quantity: availableQuantity,
      can_book_selected_quantity: availableQuantity >= roomsCount,
      can_fit_selected_guests:
        item.capacity * roomsCount >= appliedSearchParams.guest,
      can_stay_selected_nights:
        bookingDateLogic <= (properties.max_stay_days || 30),
      total_price: currentPrice * bookingDateLogic * roomsCount,
      total_original_price: originalPrice * bookingDateLogic * roomsCount,
    };
  });

  console.log(roomWithTotalPrice);

  // Tao booking khi nguoi dung bam nut dat phong.
  const handleCreateBooking = async (item) => {
    if (!user?._id) {
      alert("Bạn cần đăng nhập để đặt phòng.");
      return;
    }

    const normalizedStartDate = appliedSearchParams.startDate;
    const normalizedEndDate = appliedSearchParams.endDate;

    if (normalizedStartDate < getToday()) {
      alert("Không thể đặt ngày check-in trong quá khứ.");
      return;
    }

    if (normalizedEndDate <= normalizedStartDate) {
      alert("Ngày check-out phải lớn hơn ngày check-in.");
      return;
    }

    const roomsCount = appliedSearchParams.room;

    const currentPrice = Number(item.price) || 0;

    const bookingData = {
      user_id: user._id,
      property_id: properties._id,
      room_id: item._id,
      check_in: formatLocalDateParam(normalizedStartDate),
      check_out: formatLocalDateParam(normalizedEndDate),
      guests: appliedSearchParams.guest,
      rooms_count: roomsCount,
      nights: bookingDateLogic,
      price_per_night: currentPrice,
      total_price: currentPrice * bookingDateLogic * roomsCount,
      status: "pending_payment",
      payment_status: "unpaid",
      payment_method: "payos",
    };

    try {
      const bookingRes = await BookingService.create(bookingData);
      const bookingId = bookingRes.data.metaData._id;

      const paymentRes = await BookingService.createPayOSPayment(bookingId);
      const checkoutUrl = paymentRes.data.metaData.checkoutUrl;

      window.location.href = checkoutUrl;
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Đặt phòng thất bại");
    }
  };

  // Danh sach room nen hien theo ton phong thuc te trong khoang ngay da chon,
  // khong bi an di chi vi nguoi dung dang search nhieu phong/nhieu khach.
  const filteredRooms = roomWithTotalPrice.filter(
    (item) => item.can_stay_selected_nights,
  );

  const hasAnyAvailableRoom = filteredRooms.some(
    (item) => item.available_quantity > 0,
  );

  console.log({ filteredRooms });

  return (
    <>
      <div className="bg-primary pt-2 text-white">
        <div className="header container-custom pb-2">
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

                    <div ref={avatarRef} className="relative h-10 w-10">
                      <button
                        type="button"
                        onClick={() => setAvatar(!avatar)}
                        className="h-full w-full cursor-pointer rounded-full"
                      >
                        <img
                          src={user.avatar?.url || defaultAvatar}
                          alt=""
                          className="h-full w-full rounded-full "
                        />
                      </button>

                      {avatar && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-1/2 top-full z-30 mt-3 w-[260px] -translate-x-1/2 overflow-hidden rounded-[22px] border border-[#d9e2f1] bg-white text-[#1a1a1a] shadow-[0_22px_50px_rgba(0,0,0,0.18)]"
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
                              className="block w-full cursor-pointer rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#003b95] transition hover:border-[#bfd3f6] hover:bg-[#eef5ff]"
                            >
                              <div className="flex items-center justify-between">
                                <span>Hồ sơ cá nhân</span>
                              </div>
                            </Link>

                            <button
                              onClick={handleLogOut}
                              className="w-full cursor-pointer rounded-xl bg-primary-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary"
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
          </div>
        </div>
      </div>

      <div className="bg-[#f5f8ff] py-6">
        <div className="container-custom text-[#1a1a1a]">
          <div className="rounded-[32px] bg-white p-6 shadow-[0_16px_45px_rgba(0,59,149,0.08)]">
            <div className="border-b border-[#e4ecfb] pb-5">
              <span className="block text-[34px] font-bold leading-tight text-primary">
                {newProperties?.title}
              </span>

              <div className="mt-3 flex items-center gap-2 text-[15px] text-[#5f7291]">
                <span>
                  <Icon.localtion className={"w-[20px] fill-blue-600"} />
                </span>
                <span>
                  {newProperties?.address}, {newProperties?.country}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <div className="h-[470px] w-[828px]">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8">
                    <img
                      src={newProperties?.main_image_url}
                      alt=""
                      className="h-[359px] w-full rounded-md"
                    />
                  </div>

                  <div className="col-span-4 grid grid-rows-2 gap-3">
                    {newProperties?.gallery_images?.slice(0, 2).map((item) => {
                      return (
                        <img
                          key={item.url}
                          src={item.url}
                          alt=""
                          className="h-[173px] w-full rounded-md"
                        />
                      );
                    })}
                  </div>

                  <div className="col-span-12 grid grid-cols-5 gap-3">
                    {newProperties?.gallery_images?.slice(2, 7).map((item) => {
                      return (
                        <img
                          key={item.url}
                          src={item.url}
                          alt=""
                          className="h-[103px] w-[159px] rounded-md"
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex w-[265px] flex-col gap-3">
                <div className="rounded-[24px] border border-[#dce7f6] bg-white p-4 shadow-[0_10px_30px_rgba(0,59,149,0.08)]">
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6b7a99]">
                    Chủ sở hữu khách sạn
                  </span>

                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={propertyOwnerAvatar}
                      alt={propertyOwnerName}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultAvatar;
                      }}
                      className="h-14 w-14 rounded-full border border-[#dbe7ff] "
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-[16px] font-semibold text-[#10357b]">
                        {propertyOwnerName}
                      </span>
                      <span className="mt-1 block text-[13px] text-[#6b7a99]">
                        Đơn vị quản lý chỗ nghỉ này
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex h-[230px] flex-col overflow-hidden rounded-[24px] border border-[#dce7f6] bg-[#f8fbff]">
                  <div className="flex justify-end gap-2 border-b border-[#dce7f6] p-3">
                    <div className="flex flex-col">
                      <span>
                        {newProperties.rating >= 8
                          ? "Tuyệt vời"
                          : newProperties.rating >= 6
                            ? "Tốt"
                            : "Dễ chịu"}
                      </span>
                      <span className="text-12 text-[#595959]">
                        {newProperties.review_count} đánh giá
                      </span>
                    </div>

                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-semibold text-white">
                      {newProperties.rating}
                    </span>
                  </div>

                  <div className="px-3 py-2">
                    <span>Khách lưu trú ở đây thích điều gì?</span>
                  </div>

                  <div className="min-h-0 flex-1">
                    <Swiper
                      className="review-swiper h-full w-full"
                      slidesPerView={1}
                      modules={[Pagination]}
                      pagination={{ clickable: true }}
                      loop={true}
                    >
                      {propertyReview.map((item) => {
                        return (
                          <SwiperSlide key={item._id} className="h-full">
                            <div className="flex h-full w-full flex-col justify-between px-5 pb-3">
                              <span className="line-clamp-4">
                                "{item.comment}"
                              </span>

                              <div className="mt-3 flex items-center gap-3">
                                <img
                                  src={
                                    item.user_id?.avatar?.url || defaultAvatar
                                  }
                                  alt=""
                                  className="h-[42px] w-[42px] rounded-full"
                                />
                                <span>{item.user_id?.full_name}</span>
                              </div>
                            </div>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_10px_35px_rgba(0,59,149,0.06)]">
              <span className="block text-24 text-primary">Mô tả chỗ nghỉ</span>
              <span className="mt-3 block text-[16px] leading-8 text-[#4f617e]">
                {newProperties.description}
              </span>
            </div>

            <div className="rounded-[28px] border border-[#dbe7ff] bg-[#f8fbff] p-6 shadow-[0_10px_35px_rgba(0,59,149,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[22px] font-semibold text-primary">
                  Cảm nhận nổi bật
                </span>
                <span className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-2xl bg-primary px-3 font-semibold text-white">
                  {averageRating}
                </span>
              </div>

              <span className="mt-2 block text-[14px] leading-6 text-[#5f7291]">
                {propertyReview.length} đánh giá đã được ghi nhận cho chỗ nghỉ
                này.
              </span>

              <div className="mt-5 space-y-3">
                {propertyReview.slice(0, 2).map((item) => (
                  <div
                    key={item._id}
                    className="rounded-[20px] border border-[#deebff] bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.user_id?.avatar?.url || defaultAvatar}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <span className="block text-[14px] font-semibold text-[#10357b]">
                          {item.user_id?.full_name}
                        </span>
                        <span className="block text-[13px] text-[#6b7a99]">
                          {item.rating} sao
                        </span>
                      </div>
                    </div>

                    <span className="mt-3 block line-clamp-3 text-[14px] leading-6 text-[#536481]">
                      {item.comment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_10px_35px_rgba(0,59,149,0.06)]">
            <span className="block text-24 text-primary">
              Tiện nghi nổi bật
            </span>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Object.entries(newProperties.amenities || {})
                .filter(([, value]) => value)
                .map(([key]) => {
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-2xl bg-[#f7fbff] px-4 py-3"
                    >
                      <span className="w-5 text-[#008234]">
                        {amenitiesIcon[key]}
                      </span>
                      <span className="text-[15px] text-[#38506f]">
                        {amenitiesLabel[key]}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_10px_35px_rgba(0,59,149,0.06)]">
            <span className="mb-3 block text-24 text-primary">Phòng trống</span>

            <div className="w-[800px] rounded-md bg-[#febb02] p-1 shadow-[0_14px_40px_rgba(0,59,149,0.14)]">
              <div className="flex h-[54px] items-center rounded-[14px] bg-white">
                <div className="bg-[#febb02] pr-1">
                  <div
                    ref={dateRef}
                    className="relative flex h-[54px] w-[300px] items-center justify-center rounded-l-none bg-white p-2"
                  >
                    <button
                      onClick={() => {
                        setOpen((prev) => !prev);
                        setOpenGuest(false);
                      }}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Icon.calender className="w-6" />
                      <span className="font-semibold text-[#1a1a1a]">
                        {format(start, "EEE, dd/MM", { locale: vi })}
                        <span className="px-1">-</span>
                        {format(end, "EEE, dd/MM", { locale: vi })}
                      </span>
                    </button>

                    {open && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-full shadow-[0px_18px_40px_0px_rgba(26,26,26,0.18)]">
                        <div className="mt-2 min-h-auto w-[700px] rounded-md bg-white text-primary-2 shadow-[0px_2px_16px_0px_#1a1a1a3d]">
                          <div className="h-full w-full">
                            <button
                              onClick={() => setMode("calendar")}
                              className={`relative w-full p-4 text-[16px] ${mode == "calendar" ? "text-blue-400" : "cursor-pointer text-red-500"}`}
                            >
                              <span
                                className={`
                                  absolute bottom-0 left-0 h-[2px] w-full bg-blue-500
                                  origin-right transition-transform duration-300 ease-in
                                  ${mode === "calendar" ? "scale-x-100" : "scale-x-0"}
                                `}
                              />
                            </button>

                            <div className="p-4">
                              {mode == "calendar" && (
                                <DateRange
                                  className="bg-white"
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

                <div className="bg-[#febb02] pr-1">
                  <div
                    ref={guestRef}
                    className="relative h-[54px] w-[310px] bg-white p-3"
                  >
                    <div
                      onClick={() => {
                        setOpenGuest((prev) => !prev);
                        setOpen(false);
                      }}
                      className="flex h-full w-full cursor-pointer items-center justify-around gap-2"
                    >
                      <span>
                        <Icon.customer className="w-6" />
                      </span>
                      <span className="overflow-hidden font-semibold text-[#1a1a1a]">
                        {`${guest.guests} người · ${guest.rooms} phòng`}
                      </span>
                      <span className="pl-3">
                        <Icon.arrowDown className="w-4" />
                      </span>
                    </div>

                    {openGuest && (
                      <div className="absolute right-0 top-full z-50">
                        <div className="mt-2 h-auto w-[350px] rounded-md bg-white shadow-[0px_18px_40px_0px_rgba(26,26,26,0.18)]">
                          <div className="flex h-full w-full flex-col items-center justify-between gap-3 p-8 font-semibold text-[#1a1a1a]">
                            <div className="flex h-full w-full items-center justify-between">
                              <span className="font-semibold text-[#1a1a1a]">
                                Khách
                              </span>
                              <div className="flex items-center justify-around rounded-md border border-[#868686]">
                                <button
                                  onClick={() => handleChange("guests", -1)}
                                  className="flex h-[40px] w-[40px] cursor-pointer justify-center overflow-hidden hover:bg-[#006ce4]/10"
                                >
                                  {guest.guests >= 1 ? (
                                    <Icon.minus className="w-4 fill-[#006ce4]" />
                                  ) : (
                                    <Icon.minus className="w-4 fill-[#565656]" />
                                  )}
                                </button>

                                <span className="m-1 min-w-[36px] text-center text-[#1a1a1a]">
                                  {guest.guests}
                                </span>

                                <button
                                  onClick={() => {
                                    handleChange("guests", +1);
                                  }}
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
                                  {guest.rooms >= 1 ? (
                                    <Icon.minus className="w-4 fill-[#006ce4]" />
                                  ) : (
                                    <Icon.minus className="w-4 fill-[#565656]" />
                                  )}
                                </button>

                                <span className="m-1 min-w-[36px] text-center text-[#1a1a1a]">
                                  {guest.rooms}
                                </span>

                                <button
                                  onClick={() => {
                                    handleChange("rooms", +1);
                                  }}
                                  className="flex h-[40px] w-[40px] cursor-pointer justify-center hover:bg-[#006ce4]/10"
                                >
                                  <Icon.plus className="w-4 cursor-pointer fill-[#006ce4]" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 w-full border border-[#868686]/10"></div>

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

                <div className="h-full w-full cursor-pointer rounded-r-md bg-primary-2 transition duration-200 hover:bg-[#003b95]">
                  <div className="flex h-full w-full items-center justify-center">
                    <button
                      onClick={handleSearch}
                      className="font-medium leading-7 text-white cursor-pointer"
                    >
                      Thay đổi tìm kiếm
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 h-full w-full">
              <div className="mt-12 grid grid-cols-4 border border-[#cddff6] bg-primary font-semibold text-white">
                <div className="z-10 border-r border-[#cddff6] p-3">
                  Loại chỗ nghỉ
                </div>
                <div className="border-r border-[#cddff6] p-3">
                  Số lượng khách
                </div>
                <div className="border-r border-[#cddff6] bg-primary p-3">
                  Giá cho {bookingDateLogic} đêm
                </div>
                <div className="border-r border-[#cddff6] p-3">Đặt phòng</div>
              </div>

              {filteredRooms.length === 0 && (
                <div className="border-x border-b border-[#cddff6] p-4 text-[#595959]">
                  Chỗ nghỉ này hiện không có loại phòng nào phù hợp với số đêm
                  bạn đã chọn.
                </div>
              )}

              {filteredRooms.length > 0 && !hasAnyAvailableRoom && (
                <div className="border-x border-b border-[#cddff6] bg-[#fff8f7] p-5 text-[#b42318]">
                  Hiện tại khách sạn không còn phòng trống trong khoảng ngày bạn
                  chọn. Vui lòng thay đổi ngày hoặc chọn chỗ nghỉ khác.
                </div>
              )}

              {hasAnyAvailableRoom &&
                filteredRooms.map((item) => (
                  <div
                    key={item._id}
                    className={`grid grid-cols-4 border-x border-b border-[#cddff6] ${
                      item.available_quantity > 0
                        ? "bg-white"
                        : "bg-[#f7f8fa] text-[#8a94a6]"
                    }`}
                  >
                    <div className="border-r border-r-[#cddff6] p-3">
                      {(() => {
                        const isExpanded = Boolean(
                          expandedRoomDetails[item._id],
                        );
                        const roomBadges = Object.entries(
                          item.badges || {},
                        ).filter(([, value]) => value);
                        const roomAmenities = Object.entries(
                          item.amenities || {},
                        ).filter(([, value]) => value);
                        const visibleRoomBadges = isExpanded
                          ? roomBadges
                          : roomBadges.slice(0, 3);
                        const visibleRoomAmenities = isExpanded
                          ? roomAmenities
                          : roomAmenities.slice(0, 4);
                        const shouldShowToggle =
                          roomBadges.length > 3 || roomAmenities.length > 4;

                        return (
                          <>
                            <span
                              className={`block font-semibold ${
                                item.available_quantity > 0
                                  ? "text-[#006ce4]"
                                  : "text-[#7a8599]"
                              }`}
                            >
                              {item.name}
                            </span>
                            <span
                              className={`block ${
                                item.available_quantity > 0
                                  ? "text-red-500"
                                  : "font-medium text-[#b42318]"
                              }`}
                            >
                              {item.available_quantity > 0
                                ? `Còn ${item.available_quantity} phòng`
                                : "Phòng hiện tại đã hết"}
                            </span>
                            <span className="mt-2 block">{item.bed_info}</span>
                            <span className="block">{item.area} m²</span>
                            <span className="block">{item.view}</span>
                            {roomBadges.length > 0 && (
                              <div className="mt-3">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7a99]">
                                  Điểm nổi bật
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {visibleRoomBadges.map(([key]) => (
                                    <span
                                      key={key}
                                      className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-medium text-[#0b4ecb]"
                                    >
                                      {roomBadgeLabel[key] || key}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {roomAmenities.length > 0 && (
                              <div className="mt-3">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7a99]">
                                  Tiện nghi
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {visibleRoomAmenities.map(([key]) => (
                                    <span
                                      key={key}
                                      className="rounded-full border border-[#dbe7ff] bg-white px-3 py-1 text-xs font-medium text-[#38506f]"
                                    >
                                      {roomAmenityLabel[key] || key}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {shouldShowToggle && (
                              <button
                                type="button"
                                onClick={() => toggleRoomDetails(item._id)}
                                className="mt-3 text-xs font-semibold text-[#0b4ecb] underline-offset-2 hover:underline"
                              >
                                {isExpanded ? "Thu gọn" : "Xem thêm"}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div className="border-r border-r-[#cddff6] p-3">
                      <span className="block">
                        {appliedSearchParams.guest} khách ·{" "}
                        {appliedSearchParams.room} phòng
                      </span>
                      <span className="mt-1 block text-sm text-[#595959]">
                        Sức chứa tối đa:{" "}
                        {item.capacity * appliedSearchParams.room} khách
                      </span>
                    </div>

                    <div className="border-r border-r-[#cddff6] p-3">
                      {item.total_original_price > 0 && (
                        <span className="block text-red-500 line-through">
                          VND{" "}
                          {item.total_original_price?.toLocaleString("vi-VN")}
                        </span>
                      )}

                      <span className="block text-[24px] font-bold">
                        VND {item.total_price?.toLocaleString("vi-VN")}
                      </span>

                      {item.discount_percent > 0 && (
                        <span className="mt-2 inline-block rounded bg-primary px-2 py-1 text-white">
                          Tiết kiệm {item.discount_percent}%
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <button
                        disabled={
                          !item.can_book_selected_quantity ||
                          !item.can_fit_selected_guests
                        }
                        onClick={() => handleCreateBooking(item)}
                        className={`w-full rounded py-2 text-white transition ${
                          item.can_book_selected_quantity &&
                          item.can_fit_selected_guests
                            ? "cursor-pointer bg-primary-2 hover:bg-primary"
                            : "cursor-not-allowed bg-[#9eb5dc]"
                        }`}
                      >
                        {item.can_book_selected_quantity &&
                        item.can_fit_selected_guests
                          ? "Đặt ngay"
                          : item.available_quantity === 0
                            ? "Đã hết phòng"
                            : !item.can_book_selected_quantity
                              ? `Không đủ ${appliedSearchParams.room} phòng`
                              : "Không đủ sức chứa"}
                      </button>

                      {!item.can_book_selected_quantity ? (
                        <span className="mt-2 block text-sm text-[#b42318]">
                          {item.available_quantity === 0
                            ? "Phòng hiện tại đã hết trong khoảng ngày bạn chọn."
                            : `Hiện chỉ còn ${item.available_quantity} phòng trong khoảng ngày bạn chọn.`}
                        </span>
                      ) : null}

                      {item.can_book_selected_quantity &&
                        !item.can_fit_selected_guests && (
                          <span className="mt-2 block text-sm text-[#b42318]">
                            Loại phòng này không đủ sức chứa cho{" "}
                            {appliedSearchParams.guest} khách với{" "}
                            {appliedSearchParams.room} phòng.
                          </span>
                        )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-10 rounded-[32px] border border-[#dbe7ff] bg-white p-6 shadow-[0_16px_40px_rgba(0,59,149,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="block text-24 text-primary">
                  Đánh giá chỗ nghỉ
                </span>
                <span className="mt-1 block text-[15px] text-[#5f7291]">
                  Phần này mình để xuống cuối trang theo đúng ý bạn, để đọc xong
                  thông tin rồi mới để lại nhận xét.
                </span>
              </div>

              <div className="inline-flex items-center gap-3 rounded-full bg-[#eef4ff] px-4 py-2">
                <span className="text-[14px] font-semibold text-[#003b95]">
                  {propertyReview.length} đánh giá
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-semibold text-white">
                  {averageRating}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              <div>
                <span className="mb-3 block text-[15px] font-semibold text-[#10357b]">
                  Bạn chấm mấy sao?
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {Array.from({ length: 5 }, (_, index) => {
                    const starValue = index + 1;
                    const active = starValue <= reviewForm.rating;

                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() =>
                          setReviewForm((prev) => ({
                            ...prev,
                            rating: starValue,
                          }))
                        }
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                          active
                            ? "border-[#febb02] bg-[#fff7df]"
                            : "border-[#d9e2f1] bg-white hover:bg-[#f7fbff]"
                        }`}
                      >
                        <FaStar
                          className={`text-[20px] ${
                            active ? "text-[#febb02]" : "text-[#b9c7df]"
                          }`}
                        />
                      </button>
                    );
                  })}

                  <span className="text-[14px] font-medium text-[#5f7291]">
                    {reviewForm.rating} sao
                  </span>
                </div>
              </div>

              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn về phòng, vị trí, độ sạch sẽ."
                className="w-full rounded-[20px] border border-[#d9e2f1] px-4 py-3 outline-none transition focus:border-[#006ce4] focus:ring-2 focus:ring-[#006ce4]/15"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[14px] text-[#6b7a99]">
                  {editingReviewId
                    ? "Bạn đang chỉnh sửa review đã đăng cho chỗ nghỉ này."
                    : "Bạn có thể chọn 4 hoặc 5 sao nếu muốn để lại review tốt."}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={handleCancelEditReview}
                      className="rounded-xl border border-[#dbe7ff] bg-white px-5 py-3 text-[14px] font-semibold text-[#0b2f6a] transition hover:bg-[#f7fbff]"
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}

                  <button
                    type="submit"
                    className="rounded-xl bg-primary-2 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-primary"
                  >
                    {editingReviewId ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                  </button>
                </div>
              </div>
            </form>

            {user?._id && (
              <div className="mt-6 rounded-[24px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="block text-[18px] font-semibold text-primary">
                      Review bạn đã đăng
                    </span>
                    <span className="mt-1 block text-[14px] text-[#5f7291]">
                      Bạn có thể xem lại, sửa hoặc xóa review của mình ngay tại
                      đây.
                    </span>
                  </div>

                  <span className="inline-flex rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#003b95]">
                    {myPropertyReviews.length} review
                  </span>
                </div>

                {myPropertyReviews.length === 0 ? (
                  <div className="mt-4 rounded-[20px] border border-[#dbe7ff] bg-white px-4 py-4 text-[14px] text-[#5f7291]">
                    Bạn chưa đăng review nào cho chỗ nghỉ này.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {myPropertyReviews.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-[22px] border border-[#dbe7ff] bg-white p-4 shadow-[0_8px_24px_rgba(0,59,149,0.06)]"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.user_id?.avatar?.url || defaultAvatar}
                              alt=""
                              className="h-11 w-11 rounded-full"
                            />
                            <div>
                              <span className="block text-[15px] font-semibold text-[#10357b]">
                                {item.user_id?.full_name ||
                                  user?.full_name ||
                                  "Bạn"}
                              </span>
                              <span className="block text-[13px] text-[#6b7a99]">
                                {item.rating} sao
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditReview(item)}
                              className="rounded-xl bg-primary-2 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(item._id)}
                              className="rounded-xl border border-[#ffd0d0] bg-[#fff5f5] px-4 py-2 text-[13px] font-semibold text-[#b42318] transition hover:bg-[#ffecec]"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        <span className="mt-3 block text-[14px] leading-6 text-[#536481]">
                          {item.comment || "Bạn chưa nhập nội dung review."}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PropertyCard;
