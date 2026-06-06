import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { path } from "../../../hooks/path";

const getUserInfoFromToken = (token) => {
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const normalizedBase64 = payloadBase64
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedBase64 = normalizedBase64.padEnd(
      normalizedBase64.length + ((4 - (normalizedBase64.length % 4)) % 4),
      "=",
    );

    const payload = JSON.parse(window.atob(paddedBase64));

    return {
      userId: payload?.userId || null,
      role: payload?.role_user || "user",
    };
  } catch (err) {
    console.log("Decode accessToken failed:", err);
    return null;
  }
};

const LoginSuccess = () => {
  const navigate = useNavigate();

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const email = params.get("email");
    const name = params.get("name");
    const avatar = params.get("avatar");
    const tokenInfo = getUserInfoFromToken(accessToken);

    const user = {
      _id: tokenInfo?.userId || null,
      full_name: name || "",
      email,
      role: tokenInfo?.role || "user",
      avatar: {
        url: avatar,
      },
    };

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(path.homePage);
    } else {
      navigate(path.login);
    }
  }, [navigate]);

  return <div>Đang đăng nhập...</div>;
};

export default LoginSuccess;
