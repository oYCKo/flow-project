import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <Container className="min-vh-100 d-flex align-items-center">
      <div className="justify-content-center">
        <p>
          <h1>ไม่พบหน้านี้</h1>
        </p>
        <Button as={Link} to="/" variant="primary">
          ไปหน้าหลัก
        </Button>
      </div>
    </Container>
  );
}
