import React from "react";
import NavbarBase from "../common/NavbarBase";
import FooterBase from "../common/FooterBase";
import Container from "react-bootstrap/Container";
export default function MainLayout({ children }) {
  return (
    <div className="app">
      <NavbarBase />
      {/* vvv ลบ className "light-page-container" ออกแล้ว vvv */}
      <Container className="main-content-container">
        {children}
      </Container>
      <FooterBase />
    </div>
  );
}