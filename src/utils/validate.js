export const regex = {
  fullName: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phoneVN: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
  password: /^.{6,}$/,
};

export const validateRegister = (form, options = {}) => {
  const {
    isEditing = false,
    requireConfirmPassword = true,
    requirePhone = false,
  } = options;

  if (!form.full_name?.trim()) {
    return "Vui lòng nhập họ và tên.";
  }

  if (!regex.fullName.test(form.full_name.trim())) {
    return "Họ và tên chỉ được chứa chữ cái, khoảng trắng và từ 2 đến 50 ký tự.";
  }

  if (!isEditing) {
    if (!form.email?.trim()) {
      return "Vui lòng nhập email.";
    }

    if (!regex.email.test(form.email.trim())) {
      return "Email không đúng định dạng.";
    }

    if (!form.password) {
      return "Vui lòng nhập mật khẩu.";
    }

    if (!regex.password.test(form.password)) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (requireConfirmPassword) {
      if (!form.confirmPassword) {
        return "Vui lòng nhập lại mật khẩu.";
      }

      if (form.password !== form.confirmPassword) {
        return "Mật khẩu nhập lại không khớp.";
      }
    }
  }

  if (isEditing && form.password?.trim() && form.password.trim().length < 6) {
    return "Mật khẩu mới phải có ít nhất 6 ký tự.";
  }

  if (requirePhone && !form.phone_number?.trim()) {
    return "Vui lòng nhập số điện thoại.";
  }

  if (
    form.phone_number?.trim() &&
    !regex.phoneVN.test(form.phone_number.trim())
  ) {
    return "Số điện thoại không đúng định dạng Việt Nam.";
  }

  if (form.home_address && form.home_address.length > 200) {
    return "Địa chỉ nhà không được vượt quá 200 ký tự.";
  }

  return "";
};

export const validateProfile = (form) => {
  if (!form.full_name?.trim()) {
    return "Vui lòng nhập họ và tên.";
  }

  if (!regex.fullName.test(form.full_name.trim())) {
    return "Họ và tên chỉ được chứa chữ cái, khoảng trắng và từ 2 đến 50 ký tự.";
  }

  if (
    form.phone_number?.trim() &&
    !regex.phoneVN.test(form.phone_number.trim())
  ) {
    return "Số điện thoại không đúng định dạng Việt Nam.";
  }

  if (form.home_address && form.home_address.length > 200) {
    return "Địa chỉ nhà không được vượt quá 200 ký tự.";
  }

  return "";
};
