import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, Container, Button, Modal, Form, Row, Col, Spinner } from "react-bootstrap";

// --- Configuration ---
const API_TOKEN = "Token 98AKl7obBru7KCXaMa6GeXe4ezSvlPBW";
const BASE_URL = "https://api.baserow.io/api/database/rows/table/731472";

export default function Products() {
  const { type } = useParams(); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);
  const [userType, setUserType] = useState(""); 

  // State สำหรับ Form
  const [event, setEvent] = useState({ id: 0, Name: "", Register: "", product_image: "" });

  // แปลง URL Param เป็น ID (1=อาจารย์, 2=นักศึกษา)
  const getTypeId = (t) => (t === "นักศึกษา" ? 2 : 1);

  // --- 1. เช็คสิทธิ์ User ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            const typeValue = parsedUser.type?.value || parsedUser.type;
            setUserType(String(typeValue));
        } catch(e) {}
    }
    listEvents();
  }, [type]);

  const isStudent = userType === "3"; // Type 3 คือนักศึกษา (ไม่มีสิทธิ์แก้)

  // --- 2. ดึงข้อมูล ---
  function listEvents() {
    setLoading(true);
    // filter__Type__equal ใช้กรองข้อมูลตามคอลัมน์ Type
    axios.get(`${BASE_URL}/?user_field_names=true&filter__Type__equal=${getTypeId(type)}`, { headers: { Authorization: API_TOKEN } })
      .then((res) => { setEvents(res.data.results); })
      .catch(err => console.error("Load Error:", err))
      .finally(() => setLoading(false));
  }

  // --- 3. บันทึกข้อมูล (Create / Update) ---
  async function handleSave() {
    if (!event.Name) { alert("กรุณากรอกชื่อกิจกรรม"); return; }
    
    // 🛡️ ป้องกันการใส่รูป Base64 (โค้ดยาวเกินไป)
    if (event.product_image && event.product_image.length > 500) {
        alert("❌ ไม่สามารถบันทึกได้: URL รูปภาพยาวเกินไป!\n\nกรุณาใช้ 'ลิงก์รูปภาพ' (เช่น https://example.com/pic.jpg) แทนการวางโค้ดรูปภาพโดยตรง");
        return;
    }

    setSaving(true);
    try {
      // ✅ สร้าง Payload (แก้ไขตรง Type ให้เป็น String ตามชนิดคอลัมน์ใน Baserow)
      const payload = {
        "Name": event.Name,
        "product_image": event.product_image, 
        "Register": event.Register,
        "Type": String(getTypeId(type)) // 📌 แปลงเป็น String และห้ามใส่ []
      };

      console.log("Sending Payload:", payload);

      if (event.id > 0) {
        // Update
        await axios.patch(`${BASE_URL}/${event.id}/?user_field_names=true`, payload, { headers: { Authorization: API_TOKEN } });
      } else {
        // Create
        await axios.post(`${BASE_URL}/?user_field_names=true`, payload, { headers: { Authorization: API_TOKEN } });
      }

      alert("✅ บันทึกข้อมูลสำเร็จ!");
      setShow(false);
      listEvents(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Save Error:", error.response);
      
      // แกะรายละเอียด Error มาแสดง
      let errorDetail = error.response?.data?.error || error.message;
      if (error.response?.data?.detail) {
          errorDetail = JSON.stringify(error.response.data.detail, null, 2);
      }
      
      alert(`❌ บันทึกไม่สำเร็จ!\n\nรายละเอียด: ${errorDetail}`);
    } finally {
      setSaving(false);
    }
  }

  // --- 4. ลบข้อมูล ---
  function deleteEvent(id) { 
      if(window.confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) {
        axios.delete(`${BASE_URL}/${id}/`, { headers: { Authorization: API_TOKEN } })
             .then(() => {
                 alert("ลบข้อมูลเรียบร้อย");
                 listEvents();
             })
             .catch(() => alert("เกิดข้อผิดพลาดในการลบ"));
      }
  }

  // --- Helper Functions สำหรับ Modal ---
  const handleClose = () => setShow(false);
  const handleShow = () => { setEvent({ id: 0, Name: "", Register: "", product_image: "" }); setShow(true); };
  const handleEdit = (item) => { 
      // ดึงข้อมูลมาใส่ Form (เช็คเผื่อ product_image เป็น null)
      setEvent({ 
          id: item.id, 
          Name: item.Name, 
          Register: item.Register || "", 
          product_image: item.product_image || "" 
      }); 
      setShow(true); 
  };

  if (loading) return <Spinner animation="border" className="mt-5 text-primary" />;

  return (
    <Container className="p-4">
      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col><h1 style={{ color: '#00cfff' }}>กิจกรรม: {type}</h1></Col>
        <Col className="text-end">
          {/* ปุ่มเพิ่ม (ซ่อนถ้านักศึกษา) */}
          {!isStudent && (
             <Button variant="primary" onClick={handleShow} style={{ backgroundColor: '#0066cc', borderColor: '#0066cc' }}>
               + เพิ่มกิจกรรมใหม่
             </Button>
          )}
        </Col>
      </Row>
      
      {/* Grid แสดงการ์ด */}
      <Row>
        {events.length === 0 && <div className="text-center text-muted mt-5">ไม่พบข้อมูลกิจกรรม</div>}
        
        {events.map((item) => (
          <Col sm={12} md={6} lg={3} key={item.id} className="mb-4">
            <Card className="h-100" style={{ backgroundColor: '#1a1a24', border: '1px solid #333', color: '#e0e0e0' }}>
              <div style={{ height: '200px', overflow: 'hidden', borderBottom: '1px solid #333', position: 'relative' }}>
                <Card.Img 
                    variant="top" 
                    src={item.product_image || "https://placehold.co/600x400?text=No+Image"} 
                    style={{ width: '100%', height: '100%', objectFit: "cover" }} 
                    onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Image+Error"; }}
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title style={{ color: '#00cfff', fontSize: '1.1rem', minHeight: '3rem' }}>{item.Name}</Card.Title>
                
                <div className="mt-auto pt-3">
                    {/* ปุ่มลงทะเบียน (เห็นทุกคน) */}
                    <div className="d-grid mb-2">
                        <Button variant="success" href={item.Register} target="_blank" disabled={!item.Register}>
                            {item.Register ? "ลงทะเบียน" : "รอติดตาม"}
                        </Button>
                    </div>

                    {/* ปุ่มจัดการ (ซ่อนถ้านักศึกษา) */}
                    {!isStudent && (
                        <div className="d-flex gap-2">
                            <Button variant="warning" size="sm" className="flex-fill" onClick={() => handleEdit(item)}>แก้ไข</Button>
                            <Button variant="danger" size="sm" className="flex-fill" onClick={() => deleteEvent(item.id)}>ลบ</Button>
                        </div>
                    )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Modal เพิ่ม/แก้ไข */}
      <Modal show={show} onHide={handleClose} centered contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white">
            <Modal.Title>{event.id > 0 ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label>ชื่อกิจกรรม <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="ใส่ชื่อกิจกรรม" 
                    value={event.Name} 
                    onChange={e => setEvent({...event, Name: e.target.value})} 
                    autoFocus 
                />
            </Form.Group>
            
            <Form.Group className="mb-3">
                <Form.Label>ลิงก์รูปภาพ (URL)</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="https://example.com/image.jpg" 
                    value={event.product_image} 
                    onChange={e => setEvent({...event, product_image: e.target.value})} 
                />
                <Form.Text className="text-muted" style={{ fontSize: '0.8rem' }}>
                    * ต้องใช้ลิงก์รูปภาพเท่านั้น (คลิกขวาที่รูป > Copy Image Address) ห้ามวางรูปโดยตรง
                </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
                <Form.Label>ลิงก์ลงทะเบียน</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="https://forms.google.com/..." 
                    value={event.Register} 
                    onChange={e => setEvent({...event, Register: e.target.value})} 
                />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>ยกเลิก</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "⏳ กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}