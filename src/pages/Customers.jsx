import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Button, Modal, Form, Row, Col, Spinner, Alert, Card } from "react-bootstrap";

const BASE_URL = "https://api.baserow.io/api/database/rows/table/731547";
const API_TOKEN = "Token 98AKl7obBru7KCXaMa6GeXe4ezSvlPBW"; 

export default function Customers() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [userType, setUserType] = useState("");

  const [event, setEvent] = useState({ id: 0, Name: "", Date: "", เก็บใบเสร็จ: "" });

  // --- เช็คสิทธิ์จาก LocalStorage ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // ดึง Type ให้ชัวร์ (ไม่ว่าจะมาเป็น Object หรือ String)
        const typeValue = parsedUser.type?.value || parsedUser.type;
        setUserType(String(typeValue)); 
      } catch(e) {}
    }
    listEvents();
  }, []);

  // Type 3 = นักศึกษา
  const isStudent = userType === "3";

  // --- CRUD ---
  function listEvents() {
    setLoading(true);
    axios.get(`${BASE_URL}/?user_field_names=true`, { headers: { Authorization: API_TOKEN } })
      .then((res) => { setEvents(res.data.results); setError(null); })
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }
  function createEvent() {
    const isoDate = event.Date ? new Date(event.Date).toISOString() : null;
    let data = { Name: event.Name, Date: isoDate, เก็บใบเสร็จ: event.เก็บใบเสร็จ };
    axios.post(`${BASE_URL}/?user_field_names=true`, data, { headers: { Authorization: API_TOKEN } })
      .then(() => { setShow(false); listEvents(); })
  }
  function updateEvent(row_id) {
    const isoDate = event.Date ? new Date(event.Date).toISOString() : null;
    let data = { Name: event.Name, Date: isoDate, เก็บใบเสร็จ: event.เก็บใบเสร็จ };
    axios.patch(`${BASE_URL}/${row_id}/?user_field_names=true`, data, { headers: { Authorization: API_TOKEN } })
      .then(() => { setShow(false); listEvents(); })
  }
  function deleteEvent(row_id) {
    if (!window.confirm("ยืนยันการลบ?")) return;
    axios.delete(`${BASE_URL}/${row_id}/`, { headers: { Authorization: API_TOKEN } })
      .then(() => listEvents());
  }

  const handleClose = () => setShow(false);
  const handleShow = () => { setEvent({ id: 0, Name: "", Date: "", เก็บใบเสร็จ: "" }); setShow(true); };
  const handleEdit = (obj) => {
    setEvent({ id: obj.id, Name: obj.Name, Date: obj.Date ? obj.Date.split("T")[0] : "", เก็บใบเสร็จ: obj.เก็บใบเสร็จ });
    setShow(true);
  };

  if (loading) return <Spinner animation="border" className="mt-5" />;

  return (
    <Container className="p-4">
      <Row className="mb-3">
        <Col xs={8}><h1>บริหารจัดการงานอีเว้น</h1></Col>
        <Col xs={4} className="text-end">
          {/* นักศึกษา (Type 3) เพิ่มได้ปกติ */}
          <Button variant="primary" onClick={handleShow}>เพิ่มข้อมูลอีเว้น</Button>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        {events.map((item) => (
          <Col sm={12} md={6} lg={4} key={item.id} className="mb-4">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>{item.Name}</Card.Title>
                <Card.Text>วันที่: {item.Date ? item.Date.split("T")[0] : "-"}</Card.Text>
                <div className="mt-auto">
                  <hr />
                  <Button variant="outline-warning" href={item.เก็บใบเสร็จ} target="_blank" className="w-100 mb-2">เก็บใบเสร็จ</Button>
                  <div className="d-grid gap-2 d-sm-flex">
                    
                    {/* ปุ่มแก้ไข (ทุกคนเห็น) */}
                    <Button variant="warning" onClick={() => handleEdit(item)} className="flex-fill">แก้ไข</Button>

                    {/* ❌ ปุ่มลบ (ซ่อนเฉพาะนักศึกษา Type 3) */}
                    {!isStudent && (
                      <Button variant="danger" onClick={() => deleteEvent(item.id)} className="flex-fill">ลบ</Button>
                    )}

                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>{event.id > 0 ? "แก้ไข" : "เพิ่ม"}</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form.Control className="mb-2" placeholder="ชื่องาน" value={event.Name} onChange={(e) => setEvent({...event, Name: e.target.value})} />
            <Form.Control className="mb-2" type="date" value={event.Date} onChange={(e) => setEvent({...event, Date: e.target.value})} />
            <Form.Control className="mb-2" placeholder="ลิงก์ใบเสร็จ" value={event.เก็บใบเสร็จ} onChange={(e) => setEvent({...event, เก็บใบเสร็จ: e.target.value})} />
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={() => event.id > 0 ? updateEvent(event.id) : createEvent()}>บันทึก</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}