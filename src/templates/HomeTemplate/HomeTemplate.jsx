import React from "react";
import Header from "./Header/Header";
import { Outlet } from "react-router-dom";
import Footer from "./Footer/Footer";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";
import AiStayAssistant from "../../pages/HomePage/components/AiStayAssistant/AiStayAssistant";

const HomeTemplate = () => {
  return (
    <>
      <Header />
      <ScrollToTop />
      <Outlet />
      <AiStayAssistant />
      <Footer />
    </>
  );
};

export default HomeTemplate;
