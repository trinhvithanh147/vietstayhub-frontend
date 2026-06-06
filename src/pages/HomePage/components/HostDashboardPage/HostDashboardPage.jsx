import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import flatVN from "../../../../assets/images/Vn@3x.png";
import defaultAvatar from "../../../../assets/images/avatar-default.jpg";
import Icon from "../../../../assets/Icon/Icon";
import ButtonCustom from "../../../../components/ButtonCustom/ButtonCustom";
import { path } from "../../../../hooks/path";
import { BookingService } from "../../../../services/booking.service";
import proPertiesService from "../../../../services/properties.service";
import { reviewService } from "../../../../services/review.service";
import { roomService } from "../../../../services/room.service";
import { userService } from "../../../../services/users.service";

const moneyFormatter = new Intl.NumberFormat("vi-VN");
const calculateCurrentPrice = (originalPrice, discountPercent) => {
  const safeOriginalPrice = Number(originalPrice) || 0;
  const safeDiscountPercent = Number(discountPercent) || 0;

  if (safeOriginalPrice <= 0) return "";
  return String(
    Math.round(safeOriginalPrice * (1 - safeDiscountPercent / 100)),
  );
};
const propertyAmenityFields = [
  ["outdoor_pool", "Hồ bơi ngoài trời"],
  ["free_wifi", "WiFi miễn phí"],
  ["airport_shuttle", "Xe đưa đón sân bay"],
  ["non_smoking_room", "Phòng không hút thuốc"],
  ["room_service", "Dịch vụ phòng"],
  ["restaurant", "Nhà hàng"],
  ["free_parking", "Chỗ đậu xe miễn phí"],
  ["family_room", "Phòng gia đình"],
  ["bar", "Quầy bar"],
  ["breakfast", "Bữa sáng"],
];

const roomBadgeFields = [
  ["balcony", "Ban công"],
  ["air_conditioning", "Điều hòa"],
  ["private_bathroom", "Phòng tắm riêng"],
  ["terrace", "Sân hiên"],
  ["free_wifi", "WiFi miễn phí"],
  ["garden_view", "Nhìn ra vườn"],
  ["courtyard_view", "Hướng sân trong"],
];

const roomAmenityFields = [
  ["toiletries", "Đồ dùng vệ sinh"],
  ["shower", "Vòi sen"],
  ["toilet", "Nhà vệ sinh"],
  ["towels", "Khăn tắm"],
  ["socket_near_bed", "Ổ điện gần giường"],
  ["sitting_area", "Khu vực tiếp khách"],
  ["private_entrance", "Lối vào riêng"],
  ["slippers", "Dép"],
  ["hair_dryer", "Máy sấy tóc"],
  ["fan", "Quạt"],
  ["electric_kettle", "Ấm đun nước"],
  ["wardrobe", "Tủ quần áo"],
  ["clothes_rack", "Giá treo đồ"],
  ["toilet_paper", "Giấy vệ sinh"],
];
const roomTypeOptions = [
  { value: "standard_room", label: "Phòng tiêu chuẩn" },
  { value: "deluxe_room", label: "Phòng deluxe" },
  { value: "suite", label: "Phòng suite" },
];
const cityOptions = [
  { value: "da-lat", label: "Đà Lạt" },
  { value: "da-nang", label: "Đà Nẵng" },
  { value: "ha-noi", label: "Hà Nội" },
  { value: "ho-chi-minh", label: "Hồ Chí Minh" },
  { value: "vung-tau", label: "Vũng Tàu" },
];

const createEmptyPropertyForm = () => ({
  title: "",
  slug: "",
  address: "",
  city: "da-lat",
  country: "Viet Nam",
  base_price: "",
  max_stay_days: "30",
  description: "",
  main_image_url: "",
  main_image_public_id: "",
  gallery_urls: "",
  is_preferred: false,
  amenities: Object.fromEntries(
    propertyAmenityFields.map(([key]) => [key, false]),
  ),
});

const createEmptyRoomForm = () => ({
  property_id: "",
  name: "",
  room_type: "standard_room",
  description: "",
  price: "",
  original_price: "",
  discount_percent: "",
  capacity: "",
  quantity: "",
  bed_info: "",
  area: "",
  view: "",
  badges: Object.fromEntries(roomBadgeFields.map(([key]) => [key, false])),
  amenities: Object.fromEntries(roomAmenityFields.map(([key]) => [key, false])),
});

const createEmptyReviewForm = () => ({
  property_id: "",
  rating: "5",
  comment: "",
});

const getIdValue = (value) => {
  if (!value) return "";
  return typeof value === "object" ? value?._id || "" : value;
};

const parseGalleryImages = (galleryUrls) => {
  return galleryUrls
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((url) => ({ url, public_id: "" }));
};

const getBookingUserDisplay = (bookingItem) => {
  if (!bookingItem?.user_id) return "Chưa có thông tin";
  if (typeof bookingItem.user_id === "object") {
    return (
      bookingItem.user_id.full_name ||
      bookingItem.user_id.email ||
      "Chưa có thông tin"
    );
  }
  return "Chưa có thông tin";
};

const getPropertyOwnerDisplay = (bookingItem) => {
  if (!bookingItem?.property_id?.user_id) return "Chưa có thông tin";
  if (typeof bookingItem.property_id.user_id === "object") {
    return (
      bookingItem.property_id.user_id.full_name ||
      bookingItem.property_id.user_id.email ||
      "Chưa có thông tin"
    );
  }
  return "Chưa có thông tin";
};

const buildPropertyForm = (property) => ({
  title: property.title || "",
  slug: property.slug || "",
  address: property.address || "",
  city: property.city || "da-lat",
  country: property.country || "Viet Nam",
  base_price: String(property.base_price ?? ""),
  max_stay_days: String(property.max_stay_days ?? 30),
  description: property.description || "",
  main_image_url: property.main_image_url || "",
  main_image_public_id: property.main_image_public_id || "",
  gallery_urls: (property.gallery_images || [])
    .map((item) => item.url)
    .join("\n"),
  is_preferred: Boolean(property.is_preferred),
  amenities: {
    ...Object.fromEntries(propertyAmenityFields.map(([key]) => [key, false])),
    ...(property.amenities || {}),
  },
});

const buildRoomForm = (room) => ({
  property_id: getIdValue(room.property_id),
  name: room.name || "",
  room_type: room.room_type || "standard_room",
  description: room.description || "",
  price: String(room.price ?? ""),
  original_price: String(room.original_price ?? ""),
  discount_percent: String(room.discount_percent ?? ""),
  capacity: String(room.capacity ?? ""),
  quantity: String(room.quantity ?? ""),
  bed_info: room.bed_info || "",
  area: String(room.area ?? ""),
  view: room.view || "",
  badges: {
    ...Object.fromEntries(roomBadgeFields.map(([key]) => [key, false])),
    ...(room.badges || {}),
  },
  amenities: {
    ...Object.fromEntries(roomAmenityFields.map(([key]) => [key, false])),
    ...(room.amenities || {}),
  },
});

const buildReviewForm = (review) => ({
  property_id: getIdValue(review.property_id),
  rating: String(review.rating ?? 5),
  comment: review.comment || "",
});

const getStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "completed":
      return "Đã hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

const getStatusClassName = (status) => {
  switch (status) {
    case "pending":
      return "bg-[#fff4cc] text-[#8a6400]";
    case "confirmed":
      return "bg-[#dff5e8] text-[#0f6b3f]";
    case "completed":
      return "bg-[#e7efff] text-[#003b95]";
    case "cancelled":
      return "bg-[#ffe2e0] text-[#b42318]";
    default:
      return "bg-[#eef3fb] text-[#4f6b95]";
  }
};

const getBookingGuestsDisplay = (bookingItem) => {
  const roomsCount = Number(bookingItem?.rooms_count) || 1;
  const roomCapacity = Number(bookingItem?.room_id?.capacity) || 0;
  const storedGuests = Number(bookingItem?.guests) || 0;

  if (storedGuests > 0) return storedGuests;
  if (roomCapacity > 0) return roomCapacity * roomsCount;
  return roomsCount;
};

const getBookingRoomsDisplay = (bookingItem) =>
  Number(bookingItem?.rooms_count) > 0 ? Number(bookingItem.rooms_count) : 1;
const loadDashboardData = async (userId) => {
  const [myRes, allBookingRes, allPropertiesRes, allRoomsRes, allReviewsRes] =
    await Promise.all([
      BookingService.getByUserId(userId),
      BookingService.getAll(),
      proPertiesService.getAll(),
      roomService.getAll(),
      reviewService.getAll(),
    ]);

  const allProperties = allPropertiesRes.data.metaData || [];
  const ownProperties = allProperties.filter(
    (item) => getIdValue(item.user_id) === userId,
  );
  const ownPropertyIds = ownProperties.map((item) => item._id);
  const ownRooms = (allRoomsRes.data.metaData || []).filter((item) =>
    ownPropertyIds.includes(getIdValue(item.property_id)),
  );
  const ownReviews = (allReviewsRes.data.metaData || []).filter((item) =>
    ownPropertyIds.includes(getIdValue(item.property_id)),
  );

  return {
    myBooking: myRes.data.metaData || [],
    booking: allBookingRes.data.metaData || [],
    properties: ownProperties,
    rooms: ownRooms,
    reviews: ownReviews,
  };
};

const SectionTitle = ({ title, count, description }) => {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h2 className="text-[26px] font-bold tracking-tight text-[#10357b]">
          {title}
        </h2>
        <p className="mt-1 text-[14px] leading-6 text-[#5b6b88]">
          {description}
        </p>
      </div>

      <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#eef4ff] px-4 py-2 text-[14px] font-semibold text-[#003b95]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#006ce4]" />
        {count} mục
      </div>
    </div>
  );
};

const SectionHeader = ({ title, count, description, isOpen, onToggle }) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <SectionTitle title={title} count={count} description={description} />

      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#cfdcf1] bg-white px-4 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
      >
        <span>{isOpen ? "Thu gọn" : "Mở rộng"}</span>
        <Icon.arrowDown
          className={`h-4 w-4 fill-[#26446d] transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
};

const Field = ({ className = "", ...props }) => {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-xl border border-[#cfdcf1] bg-white px-4 text-[15px] text-[#1f2f46] outline-none transition focus:border-[#006ce4] focus:ring-2 focus:ring-[#006ce4]/15 ${className}`}
    />
  );
};

const TextArea = ({ className = "", ...props }) => {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-[#cfdcf1] bg-white px-4 py-3 text-[15px] text-[#1f2f46] outline-none transition focus:border-[#006ce4] focus:ring-2 focus:ring-[#006ce4]/15 ${className}`}
    />
  );
};

const SelectField = ({ className = "", children, ...props }) => {
  return (
    <select
      {...props}
      className={`h-12 w-full rounded-xl border border-[#cfdcf1] bg-white px-4 text-[15px] text-[#1f2f46] outline-none transition focus:border-[#006ce4] focus:ring-2 focus:ring-[#006ce4]/15 ${className}`}
    >
      {children}
    </select>
  );
};

const CheckboxGrid = ({ items, values, onToggle }) => {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([key, label]) => (
        <label
          key={key}
          className="flex items-center gap-3 rounded-xl border border-[#d9e2f1] bg-white px-3 py-3 text-[14px] text-[#375070]"
        >
          <input
            type="checkbox"
            checked={Boolean(values[key])}
            onChange={() => onToggle(key)}
            className="h-4 w-4 rounded border-[#9eb5dc] text-[#006ce4]"
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
};

const BookingRow = ({ item, actionSlot, personMode = "booker" }) => {
  const guestsDisplay = getBookingGuestsDisplay(item);
  const roomsDisplay = getBookingRoomsDisplay(item);
  const personText =
    personMode === "owner"
      ? `Chủ phòng cho thuê: ${getPropertyOwnerDisplay(item)}`
      : `Người đặt phòng: ${getBookingUserDisplay(item)}`;

  return (
    <div className="rounded-[24px] border border-[#d9e2f1] bg-white p-5 shadow-[0_12px_32px_rgba(0,59,149,0.06)]">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1.1fr_auto] xl:items-center">
        <div className="space-y-1">
          <span className="block text-[16px] font-semibold text-[#10357b]">
            {item.property_id?.title}
          </span>
          <span className="block text-[13px] text-[#6b7a99]">
            {item.property_id?.address}
          </span>
          <span className="block text-[13px] text-[#6b7a99]">{personText}</span>
        </div>

        <div className="space-y-1">
          <span className="block font-semibold text-[#1f2f46]">
            {item.room_id?.name}
          </span>
          <span className="block text-[13px] text-[#6b7a99]">
            {item.room_id?.view}
          </span>
        </div>

        <div className="space-y-1">
          <span className="block font-semibold text-[#1f2f46]">
            {format(new Date(item.check_in), "dd/MM/yyyy")}
          </span>
          <span className="block text-[13px] text-[#6b7a99]">
            đến {format(new Date(item.check_out), "dd/MM/yyyy")}
          </span>
        </div>

        <div className="space-y-1">
          <span className="block font-semibold text-[#1f2f46]">
            {guestsDisplay} khách - {roomsDisplay} phòng
          </span>
          <span className="block text-[13px] text-[#6b7a99]">
            {item.nights} đêm
          </span>
        </div>

        <div className="space-y-1">
          <span className="block text-[20px] font-bold text-[#003b95]">
            {moneyFormatter.format(item.total_price)} VND
          </span>
          <span className="block text-[13px] text-[#6b7a99]">
            Giá/1 đêm: {moneyFormatter.format(item.price_per_night)} VND
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          {actionSlot}
        </div>
      </div>
    </div>
  );
};
const HostDashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const avatarRef = useRef(null);
  const [avatar, setAvatar] = useState(false);
  const [booking, setBooking] = useState([]);
  const [myBooking, setMyBooking] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedReviewPropertyId, setSelectedReviewPropertyId] =
    useState("all");
  const [propertyForm, setPropertyForm] = useState(createEmptyPropertyForm());
  const [roomForm, setRoomForm] = useState(createEmptyRoomForm());
  const [reviewForm, setReviewForm] = useState(createEmptyReviewForm());
  const [editingPropertyId, setEditingPropertyId] = useState("");
  const [editingRoomId, setEditingRoomId] = useState("");
  const [editingReviewId, setEditingReviewId] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showPropertyList, setShowPropertyList] = useState(true);
  const [showRoomList, setShowRoomList] = useState(true);
  const [showReviewList, setShowReviewList] = useState(true);
  const [showMyBooking, setShowMyBooking] = useState(true);
  const [showOwnerBooking, setShowOwnerBooking] = useState(true);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [propertyImageInputKey, setPropertyImageInputKey] = useState(0);
  const [collapsedRoomGroups, setCollapsedRoomGroups] = useState({});
  const [collapsedReviewGroups, setCollapsedReviewGroups] = useState({});

  useEffect(() => {
    if (!user?._id) return;

    loadDashboardData(user._id)
      .then((data) => {
        setMyBooking(data.myBooking);
        setBooking(data.booking);
        setProperties(data.properties);
        setRooms(data.rooms);
        setReviews(data.reviews);
        setRoomForm((prev) => {
          if (!prev.property_id && data.properties.length > 0) {
            return { ...prev, property_id: data.properties[0]._id };
          }
          return prev;
        });
        setReviewForm((prev) => {
          if (!prev.property_id && data.properties.length > 0) {
            return { ...prev, property_id: data.properties[0]._id };
          }
          return prev;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user?._id]);

  const ownPropertyIds = useMemo(
    () => properties.map((item) => item._id),
    [properties],
  );

  const ownerBooking = useMemo(() => {
    return booking.filter((item) =>
      ownPropertyIds.includes(getIdValue(item.property_id)),
    );
  }, [booking, ownPropertyIds]);

  const reviewPropertyOptions = useMemo(
    () =>
      properties.map((item) => ({
        value: item._id,
        label: item.title,
      })),
    [properties],
  );

  const filteredReviews = useMemo(() => {
    if (selectedReviewPropertyId === "all") return reviews;

    return reviews.filter(
      (item) => getIdValue(item.property_id) === selectedReviewPropertyId,
    );
  }, [reviews, selectedReviewPropertyId]);

  const groupedReviews = useMemo(() => {
    const groups = properties
      .map((property) => ({
        propertyId: property._id,
        propertyTitle: property.title,
        propertyAddress: property.address,
        items: filteredReviews.filter(
          (review) => getIdValue(review.property_id) === property._id,
        ),
      }))
      .filter((group) => group.items.length > 0);

    return groups;
  }, [filteredReviews, properties]);

  const groupedRooms = useMemo(() => {
    return properties
      .map((property) => ({
        propertyId: property._id,
        propertyTitle: property.title,
        propertyAddress: property.address,
        items: rooms.filter(
          (roomItem) => getIdValue(roomItem.property_id) === property._id,
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [properties, rooms]);

  const toggleReviewGroup = (propertyId) => {
    setCollapsedReviewGroups((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  const toggleRoomGroup = (propertyId) => {
    setCollapsedRoomGroups((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!avatarRef.current?.contains(e.target)) {
        setAvatar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleUpdateAction = async (bookingId, status) => {
    try {
      await BookingService.updateStatus(bookingId, status);
      const data = await loadDashboardData(user._id);
      setMyBooking(data.myBooking);
      setBooking(data.booking);
      setProperties(data.properties);
      setRooms(data.rooms);
      setReviews(data.reviews);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePropertyFieldChange = (field, value) => {
    setPropertyForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertyAmenityToggle = (key) => {
    setPropertyForm((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  const handleRoomFieldChange = (field, value) => {
    setRoomForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "original_price" || field === "discount_percent") {
        next.price = calculateCurrentPrice(
          next.original_price,
          next.discount_percent,
        );
      }

      return next;
    });
  };

  const handleRoomBadgeToggle = (key) => {
    setRoomForm((prev) => ({
      ...prev,
      badges: {
        ...prev.badges,
        [key]: !prev.badges[key],
      },
    }));
  };

  const handleRoomAmenityToggle = (key) => {
    setRoomForm((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  const handleReviewFieldChange = (field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetPropertyForm = () => {
    setPropertyForm(createEmptyPropertyForm());
    setEditingPropertyId("");
    setMainImageFile(null);
    setGalleryImageFiles([]);
    setPropertyImageInputKey((prev) => prev + 1);
  };

  const resetRoomForm = () => {
    setRoomForm({
      ...createEmptyRoomForm(),
      property_id: properties[0]?._id || "",
    });
    setEditingRoomId("");
  };

  const resetReviewForm = () => {
    setReviewForm({
      ...createEmptyReviewForm(),
      property_id: properties[0]?._id || "",
    });
    setEditingReviewId("");
  };

  const uploadPropertyImages = async (propertyId) => {
    if (!propertyId) return;

    if (mainImageFile) {
      await proPertiesService.uploadMainImageCloud(propertyId, mainImageFile);
    }

    if (galleryImageFiles.length > 0) {
      await proPertiesService.uploadGalleryCloud(propertyId, galleryImageFiles);
    }
  };

  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    const payload = {
      title: propertyForm.title,
      slug: propertyForm.slug,
      address: propertyForm.address,
      city: propertyForm.city,
      country: propertyForm.country,
      type: "hotel",
      base_price: Number(propertyForm.base_price || 0),
      description: propertyForm.description,
      amenities: propertyForm.amenities,
      main_image_url: propertyForm.main_image_url,
      main_image_public_id: propertyForm.main_image_public_id,
      gallery_images: parseGalleryImages(propertyForm.gallery_urls),
      is_preferred: propertyForm.is_preferred,
      max_stay_days: Number(propertyForm.max_stay_days || 30),
      user_id: user._id,
    };

    try {
      let savedPropertyId = editingPropertyId;

      if (editingPropertyId) {
        await proPertiesService.update(editingPropertyId, payload);
      } else {
        const createRes = await proPertiesService.create(payload);
        savedPropertyId = createRes?.data?.metaData?._id || "";
      }

      if (savedPropertyId) {
        await uploadPropertyImages(savedPropertyId);
      }

      const data = await loadDashboardData(user._id);
      setMyBooking(data.myBooking);
      setBooking(data.booking);
      setProperties(data.properties);
      setRooms(data.rooms);
      setReviews(data.reviews);
      resetPropertyForm();
      setShowPropertyForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditProperty = (property) => {
    setPropertyForm(buildPropertyForm(property));
    setEditingPropertyId(property._id);
    setMainImageFile(null);
    setGalleryImageFiles([]);
    setPropertyImageInputKey((prev) => prev + 1);
    setShowPropertyForm(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Ban co chac muon xoa property nay khong?")) return;
    try {
      await proPertiesService.delete(propertyId);
      const data = await loadDashboardData(user._id);
      setMyBooking(data.myBooking);
      setBooking(data.booking);
      setProperties(data.properties);
      setRooms(data.rooms);
      setReviews(data.reviews);
      if (editingPropertyId === propertyId) resetPropertyForm();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    const payload = {
      property_id: roomForm.property_id,
      name: roomForm.name,
      room_type: roomForm.room_type,
      description: roomForm.description,
      original_price: Number(roomForm.original_price || 0),
      discount_percent: Number(roomForm.discount_percent || 0),
      capacity: Number(roomForm.capacity || 1),
      quantity: Number(roomForm.quantity || 1),
      bed_info: roomForm.bed_info,
      area: Number(roomForm.area || 0),
      view: roomForm.view,
      badges: roomForm.badges,
      amenities: roomForm.amenities,
    };

    try {
      if (editingRoomId) {
        await roomService.update(editingRoomId, payload);
      } else {
        await roomService.create(payload);
      }
      const data = await loadDashboardData(user._id);
      setMyBooking(data.myBooking);
      setBooking(data.booking);
      setProperties(data.properties);
      setRooms(data.rooms);
      setReviews(data.reviews);
      resetRoomForm();
      setShowRoomForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditRoom = (room) => {
    setRoomForm(buildRoomForm(room));
    setEditingRoomId(room._id);
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Ban co chac muon xoa room nay khong?")) return;
    try {
      await roomService.delete(roomId);
      const data = await loadDashboardData(user._id);
      setMyBooking(data.myBooking);
      setBooking(data.booking);
      setProperties(data.properties);
      setRooms(data.rooms);
      setReviews(data.reviews);
      if (editingRoomId === roomId) resetRoomForm();
    } catch (err) {
      console.log(err);
    }
  };

  const openCreateRoomForm = (propertyId = "") => {
    resetRoomForm();
    setRoomForm((prev) => ({
      ...prev,
      property_id: propertyId || properties[0]?._id || "",
    }));
    setShowRoomForm(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const payload = {
      user_id: user._id,
      property_id: reviewForm.property_id,
      rating: Number(reviewForm.rating || 5),
      comment: reviewForm.comment,
    };

    try {
      if (editingReviewId) {
        await reviewService.update(editingReviewId, payload);
      } else {
        await reviewService.create(payload);
      }
      const data = await loadDashboardData(user._id);
      setMyBooking(data.myBooking);
      setBooking(data.booking);
      setProperties(data.properties);
      setRooms(data.rooms);
      setReviews(data.reviews);
      resetReviewForm();
      setShowReviewForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  const _handleEditReview = (review) => {
    setReviewForm(buildReviewForm(review));
    setEditingReviewId(review._id);
    setShowReviewForm(true);
  };

  const _handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này không?")) return;
    try {
      await reviewService.delete(reviewId);
      const data = await loadDashboardData(user._id);
      setMyBooking(data.myBooking);
      setBooking(data.booking);
      setProperties(data.properties);
      setRooms(data.rooms);
      setReviews(data.reviews);
      if (editingReviewId === reviewId) resetReviewForm();
    } catch (err) {
      console.log(err);
    }
  };
  const _handleToggleReviewVisibility = async (reviewId, nextVisible) => {
    try {
      await reviewService.visibility(reviewId, nextVisible);

      const data = await loadDashboardData(user._id);
      setMyBooking(data.myBooking);
      setBooking(data.booking);
      setProperties(data.properties);
      setRooms(data.rooms);
      setReviews(data.reviews);
    } catch (err) {
      console.log(err);
    }
  };
  const openCreateReviewForm = (propertyId = "") => {
    resetReviewForm();
    setReviewForm((prev) => ({
      ...prev,
      property_id: propertyId || properties[0]?._id || "",
    }));
    setShowReviewForm(true);
  };

  return (
    <>
      <div className="bg-primary pt-2 text-white">
        <div className="container-custom w-full">
          <div className="flex items-center justify-between pb-3 pt-1">
            <Link to={path.homePage}>
              <Icon.logoBrand className="h-[24px] w-[144px]" />
            </Link>

            <div className="flex items-center justify-center gap-2">
              <span className="cursor-pointer rounded-sm px-3 py-2 font-medium hover:bg-white/10">
                VND
              </span>
              <span className="cursor-pointer rounded-sm px-3 py-2 hover:bg-white/10">
                <img src={flatVN} alt="" className="h-6 w-6 rounded-full" />
              </span>
              <span className="cursor-pointer rounded-sm px-3 py-2 hover:bg-white/10">
                <Icon.questionCircle className="w-5 fill-white" />
              </span>

              {user ? (
                <>
                  <Link
                    to={path.hostDashboardPage}
                    className="rounded-sm px-3 py-2 text-[16px] font-medium hover:bg-white/10"
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
                        className="h-full w-full rounded-full"
                      />
                    </button>
                    {avatar && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-1/2 top-full z-20 mt-3 w-[260px] -translate-x-1/2 overflow-hidden rounded-[22px] border border-[#d9e2f1] bg-white text-[#1a1a1a] shadow-[0_22px_50px_rgba(0,0,0,0.18)]"
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
                            className="block w-full rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#003b95] transition hover:border-[#bfd3f6] hover:bg-[#eef5ff]"
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

      <div className="bg-[linear-gradient(180deg,#edf4ff_0%,#ffffff_36%,#edf4ff_100%)] pb-16">
        <div className="w-full px-4 py-8 text-[#1a1a1a] sm:px-6 xl:px-8 2xl:px-10">
          <div className="mb-8 rounded-[30px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_45px_rgba(0,59,149,0.08)] md:p-8">
            <SectionHeader
              title="Đặt phòng của tôi"
              count={myBooking.length}
              description="Các đơn bạn đã đặt được tách riêng khỏi khu quản lý chỗ nghỉ."
              isOpen={showMyBooking}
              onToggle={() => setShowMyBooking((prev) => !prev)}
            />
            {showMyBooking &&
              (myBooking.length === 0 ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-10 text-center text-[#5b6b88]">
                  Hiện tại bạn chưa có đơn đặt phòng nào.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {myBooking.map((item) => (
                    <BookingRow
                      key={item._id}
                      item={item}
                      personMode="owner"
                      actionSlot={
                        <span
                          className={`inline-flex rounded-full px-4 py-2 text-[13px] font-semibold ${getStatusClassName(item.status)}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      }
                    />
                  ))}
                </div>
              ))}
          </div>

          <div className="rounded-[36px] border border-[#d7e5ff] bg-[linear-gradient(135deg,#003b95_0%,#006ce4_100%)] p-8 text-white shadow-[0_24px_60px_rgba(0,59,149,0.22)]">
            <div className="max-w-[860px]">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.24em] text-white/80">
                Host Dashboard
              </span>
              <h1 className="mt-4 text-[34px] font-bold leading-tight md:text-[42px]">
                Quản lý chỗ nghỉ và đơn khách đặt
              </h1>
              <p className="mt-3 max-w-[720px] text-[16px] leading-7 text-white/82">
                Theo dõi các đơn khách đặt vào chỗ nghỉ của bạn, quản lý phòng,
                bình luận và thông tin chỗ nghỉ trong cùng một khu làm việc.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-[24px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="block text-[13px] text-white/75">
                    Đơn khách đặt
                  </span>
                  <span className="mt-2 block text-[28px] font-bold">
                    {ownerBooking.length}
                  </span>
                </div>
                <div className="rounded-[24px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="block text-[13px] text-white/75">
                    Chỗ nghỉ
                  </span>
                  <span className="mt-2 block text-[28px] font-bold">
                    {properties.length}
                  </span>
                </div>
                <div className="rounded-[24px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="block text-[13px] text-white/75">Phòng</span>
                  <span className="mt-2 block text-[28px] font-bold">
                    {rooms.length}
                  </span>
                </div>
                <div className="rounded-[24px] border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="block text-[13px] text-white/75">
                    Bình luận
                  </span>
                  <span className="mt-2 block text-[28px] font-bold">
                    {reviews.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8">
            <div className="rounded-[30px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_45px_rgba(0,59,149,0.08)] md:p-8">
              <SectionHeader
                title="Đơn khách đặt phòng"
                count={ownerBooking.length}
                description="Đây là các booking thuộc những chỗ nghỉ do bạn đang sở hữu."
                isOpen={showOwnerBooking}
                onToggle={() => setShowOwnerBooking((prev) => !prev)}
              />
              {showOwnerBooking &&
                (ownerBooking.length === 0 ? (
                  <div className="mt-6 rounded-[24px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-10 text-center text-[#5b6b88]">
                    Chưa có khách nào đặt phòng vào chỗ nghỉ của bạn.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {ownerBooking.map((item) => (
                      <BookingRow
                        key={item._id}
                        item={item}
                        personMode="booker"
                        actionSlot={
                          <>
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateAction(item._id, "confirmed")
                                  }
                                  className="rounded-xl bg-primary-2 px-4 py-2 text-[14px] font-semibold text-white transition hover:brightness-110"
                                >
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateAction(item._id, "cancelled")
                                  }
                                  className="rounded-xl border border-[#d0d9ea] bg-white px-4 py-2 text-[14px] font-semibold text-[#3f4c67] transition hover:border-[#b4c6e8] hover:bg-[#f7faff]"
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                            {item.status === "confirmed" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateAction(item._id, "completed")
                                  }
                                  className="rounded-xl bg-[#0f8f52] px-4 py-2 text-[14px] font-semibold text-white transition hover:brightness-110"
                                >
                                  Hoàn thành
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateAction(item._id, "cancelled")
                                  }
                                  className="rounded-xl border border-[#d0d9ea] bg-white px-4 py-2 text-[14px] font-semibold text-[#3f4c67] transition hover:border-[#b4c6e8] hover:bg-[#f7faff]"
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                            {(item.status === "completed" ||
                              item.status === "cancelled") && (
                              <span
                                className={`inline-flex rounded-full px-4 py-2 text-[13px] font-semibold ${getStatusClassName(item.status)}`}
                              >
                                {getStatusLabel(item.status)}
                              </span>
                            )}
                          </>
                        }
                      />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 pb-16 sm:px-6 xl:px-8 2xl:px-10">
        <div className="grid gap-8 xl:grid-cols-1 2xl:grid-cols-[1.15fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_45px_rgba(0,59,149,0.08)] md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-[#eef4ff] px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#003b95]">
                    Property CRUD
                  </span>
                  <h2 className="mt-4 text-[28px] font-bold text-[#10357b]">
                    Quản lý chỗ nghỉ
                  </h2>
                  <p className="mt-2 text-[15px] leading-7 text-[#5b6b88]">
                    Tạo mới, cập nhật và xóa thông tin chỗ nghỉ của bạn ngay tại
                    đây.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPropertyForm((prev) => !prev)}
                    className="rounded-xl bg-primary-2 px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                  >
                    {showPropertyForm ? "Đóng form" : "Mở form"}
                  </button>
                  <button
                    onClick={() => {
                      resetPropertyForm();
                      setShowPropertyForm(true);
                    }}
                    className="rounded-xl border border-[#cfdcf1] bg-white px-5 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                  >
                    Làm mới
                  </button>
                </div>
              </div>

              {showPropertyForm && (
                <form
                  onSubmit={handleSubmitProperty}
                  className="mt-6 space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      value={propertyForm.title}
                      onChange={(e) =>
                        handlePropertyFieldChange("title", e.target.value)
                      }
                      placeholder="Tên khách sạn"
                      required
                    />
                    <Field
                      value={propertyForm.slug}
                      onChange={(e) =>
                        handlePropertyFieldChange("slug", e.target.value)
                      }
                      placeholder="Slug"
                      required
                    />
                  </div>
                  <Field
                    value={propertyForm.address}
                    onChange={(e) =>
                      handlePropertyFieldChange("address", e.target.value)
                    }
                    placeholder="Địa chỉ"
                    required
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      value={propertyForm.city}
                      onChange={(e) =>
                        handlePropertyFieldChange("city", e.target.value)
                      }
                    >
                      {cityOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </SelectField>
                    <Field
                      value={propertyForm.country}
                      onChange={(e) =>
                        handlePropertyFieldChange("country", e.target.value)
                      }
                      placeholder="Quốc gia"
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      type="number"
                      value={propertyForm.base_price}
                      onChange={(e) =>
                        handlePropertyFieldChange("base_price", e.target.value)
                      }
                      placeholder="Giá cơ bản"
                      required
                    />
                    <Field
                      type="number"
                      value={propertyForm.max_stay_days}
                      onChange={(e) =>
                        handlePropertyFieldChange(
                          "max_stay_days",
                          e.target.value,
                        )
                      }
                      placeholder="Số đêm tối đa"
                    />
                  </div>
                  <div className="rounded-xl border border-[#d9e2f1] bg-[#f8fbff] p-4">
                    <span className="mb-2 block text-[14px] font-semibold text-[#10357b]">
                      Ảnh chính (chọn từ máy)
                    </span>
                    <input
                      key={`main-image-${propertyImageInputKey}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setMainImageFile(e.target.files?.[0] || null)
                      }
                      className="block w-full rounded-lg border border-[#cfdcf1] bg-white px-3 py-2 text-[14px] text-[#1f2f46] file:mr-3 file:rounded-lg file:border-0 file:bg-[#006ce4] file:px-3 file:py-2 file:text-white"
                    />
                    <span className="mt-2 block text-[12px] text-[#5b6b88]">
                      {mainImageFile
                        ? `Đã chọn: ${mainImageFile.name}`
                        : propertyForm.main_image_url
                          ? "Chưa chọn file mới. Giữ ảnh chính hiện tại."
                          : "Chưa có ảnh chính."}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#d9e2f1] bg-[#f8fbff] p-4">
                    <span className="mb-2 block text-[14px] font-semibold text-[#10357b]">
                      Danh sách ảnh (chọn nhiều ảnh)
                    </span>
                    <input
                      key={`gallery-image-${propertyImageInputKey}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setGalleryImageFiles(Array.from(e.target.files || []))
                      }
                      className="block w-full rounded-lg border border-[#cfdcf1] bg-white px-3 py-2 text-[14px] text-[#1f2f46] file:mr-3 file:rounded-lg file:border-0 file:bg-[#006ce4] file:px-3 file:py-2 file:text-white"
                    />
                    <span className="mt-2 block text-[12px] text-[#5b6b88]">
                      {galleryImageFiles.length > 0
                        ? `Đã chọn ${galleryImageFiles.length} ảnh mới`
                        : `Chưa chọn ảnh mới. Gallery hiện tại: ${(propertyForm.gallery_urls || "").split("\n").filter(Boolean).length} ảnh`}
                    </span>
                  </div>
                  <TextArea
                    rows={5}
                    value={propertyForm.description}
                    onChange={(e) =>
                      handlePropertyFieldChange("description", e.target.value)
                    }
                    placeholder="Mô tả"
                  />
                  <label className="flex items-center gap-3 rounded-xl border border-[#d9e2f1] bg-[#f8fbff] px-4 py-3 text-[14px] font-semibold text-[#375070]">
                    <input
                      type="checkbox"
                      checked={propertyForm.is_preferred}
                      onChange={() =>
                        handlePropertyFieldChange(
                          "is_preferred",
                          !propertyForm.is_preferred,
                        )
                      }
                      className="h-4 w-4 rounded border-[#9eb5dc] text-[#006ce4]"
                    />
                    Chỗ nghỉ nổi bật
                  </label>
                  <div>
                    <span className="mb-3 block text-[15px] font-semibold text-[#10357b]">
                      Amenities
                    </span>
                    <CheckboxGrid
                      items={propertyAmenityFields}
                      values={propertyForm.amenities}
                      onToggle={handlePropertyAmenityToggle}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-primary-2 px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                    >
                      {editingPropertyId ? "Cập nhật chỗ nghỉ" : "Tạo chỗ nghỉ"}
                    </button>
                    <button
                      type="button"
                      onClick={resetPropertyForm}
                      className="rounded-xl border border-[#cfdcf1] bg-white px-5 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                    >
                      Đặt lại form
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="rounded-[30px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_45px_rgba(0,59,149,0.08)] md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <SectionTitle
                  title="Danh sách chỗ nghỉ"
                  count={properties.length}
                  description="Chỉ hiển thị các chỗ nghỉ do tài khoản này sở hữu."
                />
                <button
                  type="button"
                  onClick={() => setShowPropertyList((prev) => !prev)}
                  className="rounded-xl border border-[#cfdcf1] bg-white px-4 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                >
                  {showPropertyList ? "Thu gọn danh sách" : "Mở danh sách"}
                </button>
              </div>
              {!showPropertyList ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-8 text-center text-[#5b6b88]">
                  Danh sách chỗ nghỉ đang được thu gọn.
                </div>
              ) : properties.length === 0 ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-10 text-center text-[#5b6b88]">
                  Bạn chưa tạo property nào.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {properties.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-[22px] border border-[#d9e2f1] bg-white p-5 shadow-[0_12px_32px_rgba(0,59,149,0.06)]"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <span className="block text-[20px] font-bold text-[#10357b]">
                            {item.title}
                          </span>
                          <span className="block text-[14px] text-[#5b6b88]">
                            {item.address}
                          </span>

                          <div className="flex flex-wrap gap-2 text-[13px] text-[#5b6b88]">
                            <span className="rounded-full bg-[#eef4ff] px-3 py-1">
                              {item.city}
                            </span>
                            <span className="rounded-full bg-[#eef4ff] px-3 py-1">
                              Giá từ {moneyFormatter.format(item.base_price)}{" "}
                              VND
                            </span>
                            <span className="rounded-full bg-[#eef4ff] px-3 py-1">
                              Tối đa {item.max_stay_days} đêm
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleEditProperty(item)}
                            className="rounded-xl bg-primary-2 px-4 py-2 text-[14px] font-semibold text-white transition hover:brightness-110"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => openCreateRoomForm(item._id)}
                            className="rounded-xl border border-[#cfdcf1] bg-white px-4 py-2 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                          >
                            Thêm phòng
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(item._id)}
                            className="rounded-xl border border-[#f0c6c2] bg-white px-4 py-2 text-[14px] font-semibold text-[#b42318] transition hover:bg-[#fff3f2]"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[30px] border border-[#dbe7ff] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-6 shadow-[0_18px_45px_rgba(0,59,149,0.08)] md:p-8">
              <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
                <div className="w-full xl:max-w-[55%]">
                  <span className="inline-flex rounded-full bg-[#eef4ff] px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#003b95]">
                    Comment studio
                  </span>
                  <h2 className="mt-4 text-[28px] font-bold text-[#10357b]">
                    Quản lý bình luận
                  </h2>
                  <p className="mt-2 text-[14px] leading-7 text-[#5b6b88]">
                    Theo dõi phản hồi của khách, tạo nhanh một review mẫu và
                    chỉnh sửa comment cho các property bạn đang quản lý.
                  </p>
                </div>
                <div className="grid w-full gap-3 sm:grid-cols-3 xl:max-w-[45%]">
                  <div className="rounded-[22px] h-[80px] border border-[#d7e5fb] bg-white p-2 shadow-[0_10px_24px_rgba(0,59,149,0.06)]">
                    <span className="mt-2 block text-center text-[13px] text-[#6b7a99]">
                      bình luận
                    </span>
                    <span className="mt-2 block text-center text-[24px] font-bold text-[#10357b]">
                      {reviews.length}
                    </span>
                  </div>
                  <div className="rounded-[22px] text-center h-[80px] border border-[#d7e5fb] bg-white p-2 shadow-[0_10px_24px_rgba(0,59,149,0.06)]">
                    <span className="mt-2 block text-[13px] text-[#6b7a99]">
                      Chỗ nghỉ
                    </span>
                    <span className="mt-2 block text-[24px] font-bold text-[#10357b]">
                      {
                        new Set(
                          reviews.map((item) => getIdValue(item.property_id)),
                        ).size
                      }
                    </span>
                  </div>
                  <div className="rounded-[22px] text-center h-[80px] border border-[#d7e5fb] p-2 bg-white shadow-[0_10px_24px_rgba(0,59,149,0.06)]">
                    <span className="mt-2 block text-[13px] text-[#6b7a99]">
                      Trung bình
                    </span>
                    <span className="mt-2 block text-[24px] font-bold text-[#10357b]">
                      {reviews.length
                        ? (
                            reviews.reduce(
                              (sum, item) => sum + Number(item.rating || 0),
                              0,
                            ) / reviews.length
                          ).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="rounded-[26px] border border-[#dbe7ff] bg-white p-5 shadow-[0_12px_28px_rgba(0,59,149,0.05)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="block text-[20px] font-bold text-[#10357b]">
                        {editingReviewId
                          ? "Chỉnh sửa bình luận"
                          : "Tạo bình luận mới"}
                      </span>
                      <span className="mt-1 block text-[14px] text-[#5b6b88]">
                        Chọn property, mức sao và viết nội dung sao cho rõ ràng.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setShowReviewForm((prev) => !prev)}
                        className="rounded-xl bg-primary-2 px-4 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                      >
                        {showReviewForm ? "Thu gọn" : "Mở form"}
                      </button>
                      <button
                        onClick={() => openCreateReviewForm()}
                        className="rounded-xl border border-[#cfdcf1] bg-white px-4 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                      >
                        Làm mới
                      </button>
                    </div>
                  </div>

                  {showReviewForm && (
                    <form
                      onSubmit={handleSubmitReview}
                      className="mt-6 space-y-4"
                    >
                      <div className="rounded-[22px] bg-[#f7fbff] p-4">
                        <SelectField
                          value={reviewForm.property_id}
                          onChange={(e) =>
                            handleReviewFieldChange(
                              "property_id",
                              e.target.value,
                            )
                          }
                          required
                        >
                          <option value="">Chọn chỗ nghỉ</option>
                          {properties.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.title}
                            </option>
                          ))}
                        </SelectField>
                      </div>
                      <div className="grid gap-5">
                        <div className="rounded-[22px] bg-[#f7fbff] p-4">
                          <span className="mb-3 block text-[14px] font-semibold text-[#10357b]">
                            Mức đánh giá
                          </span>
                          <SelectField
                            value={reviewForm.rating}
                            onChange={(e) =>
                              handleReviewFieldChange("rating", e.target.value)
                            }
                          >
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating} sao
                              </option>
                            ))}
                          </SelectField>
                        </div>
                        <div className="rounded-[22px] bg-[#f7fbff] p-4">
                          <span className="mb-3 block text-[14px] font-semibold text-[#10357b]">
                            Nội dung bình luận
                          </span>
                          <TextArea
                            rows={5}
                            value={reviewForm.comment}
                            onChange={(e) =>
                              handleReviewFieldChange("comment", e.target.value)
                            }
                            placeholder="Viết bình luận để người xem dễ nắm bắt..."
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          type="submit"
                          className="rounded-xl bg-primary-2 px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                        >
                          {editingReviewId
                            ? "Cập nhật bình luận"
                            : "Tạo bình luận"}
                        </button>
                        <button
                          type="button"
                          onClick={resetReviewForm}
                          className="rounded-xl border border-[#cfdcf1] bg-white px-5 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                        >
                          Đặt lại nội dung
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="rounded-[26px] border border-[#dbe7ff] bg-white p-5 shadow-[0_12px_28px_rgba(0,59,149,0.05)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <span className="block text-[20px] font-bold text-[#10357b]">
                        Danh sách bình luận
                      </span>
                      <span className="mt-1 block text-[14px] text-[#5b6b88]">
                        Lọc theo khách sạn để xem, sửa và xóa bình luận dễ hơn.
                      </span>
                    </div>

                    <div className="w-full lg:w-[320px]">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1">
                          <SelectField
                            value={selectedReviewPropertyId}
                            onChange={(e) =>
                              setSelectedReviewPropertyId(e.target.value)
                            }
                          >
                            <option value="all">Tất cả khách sạn</option>
                            {reviewPropertyOptions.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </SelectField>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowReviewList((prev) => !prev)}
                          className="rounded-xl border border-[#cfdcf1] bg-white px-4 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                        >
                          {showReviewList
                            ? "Thu gọn danh sách"
                            : "Mở danh sách"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {!showReviewList ? (
                    <div className="mt-6 rounded-[22px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-8 text-center text-[#5b6b88]">
                      Danh sách bình luận đang được thu gọn.
                    </div>
                  ) : groupedReviews.length === 0 ? (
                    <div className="mt-6 rounded-[22px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-10 text-center text-[#5b6b88]">
                      Chưa có bình luận nào phù hợp với bộ lọc hiện tại.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-5">
                      {groupedReviews.map((group) => (
                        <div
                          key={group.propertyId}
                          className="rounded-[24px] border border-[#dbe7ff] bg-[#fbfdff] p-5"
                        >
                          <div className="flex flex-col gap-2 border-b border-[#e8eef8] pb-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <span className="block text-[18px] font-bold text-[#10357b]">
                                {group.propertyTitle}
                              </span>
                              <span className="mt-1 block text-[14px] text-[#5b6b88]">
                                {group.propertyAddress}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleReviewGroup(group.propertyId)
                                }
                                className="rounded-xl border border-[#cfdcf1] bg-white px-4 py-2 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                              >
                                {collapsedReviewGroups[group.propertyId]
                                  ? "Mở bình luận"
                                  : "Thu gọn"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openCreateReviewForm(group.propertyId)
                                }
                                className="rounded-xl border border-[#cfdcf1] bg-white px-4 py-2 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                              >
                                Thêm bình luận
                              </button>
                            </div>
                          </div>

                          {!collapsedReviewGroups[group.propertyId] && (
                            <div className="mt-4 space-y-3">
                              {group.items.map((review) => (
                                <div
                                  key={review._id}
                                  className="rounded-[20px] border border-[#e4ecf8] bg-white p-4 shadow-[0_8px_20px_rgba(0,59,149,0.04)]"
                                >
                                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[13px] font-semibold text-[#003b95]">
                                          {Number(review.rating || 0)} sao
                                        </span>
                                        <span className="text-[13px] text-[#6b7a99]">
                                          {review.createdAt
                                            ? format(
                                                new Date(review.createdAt),
                                                "dd/MM/yyyy HH:mm",
                                              )
                                            : "Chưa có thời gian"}
                                        </span>
                                      </div>

                                      <p className="mt-3 text-[15px] leading-7 text-[#334155]">
                                        {review.comment ||
                                          "Chưa có nội dung bình luận."}
                                      </p>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-3">
                                      <span
                                        className={`rounded-xl px-4 py-2 text-[14px] font-semibold ${
                                          review.is_visible === false
                                            ? "bg-[#fff3f2] text-[#b42318]"
                                            : "bg-[#e8f7ef] text-[#0f6b3f]"
                                        }`}
                                      >
                                        {review.is_visible === false
                                          ? "Đang ẩn"
                                          : "Đang hiện"}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          _handleToggleReviewVisibility(
                                            review._id,
                                            review.is_visible === false,
                                          )
                                        }
                                        className={`rounded-xl px-4 py-2 text-[14px] font-semibold transition ${
                                          review.is_visible === false
                                            ? "bg-primary-2 text-white hover:brightness-110"
                                            : "border border-[#f0c6c2] bg-white text-[#b42318] hover:bg-[#fff3f2]"
                                        }`}
                                      >
                                        {review.is_visible === false
                                          ? "Hiện"
                                          : "Ẩn"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_45px_rgba(0,59,149,0.08)] md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-[#eef4ff] px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#003b95]">
                    Room CRUD
                  </span>
                  <h2 className="mt-4 text-[28px] font-bold text-[#10357b]">
                    Quản lý phòng
                  </h2>
                  <p className="mt-2 text-[15px] leading-7 text-[#5b6b88]">
                    Quản lý loại phòng, giá, sức chứa và số lượng phòng còn lại.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRoomForm((prev) => !prev)}
                    className="rounded-xl bg-primary-2 px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                  >
                    {showRoomForm ? "Đóng form" : "Mở form"}
                  </button>
                  <button
                    onClick={() => openCreateRoomForm()}
                    className="rounded-xl border border-[#cfdcf1] bg-white px-5 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                  >
                    Làm mới
                  </button>
                </div>
              </div>

              {showRoomForm && (
                <form onSubmit={handleSubmitRoom} className="mt-6 space-y-4">
                  <SelectField
                    value={roomForm.property_id}
                    onChange={(e) =>
                      handleRoomFieldChange("property_id", e.target.value)
                    }
                    required
                  >
                    <option value="">Chọn chỗ nghỉ</option>
                    {properties.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.title}
                      </option>
                    ))}
                  </SelectField>
                  <Field
                    value={roomForm.name}
                    onChange={(e) =>
                      handleRoomFieldChange("name", e.target.value)
                    }
                    placeholder="Tên phòng"
                    required
                  />
                  <SelectField
                    value={roomForm.room_type}
                    onChange={(e) =>
                      handleRoomFieldChange("room_type", e.target.value)
                    }
                  >
                    {roomTypeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </SelectField>
                  <TextArea
                    rows={4}
                    value={roomForm.description}
                    onChange={(e) =>
                      handleRoomFieldChange("description", e.target.value)
                    }
                    placeholder="Mô tả"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      type="number"
                      value={roomForm.price}
                      placeholder="Giá hiện tại tự tính"
                      className="bg-[#eef4ff]"
                      readOnly
                    />
                    <Field
                      type="number"
                      value={roomForm.original_price}
                      onChange={(e) =>
                        handleRoomFieldChange("original_price", e.target.value)
                      }
                      placeholder="Giá gốc"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field
                      type="number"
                      value={roomForm.discount_percent}
                      onChange={(e) =>
                        handleRoomFieldChange(
                          "discount_percent",
                          e.target.value,
                        )
                      }
                      placeholder="% giảm"
                    />
                    <Field
                      type="number"
                      value={roomForm.capacity}
                      onChange={(e) =>
                        handleRoomFieldChange("capacity", e.target.value)
                      }
                      placeholder="Số khách"
                      required
                    />
                    <Field
                      type="number"
                      value={roomForm.quantity}
                      onChange={(e) =>
                        handleRoomFieldChange("quantity", e.target.value)
                      }
                      placeholder="Số phòng"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      value={roomForm.bed_info}
                      onChange={(e) =>
                        handleRoomFieldChange("bed_info", e.target.value)
                      }
                      placeholder="Thông tin giường"
                      required
                    />
                    <Field
                      type="number"
                      value={roomForm.area}
                      onChange={(e) =>
                        handleRoomFieldChange("area", e.target.value)
                      }
                      placeholder="Diện tích"
                    />
                  </div>
                  <Field
                    value={roomForm.view}
                    onChange={(e) =>
                      handleRoomFieldChange("view", e.target.value)
                    }
                    placeholder="View"
                  />
                  <div>
                    <span className="mb-3 block text-[15px] font-semibold text-[#10357b]">
                      Badges
                    </span>
                    <CheckboxGrid
                      items={roomBadgeFields}
                      values={roomForm.badges}
                      onToggle={handleRoomBadgeToggle}
                    />
                  </div>
                  <div>
                    <span className="mb-3 block text-[15px] font-semibold text-[#10357b]">
                      Amenities
                    </span>
                    <CheckboxGrid
                      items={roomAmenityFields}
                      values={roomForm.amenities}
                      onToggle={handleRoomAmenityToggle}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-primary-2 px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                    >
                      {editingRoomId ? "Cập nhật phòng" : "Tạo phòng"}
                    </button>
                    <button
                      type="button"
                      onClick={resetRoomForm}
                      className="rounded-xl border border-[#cfdcf1] bg-white px-5 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                    >
                      Đặt lại form
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="rounded-[30px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_45px_rgba(0,59,149,0.08)] md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <SectionTitle
                  title="Danh sách phòng"
                  count={rooms.length}
                  description="Tất cả phòng thuộc những chỗ nghỉ do bạn sở hữu."
                />
                <button
                  type="button"
                  onClick={() => setShowRoomList((prev) => !prev)}
                  className="rounded-xl border border-[#cfdcf1] bg-white px-4 py-3 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                >
                  {showRoomList ? "Thu gọn danh sách" : "Mở danh sách"}
                </button>
              </div>
              {!showRoomList ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-8 text-center text-[#5b6b88]">
                  Danh sách phòng đang được thu gọn.
                </div>
              ) : rooms.length === 0 ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-6 py-10 text-center text-[#5b6b88]">
                  Bạn chưa có room nào.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {groupedRooms.map((group) => {
                    const isCollapsed = Boolean(
                      collapsedRoomGroups[group.propertyId],
                    );

                    return (
                      <div
                        key={group.propertyId}
                        className="overflow-hidden rounded-[24px] border border-[#d9e2f1] bg-[#f8fbff]"
                      >
                        <div className="flex flex-col gap-4 border-b border-[#dbe7ff] px-5 py-5 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                            <span className="block text-[18px] font-bold text-[#10357b]">
                              {group.propertyTitle}
                            </span>
                            <span className="block text-[14px] text-[#5b6b88]">
                              {group.propertyAddress}
                            </span>
                            <span className="inline-flex rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-[#003b95]">
                              {group.items.length} phòng
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleRoomGroup(group.propertyId)}
                            className="rounded-xl border border-[#cfdcf1] bg-white px-4 py-2 text-[14px] font-semibold text-[#26446d] transition hover:bg-[#f7fbff]"
                          >
                            {isCollapsed ? "Mở phòng" : "Thu gọn phòng"}
                          </button>
                        </div>

                        {isCollapsed ? (
                          <div className="px-5 py-6 text-[14px] text-[#5b6b88]">
                            Danh sách phòng của khách sạn này đang được thu gọn.
                          </div>
                        ) : (
                          <div className="space-y-4 p-5">
                            {group.items.map((item) => (
                              <div
                                key={item._id}
                                className="rounded-[22px] border border-[#d9e2f1] bg-white p-5 shadow-[0_12px_32px_rgba(0,59,149,0.06)]"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                  <div className="space-y-2">
                                    <span className="block text-[18px] font-bold text-[#10357b]">
                                      {item.name}
                                    </span>
                                    <span className="block text-[14px] text-[#5b6b88]">
                                      {group.propertyTitle}
                                    </span>
                                    <div className="flex flex-wrap gap-2 text-[13px] text-[#5b6b88]">
                                      <span className="rounded-full bg-[#eef4ff] px-3 py-1">
                                        {roomTypeOptions.find(
                                          (option) =>
                                            option.value === item.room_type,
                                        )?.label || item.room_type}
                                      </span>
                                      <span className="rounded-full bg-[#eef4ff] px-3 py-1">
                                        {item.capacity} khách
                                      </span>
                                      <span className="rounded-full bg-[#eef4ff] px-3 py-1">
                                        {item.quantity} phòng
                                      </span>
                                      <span className="rounded-full bg-[#eef4ff] px-3 py-1">
                                        {moneyFormatter.format(item.price)} VND
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    <button
                                      onClick={() => handleEditRoom(item)}
                                      className="rounded-xl bg-primary-2 px-4 py-2 text-[14px] font-semibold text-white transition hover:brightness-110"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRoom(item._id)}
                                      className="rounded-xl border border-[#f0c6c2] bg-white px-4 py-2 text-[14px] font-semibold text-[#b42318] transition hover:bg-[#fff3f2]"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HostDashboardPage;
