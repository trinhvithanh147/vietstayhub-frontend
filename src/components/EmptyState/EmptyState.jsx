const EmptyState = ({
  title = "Chưa có dữ liệu",
  description = "Nội dung sẽ hiển thị tại đây khi có dữ liệu mới.",
  action = null,
}) => {
  return (
    <div className="rounded-[24px] border border-dashed border-[#c7d9f7] bg-[#f7fbff] px-5 py-8 text-center text-[#5b6b88]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[22px] font-bold text-[#006ce4] shadow-sm">
        i
      </div>
      <h3 className="mt-4 text-[18px] font-bold text-[#10357b]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
