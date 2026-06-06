import { useState } from "react";

const InputCustom = ({
  type = "text",
  placeholder = "",
  className = "",
  icon,
  ...props
}) => {
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState("");

  const isActive = focus || value;

  return (
    <div
      className={`relative box-border  rounded-l-md bg-white flex items-center border-r-[3px] border-[#ffb700]  w-[402px] h-[54px] ${className}`}
    >
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </span>
      )}

      <span
        className={`absolute left-10 transition-all duration-200 pointer-events-none
        ${
          isActive
            ? "top-0 text-[12px] text-gray-500"
            : "top-1/2 -translate-y-1/2 text-[16px] text-[#1a1a1a] font-semibold"
        }`}
      >
        {placeholder}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="w-full pl-10 pt-5 pb-1 outline-none text-[#1a1a1a] bg-transparent"
        {...props}
      />
    </div>
  );
};

export default InputCustom;
