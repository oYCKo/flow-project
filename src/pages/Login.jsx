import React, { useState, useEffect } from "react";
// 🔴 1. เพิ่ม import useNavigate
import { useNavigate } from "react-router-dom"; 
import { Button, Form, Spinner, Alert, Container, Card } from "react-bootstrap";
import axios from "axios"; 

const AUTH_TABLE_ID = "733326"; 
const API_TOKEN = "Token 98AKl7obBru7KCXaMa6GeXe4ezSvlPBW"; 
const LIST_USERS_URL = `https://api.baserow.io/api/database/rows/table/${AUTH_TABLE_ID}/`;

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 🔴 2. ประกาศตัวแปร navigate
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError(null);

    try {
      const listConfig = {
        method: "get",
        url: `${LIST_USERS_URL}?user_field_names=true&filter__user_name__equal=${userName}`,
        headers: { Authorization: API_TOKEN }
      };

      const response = await axios.request(listConfig);

      if (response.data.results.length === 0) {
        setError("ไม่พบชื่อผู้ใช้นี้ในระบบ");
        setLoading(false);
        return;
      }

      const user = response.data.results[0];

      if (String(user.Password).trim() === String(password).trim()) {
        localStorage.setItem("auth_user_id", user.id); 
        localStorage.setItem("user", JSON.stringify(user)); 
        
        // 🔴 3. เปลี่ยนจาก window.location.href เป็น navigate
        // window.location.href = "/home";  <-- ลบบรรทัดนี้ทิ้ง
        navigate("/home"); // <-- ใช้บรรทัดนี้แทน
        
      } else {
        setError("รหัสผ่านไม่ถูกต้อง");
        setLoading(false);
      }

    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
      setLoading(false);
    }
  };

  return (
    // ... (ส่วน return เหมือนเดิม ไม่ต้องแก้) ...
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: "#0a0a0f" }}>
      <Card style={{ width: '25rem', backgroundColor: '#1a1a24', border: '1px solid #333', color: '#e0e0e0' }}>
        <Card.Body className="p-4">
          <Card.Title as="h3" className="text-center mb-4" style={{ color: '#00cfff' }}>เข้าสู่ระบบ (FLOW)</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อผู้ใช้</Form.Label>
              <Form.Control type="text" value={userName} onChange={(e) => setUserName(e.target.value)} style={{ backgroundColor: '#0a0a0f', color: '#fff', borderColor: '#333' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>รหัสผ่าน</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ backgroundColor: '#0a0a0f', color: '#fff', borderColor: '#333' }} />
            </Form.Group>
            <div className="d-grid gap-2 mt-4">
              <Button variant="primary" type="submit" disabled={loading} style={{ backgroundColor: '#0066cc', borderColor: '#0066cc' }}>
                {loading ? <Spinner animation="border" size="sm" /> : "เข้าสู่ระบบ"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}