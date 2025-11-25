import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap"; 
import { Link } from "react-router-dom";

function NavbarComponent() {
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState(""); 
  const [userType, setUserType] = useState(""); 

  function getUser() { 
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setFirstName(parsedUser.first_name || "User"); 
        setLastName(parsedUser.last_name || "");
        
        const typeValue = parsedUser.type?.value || parsedUser.type;
        setUserType(String(typeValue)); 
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }

  const handleLogout = () => { 
    localStorage.clear(); 
    window.location.href = "/"; 
  };

  useEffect(() => { 
    getUser();
  }, []); 

  const getUserTypeLabel = () => {
    if (userType === "1") return "พนักงาน";
    if (userType === "2") return "อาจารย์";
    if (userType === "3") return "นักศึกษา"; 
    return "User";
  };

  // --- Custom Styles ---
  const navbarStyle = {
    background: 'rgba(10, 10, 15, 0.85)', // สีดำเข้มโปร่งแสง
    backdropFilter: 'blur(20px)',         // เบลอพื้นหลังแบบกระจกฝ้า
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 207, 255, 0.2)', // เส้นขอบนีออนบางๆ
    boxShadow: '0 0 20px rgba(0, 207, 255, 0.1)', // เรืองแสงเล็กน้อย
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '0.5rem 1rem'
  };

  const brandStyle = {
    fontWeight: '900',
    fontSize: '1.5rem',
    background: 'linear-gradient(to right, #00cfff, #00ff99)', // ไล่สีนีออน
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    textShadow: '0 0 10px rgba(0, 207, 255, 0.5)'
  };

  const navLinkStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    fontSize: '0.95rem',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    margin: '0 5px'
  };

  // สไตล์สำหรับชื่อผู้ใช้แบบแคปซูล
  const userCapsuleStyle = {
    background: 'linear-gradient(135deg, rgba(0, 207, 255, 0.1), rgba(0, 255, 153, 0.05))', 
    padding: '6px 16px', 
    borderRadius: '50px',
    border: '1px solid rgba(0, 207, 255, 0.3)',
    color: '#00cfff',
    fontWeight: '600',
    fontSize: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  };

  return (
    <Navbar collapseOnSelect expand="lg" variant="dark" style={navbarStyle}>
      <Container>
        <Navbar.Brand as={Link} to="/home" style={brandStyle}>
          FLOW <span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'rgba(255,255,255,0.5)', WebkitTextFillColor: 'initial', textShadow: 'none', marginLeft: '5px' }}>SYSTEM</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="responsive-navbar-nav" style={{ border: 'none', outline: 'none' }}>
            <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </Navbar.Toggle>
        
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto my-3 my-lg-0">
            <Nav.Link as={Link} to="/home" style={navLinkStyle} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
              หน้าหลัก
            </Nav.Link>
            
            <Nav.Link as={Link} to="/customers" style={navLinkStyle} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
              บริหารจัดการ
            </Nav.Link>

            <NavDropdown 
              title={<span style={{...navLinkStyle, margin: 0, padding: 0}}>ข้อมูลกิจกรรม</span>} 
              id="collasible-nav-dropdown" 
              menuVariant="dark"
              style={{ margin: '0 5px' }}
            >
              {(userType === "1" || userType === "2" || !userType) && (
                <NavDropdown.Item as={Link} to="/products/อาจารย์และบุคลากร">อาจารย์และบุคลากร</NavDropdown.Item>
              )}
              {(userType === "3" || !userType) && (
                <NavDropdown.Item as={Link} to="/products/นักศึกษา">นักศึกษา</NavDropdown.Item>
              )}
            </NavDropdown>

            <Nav.Link as={Link} to="/about" style={navLinkStyle} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
              เกี่ยวกับ
            </Nav.Link>
          </Nav>

          <Nav>
            <NavDropdown 
              title={
                <div style={userCapsuleStyle}>
                  <span>{firstName}</span>
                  <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.3)' }}></span>
                  <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{getUserTypeLabel()}</small>
                </div>
              } 
              id="collasible-nav-dropdown-user"
              align="end"
              menuVariant="dark"
              style={{ marginTop: '5px' }}
            >
              <NavDropdown.Header style={{ color: '#00cfff', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Account</NavDropdown.Header>
              <NavDropdown.Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              <NavDropdown.Item onClick={handleLogout} style={{ color: '#ff4d4d', fontWeight: '600' }}>
                ออกจากระบบ
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default NavbarComponent;