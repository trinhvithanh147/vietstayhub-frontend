import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { path } from "../../hooks/path";
import Icon from "../../assets/Icon/Icon";
import defaultAvatar from "../../assets/images/avatar-default.jpg";
import { userService } from "../../services/users.service";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const AdminTemplate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const avatarRef = useRef(null);
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    if (!user?._id) {
      navigate(path.login, {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    if (user.role !== "admin") {
      navigate(path.homePage, { replace: true });
    }
  }, [location.pathname, navigate, user?._id, user?.role]);

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!avatarRef.current?.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate(path.login, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <div className="bg-primary text-white">
        <div className="container-custom flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Link to={path.homePage} className="inline-flex items-center gap-2">
              <Icon.logoBrand className="h-[22px] w-[132px]" />
            </Link>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.06em]">
              ADMIN
            </span>
          </div>

          <div ref={avatarRef} className="relative z-[100]">
            <button
              type="button"
              onClick={() => setOpenMenu((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 transition hover:bg-white/15"
            >
              <span className="text-sm font-semibold">
                {user?.full_name || "Admin"}
              </span>

              <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/15 border border-white/10">
                <img
                  src={user?.avatar?.url || defaultAvatar}
                  alt="avatar"
                  className="h-full w-full "
                />
              </span>
            </button>

            {openMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-[56px] z-[120] w-[280px] overflow-hidden rounded-[22px] border border-[#d9e2f1] bg-white text-[#1a1a1a] shadow-[0_22px_50px_rgba(0,0,0,0.18)]"
              >
                <div className="border-b border-[#eef3fb] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar?.url || defaultAvatar}
                      alt="avatar"
                      className="h-12 w-12 rounded-full border border-[#d9e2f1] "
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-[#10357b]">
                        {user?.full_name || "Admin"}
                      </span>
                      <span className="block truncate text-[13px] text-[#6b7a99]">
                        {user?.email || ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 p-3">
                  <Link
                    to={path.profile}
                    onClick={() => setOpenMenu(false)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#003b95] transition hover:border-[#bfd3f6] hover:bg-[#eef5ff]"
                  >
                    Hồ sơ cá nhân
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full cursor-pointer rounded-xl bg-primary-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="container-custom py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminTemplate;
