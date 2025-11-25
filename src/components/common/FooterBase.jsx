import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

function FooterComponent() {
  return (
    <Navbar data-bs-theme="dark" fixed="bottom" className="navbar-tech-glow">
      <Container>
        <Navbar.Brand href="/home">Dhurakij pundit university</Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default FooterComponent;