import React from "react";

const ButtonCustom = ({ children, props, className = "", type = "button" }) => {
  return (
    <button
      type={type}
      className={`cursor-pointer rounded-[4px] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonCustom;
