import tphcm from "../../../../assets/images/tphcm.jpg";
import hanoi from "../../../../assets/images/hanoi.jpg";
import vungtau from "../../../../assets/images/vungtau.jpg";
import dalat from "../../../../assets/images/dalat.jpg";
import danang from "../../../../assets/images/danang.webp";
import vn from "../../../../assets/images/Vn@3x.png";
import { Link } from "react-router-dom";

const destinations = [
  {
    to: "/properties/ho-chi-minh",
    title: "TP. Hồ Chí Minh",
    image: tphcm,
  },
  {
    to: "/properties/ha-noi",
    title: "Hà Nội",
    image: hanoi,
  },
  {
    to: "/properties/vung-tau",
    title: "Vũng Tàu",
    image: vungtau,
  },
  {
    to: "/properties/da-lat",
    title: "Đà Lạt",
    image: dalat,
  },
  {
    to: "/properties/da-nang",
    title: "Đà Nẵng",
    image: danang,
  },
];

const cardClasses = {
  large: "min-w-[280px] flex-1",
  small: "min-w-[240px] flex-1",
};

const TrendingDestinationsPage = () => {
  return (
    <section className="container-custom mt-14">
      <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_45px_rgba(0,59,149,0.08)] md:p-8">
        <span className="text-24 block text-primary">
          Điểm đến đang thịnh hành
        </span>
        <span className="mt-1 block text-[16px] font-medium text-secondary-2">
          Các lựa chọn phổ biến cho du khách từ Việt Nam
        </span>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {destinations.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative overflow-hidden rounded-[28px] bg-[#eaf2ff] shadow-[0_16px_36px_rgba(0,59,149,0.08)] ${
                index < 2
                  ? "h-[310px] lg:col-span-3"
                  : "h-[250px] lg:col-span-2"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0.5)_100%)]" />

              <div className="absolute left-5 top-5 flex items-center gap-2">
                <span className="text-[24px] font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]">
                  {item.title}
                </span>
                <img src={vn} alt="VN" className="w-[24px] rounded-full" />
              </div>

              <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-[#003b95]">
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
