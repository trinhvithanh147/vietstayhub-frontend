import { Route, Routes } from "react-router-dom";
import HomeTemplate from "../templates/HomeTemplate/HomeTemplate";
import { path } from "./path";
import AuthTemplate from "../templates/AuthTemplate/AuthTemplate";
import Register from "../templates/AuthTemplate/Register/Register";
import Login from "../templates/AuthTemplate/Login/Login";
import LoginSuccess from "../templates/AuthTemplate/Login/LoginSuccess";
import ForgotPassword from "../templates/AuthTemplate/ForgotPassword/ForgotPassword";
import HomePage from "../pages/HomePage/HomePage";
import PropertyCard from "../pages/HomePage/components/PropertyCard/PropertyCard";

import PropertiesByCity from "../pages/HomePage/components/PropertiesByCity/CityProperties";
import UserProfile from "../pages/ProfilePage/UserProfile";
import AdminTemplate from "../templates/AdminTemplate/AdminTemplate";
import AdminPage from "../pages/AdminPage/AdminPage";

import HostDashboardPage from "../pages/HomePage/components/HostDashboardPage/HostDashboardPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={path.homePage} element={<HomeTemplate />}>
        <Route path={path.homePage} element={<HomePage />} />
      </Route>
      <Route path={path.adminPage} element={<AdminTemplate />}>
        <Route index element={<AdminPage />} />
      </Route>
      <Route element={<AuthTemplate />}>
        <Route path={path.register} element={<Register />} />
        <Route path={path.login} element={<Login />} />
        <Route path={path.forgotpassword} element={<ForgotPassword />} />
      </Route>
      <Route path={path.city} element={<PropertiesByCity />} />
      <Route path={path.hostDashboardPage} element={<HostDashboardPage />} />
      <Route path={path.profile} element={<UserProfile />} />
      <Route path={path.loginSuccess} element={<LoginSuccess />} />
      <Route path={path.item} element={<PropertyCard />} />
    </Routes>
  );
};

export default AppRoutes;
