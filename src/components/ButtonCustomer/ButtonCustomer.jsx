import React from "react";

const ButtonCustomer = ({ children, className = "" }) => {
  return <button className={className}>{children}</button>;
};

export default ButtonCustomer;
