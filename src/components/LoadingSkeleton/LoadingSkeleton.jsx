const LoadingSkeleton = ({ lines = 4, className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-[24px] border border-[#dbe7ff] bg-white p-5 ${className}`}
    >
      <div className="h-5 w-1/3 rounded-full bg-[#e4eefc]" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 rounded-full bg-[#edf4ff]"
            style={{ width: `${92 - index * 9}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
