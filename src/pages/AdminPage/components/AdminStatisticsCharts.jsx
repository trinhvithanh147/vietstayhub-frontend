import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = {
  primary: "#003b95",
  secondary: "#006ce4",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#7c3aed",
  muted: "#64748b",
};

const PIE_COLORS = [
  "#003b95",
  "#006ce4",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#7c3aed",
];

const statusLabels = {
  pending: "Đang chờ",
  paid: "Đã thanh toán",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn tất",
  unknown: "Không rõ",
};

const formatMoney = (value) => {
  const numberValue = Number(value || 0);
  return `${numberValue.toLocaleString("vi-VN")}đ`;
};

const formatShortMoney = (value) => {
  const numberValue = Number(value || 0);

  if (numberValue >= 1000000000) {
    return `${(numberValue / 1000000000).toFixed(1)} tỷ`;
  }

  if (numberValue >= 1000000) {
    return `${(numberValue / 1000000).toFixed(0)}tr`;
  }

  return numberValue.toLocaleString("vi-VN");
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("vi-VN");
};

const CustomTooltip = ({ active, payload, label, type = "number" }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[#dbe7ff] bg-white px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
      {label && (
        <p className="mb-2 text-sm font-bold text-[#0b2f6a]">{label}</p>
      )}

      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  item.color || item.payload?.fill || COLORS.primary,
              }}
            />

            <span className="text-[#64748b]">{item.name}:</span>

            <span className="font-bold text-[#0f172a]">
              {type === "money"
                ? formatMoney(item.value)
                : formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyChart = () => {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fbff] px-4 text-center text-sm font-semibold text-[#64748b] sm:h-[280px] lg:h-[320px]">
      Chưa có dữ liệu thống kê
    </div>
  );
};

const ChartCard = ({ title, description, badge, children }) => {
  return (
    <div className="min-w-0 overflow-hidden rounded-[20px] border border-[#dbe7ff] bg-white shadow-[0_14px_35px_rgba(0,59,149,0.07)] sm:rounded-[24px] lg:rounded-[26px] lg:shadow-[0_18px_50px_rgba(0,59,149,0.08)]">
      <div className="border-b border-[#edf3ff] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#0b2f6a] sm:text-lg">
              {title}
            </h3>

            <p className="mt-1 text-[13px] leading-6 text-[#64748b] sm:text-sm">
              {description}
            </p>
          </div>

          {badge && (
            <span className="w-fit shrink-0 rounded-full bg-[#eef5ff] px-3 py-1 text-[11px] font-bold text-[#003b95] sm:text-xs">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};

const ChartScrollBox = ({ children }) => {
  return (
    <div className="overflow-x-auto pb-2 sm:overflow-visible sm:pb-0">
      <div className="h-[260px] min-w-[520px] sm:h-[300px] sm:min-w-0 lg:h-[320px]">
        {children}
      </div>
    </div>
  );
};

const AdminStatisticsCharts = ({ charts }) => {
  const monthlyRevenue = charts?.monthlyRevenue || [];
  const bookingsByMonth = charts?.bookingsByMonth || [];
  const propertiesByCity = charts?.propertiesByCity || [];

  const bookingsByStatus = (charts?.bookingsByStatus || []).map((item) => ({
    ...item,
    statusLabel: statusLabels[item.status] || item.status || "Không rõ",
  }));

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-2 xl:gap-6">
      <ChartCard
        title="Doanh thu theo tháng"
        description="Theo dõi tổng doanh thu đặt phòng qua từng tháng."
        badge="Revenue"
      >
        {monthlyRevenue.length ? (
          <ChartScrollBox>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyRevenue}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid stroke="#e8eef8" strokeDasharray="4 4" />

                <XAxis
                  dataKey="month"
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#dbe7ff" }}
                />

                <YAxis
                  width={56}
                  tickFormatter={formatShortMoney}
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#dbe7ff" }}
                />

                <Tooltip content={<CustomTooltip type="money" />} />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke={COLORS.primary}
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    strokeWidth: 3,
                    stroke: COLORS.primary,
                    fill: "#ffffff",
                  }}
                  activeDot={{
                    r: 7,
                    strokeWidth: 3,
                    stroke: COLORS.secondary,
                    fill: "#ffffff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartScrollBox>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>

      <ChartCard
        title="Lượt đặt phòng theo tháng"
        description="Số lượng booking được tạo trong từng tháng."
        badge="Bookings"
      >
        {bookingsByMonth.length ? (
          <ChartScrollBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingsByMonth}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid stroke="#e8eef8" strokeDasharray="4 4" />

                <XAxis
                  dataKey="month"
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#dbe7ff" }}
                />

                <YAxis
                  width={42}
                  allowDecimals={false}
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#dbe7ff" }}
                />

                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Bar
                  dataKey="bookings"
                  name="Lượt đặt phòng"
                  fill={COLORS.secondary}
                  radius={[12, 12, 0, 0]}
                  barSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartScrollBox>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>

      <ChartCard
        title="Khách sạn theo thành phố"
        description="Số lượng khách sạn đang hoạt động theo từng thành phố."
        badge="Properties"
      >
        {propertiesByCity.length ? (
          <ChartScrollBox>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={propertiesByCity}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid stroke="#e8eef8" strokeDasharray="4 4" />

                <XAxis
                  dataKey="city"
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#dbe7ff" }}
                />

                <YAxis
                  width={42}
                  allowDecimals={false}
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#dbe7ff" }}
                />

                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Bar
                  dataKey="total"
                  name="Khách sạn"
                  fill={COLORS.primary}
                  radius={[12, 12, 0, 0]}
                  barSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartScrollBox>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>

      <ChartCard
        title="Trạng thái đặt phòng"
        description="Tỷ lệ booking được chia theo từng trạng thái hiện tại."
        badge="Status"
      >
        {bookingsByStatus.length ? (
          <div className="h-[280px] sm:h-[300px] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs font-medium text-[#475569] sm:text-sm">
                      {value}
                    </span>
                  )}
                />

                <Pie
                  data={bookingsByStatus}
                  dataKey="total"
                  nameKey="statusLabel"
                  cx="50%"
                  cy="43%"
                  innerRadius="45%"
                  outerRadius="72%"
                  paddingAngle={4}
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {bookingsByStatus.map((item, index) => (
                    <Cell
                      key={item.status || index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>
    </div>
  );
};

export default AdminStatisticsCharts;
