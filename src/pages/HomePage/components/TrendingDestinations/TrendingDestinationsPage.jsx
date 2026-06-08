import tphcm from "../../../../assets/images/tphcm.jpg";
import hanoi from "../../../../assets/images/hanoi.jpg";
import vungtau from "../../../../assets/images/vungtau.jpg";
import dalat from "../../../../assets/images/dalat.jpg";
import danang from "../../../../assets/images/danang.webp";
import vn from "../../../../assets/images/Vn@3x.png";
import { Link } from "react-router-dom";

const destinations = [
  {
    city: "ho-chi-minh",
    title: "TP. Hồ Chí Minh",
    image: tphcm,
  },
  {
    city: "ha-noi",
    title: "Hà Nội",
    image: hanoi,
  },
  {
    city: "vung-tau",
    title: "Vũng Tàu",
    image: vungtau,
  },
  {
    city: "da-lat",
    title: "Đà Lạt",
    image: dalat,
  },
  {
    city: "da-nang",
    title: "Đà Nẵng",
    image: danang,
  },
];

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

const buildExploreLink = (item) => {
  const params = new URLSearchParams({
    q: item.title,
    checkIn: formatLocalDateParam(getToday()),
    checkOut: formatLocalDateParam(getTomorrow()),
    guests: "1",
    rooms: "1",
  });

  return `/${item.city}?${params.toString()}`;
};

const TrendingDestinationsPage = () => {
  return (
    <section className="container-custom mt-10 sm:mt-14">
      <div className="rounded-[24px] border border-[#dbe7ff] bg-white p-5 shadow-[0_18px_45px_rgba(0,59,149,0.08)] sm:rounded-[28px] md:p-8">
        <span className="block text-[22px] font-bold leading-8 text-primary sm:text-[24px]">
          Điểm đến đang thịnh hành
        </span>

        <span className="mt-1 block text-[15px] font-medium leading-6 text-secondary-2 sm:text-[16px]">
          Các lựa chọn phổ biến cho du khách từ Việt Nam
        </span>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {destinations.map((item, index) => (
            <Link
              key={item.city}
              to={buildExploreLink(item)}
              className={`group relative overflow-hidden rounded-[28px] bg-[#eaf2ff] shadow-[0_16px_36px_rgba(0,59,149,0.08)] ${
                index < 2
                  ? "h-[220px] sm:h-[280px] lg:col-span-3 lg:h-[310px]"
                  : "h-[220px] sm:h-[240px] lg:col-span-2 lg:h-[250px]"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0.5)_100%)]" />

              <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
                <span className="text-[20px] font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)] sm:text-[24px]">
                  {item.title}
                </span>

                <img src={vn} alt="VN" className="w-[24px] rounded-full" />
              </div>

              <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-[#003b95] sm:bottom-5 sm:left-5">
                Khám phá ngay
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingDestinationsPage;
