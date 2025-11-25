import React, { useEffect, useState } from 'react';
import { Container, Card, Modal, Form, Button, Row, Col, Spinner, Alert, ListGroup, Badge } from "react-bootstrap";
import { Link } from 'react-router-dom';
import axios from "axios";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import googleCalendarPlugin from '@fullcalendar/google-calendar';

const BASE_URL = "https://api.baserow.io/api/database/rows/table/731547"; 
const API_TOKEN = "Token 98AKl7obBru7KCXaMa6GeXe4ezSvlPBW";

const GOOGLE_CALENDAR_API_KEY = ""; 
const GOOGLE_CALENDAR_ID = ""; 

const getStatusColor = (statusValue) => {
  switch (statusValue) {
    case "อนุมัติแล้ว": return "#28a745";
    case "ต้องแก้ไข": return "#dc3545";
    default: return "#ffc107";
  }
};

const formatToDMY = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) { return dateString; }
};

const parseDMY = (dateString) => {
  if (!dateString || dateString.includes('-')) return dateString; 
  const parts = dateString.split('/');
  if (parts.length === 3) { return `${parts[2]}-${parts[1]}-${parts[0]}`; }
  return dateString; 
};

export default function Home() {
  const [baserowEvents, setBaserowEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [userType, setUserType] = useState(""); 
  
  // State สำหรับ Popup แจ้งเตือน
  const [showReminder, setShowReminder] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState({
    id: 0, Name: "", Date: "", EndDate: "", File: "", Status: 1,
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleInputChange = (field, value) => {
    const finalValue = (field === 'Status') ? parseInt(value) : value;
    setSelectedEvent((prev) => ({ ...prev, [field]: finalValue, }));
  };

  const resetEventForm = (dateStr = null) => {
    const formattedDate = dateStr ? formatToDMY(dateStr) : "";
    setSelectedEvent({ id: 0, Name: "", Date: formattedDate, EndDate: formattedDate, File: "", Status: 1, });
  };

  function listEvents() {
    setLoading(true);
    let config = { method: "get", url: `${BASE_URL}/?user_field_names=true`, headers: { Authorization: API_TOKEN }, };
    axios.request(config)
      .then((response) => {
        const data = response.data.results;
        
        // แปลงข้อมูลสำหรับปฏิทิน
        const mappedEvents = data.map(item => ({
          id: item.id,
          title: item.Name,
          start: item.Date,
          end: item.EndDate, 
          backgroundColor: getStatusColor(item.Status?.value),
          borderColor: getStatusColor(item.Status?.value),
          extendedProps: item 
        }));
        setBaserowEvents(mappedEvents);

        // 🔥 เช็คการแจ้งเตือนกิจกรรมใกล้ถึงวัน (ภายใน 3 วัน)
        checkUpcomingEvents(data);

        setError(null);
      })
      .catch((error) => { console.log(error); setError("เกิดข้อผิดพลาดในการโหลดข้อมูลอีเว้น"); })
      .finally(() => { setLoading(false); });
  }

  // ฟังก์ชันเช็คกิจกรรมใกล้ถึงกำหนด
  const checkUpcomingEvents = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // เคลียร์เวลาให้เหลือแค่วันที่

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3); // กำหนดล่วงหน้า 3 วัน

    const upcoming = events.filter(event => {
      if (!event.Date) return false;
      const eventDate = new Date(event.Date);
      eventDate.setHours(0, 0, 0, 0);
      
      // เงื่อนไข: วันงานต้องมากกว่าหรือเท่ากับวันนี้ และ ไม่เกิน 3 วันข้างหน้า
      return eventDate >= today && eventDate <= threeDaysFromNow;
    });

    if (upcoming.length > 0) {
      setUpcomingEvents(upcoming);
      setShowReminder(true); // เปิด Popup แจ้งเตือน
    }
  };

  const handleFormCreate = () => {
      if (selectedEvent.Name.length <= 0) { alert("กรุณากรอกชื่องาน"); return false; }
      const isoStartDate = parseDMY(selectedEvent.Date) ? new Date(parseDMY(selectedEvent.Date)).toISOString() : null;
      const isoEndDate = (parseDMY(selectedEvent.EndDate) && parseDMY(selectedEvent.EndDate) !== parseDMY(selectedEvent.Date)) ? new Date(parseDMY(selectedEvent.EndDate)).toISOString() : null;

      let data = { Name: selectedEvent.Name, Date: isoStartDate, EndDate: isoEndDate, File: selectedEvent.File ? [{ "url": selectedEvent.File }] : [], Status: selectedEvent.Status, };
      let config = { method: "post", url: `${BASE_URL}/?user_field_names=true`, headers: { Authorization: API_TOKEN }, data: data, };
      axios.request(config).then(() => { setShow(false); listEvents(); setError(null); }).catch(() => setError("เกิดข้อผิดพลาด"));
  }

  const handleFormUpdate = (eventId) => {
      const isoStartDate = parseDMY(selectedEvent.Date) ? new Date(parseDMY(selectedEvent.Date)).toISOString() : null;
      const isoEndDate = (parseDMY(selectedEvent.EndDate) && parseDMY(selectedEvent.EndDate) !== parseDMY(selectedEvent.Date)) ? new Date(parseDMY(selectedEvent.EndDate)).toISOString() : null;
      let data = { Name: selectedEvent.Name, Date: isoStartDate, EndDate: isoEndDate, File: selectedEvent.File ? [{ "url": selectedEvent.File }] : [], Status: selectedEvent.Status, };
      
      let config = { method: "patch", url: `${BASE_URL}/${eventId}/?user_field_names=true`, headers: { Authorization: API_TOKEN }, data: data, };
      axios.request(config).then(() => { setShow(false); listEvents(); setError(null); }).catch(() => setError("เกิดข้อผิดพลาด"));
  }

  function deleteEvent(row_id) {
    const confirmDelete = window.confirm(`คุณต้องการลบข้อมูลของ ${selectedEvent.Name} ใช่หรือไม่?`);
    if (!confirmDelete) return;
    let config = { method: "delete", url: `${BASE_URL}/${row_id}/`, headers: { Authorization: API_TOKEN }, };
    axios.request(config).then(() => { setShow(false); listEvents(); }).catch(() => setError("เกิดข้อผิดพลาดในการลบข้อมูล"));
  }

  const handleDateClick = (arg) => { resetEventForm(arg.dateStr); handleShow(); };
  const handleEventClick = (arg) => {
    if (arg.event.source?.id === 'google') return;
    const obj = arg.event.extendedProps;
    setSelectedEvent({
      id: obj.id, Name: obj.Name || "", Date: formatToDMY(obj.Date), EndDate: formatToDMY(obj.EndDate),
      File: obj.File && obj.File.length > 0 ? obj.File[0].url : "", Status: obj.Status?.id || 1,
    });
    handleShow();
  };

  useEffect(() => { 
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserType(String(parsedUser.type?.value || parsedUser.type || ""));
      }
      listEvents(); 
  }, []);

  if (loading) return <Spinner animation="border" className="mt-5" />;

  const isStudent = userType === "3";

  return (
    <Container className="p-4">
      <Row className="mb-4"><Col className="text-center"><h1 className="mb-3">ยินดีต้อนรับสู่ FLOW</h1></Col></Row>
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="bento-grid">
        <Card className="bento-box-large"><Card.Body className="p-4"><Card.Title as="h3" className="mb-3">ปฏิทินกิจกรรม</Card.Title>
            <FullCalendar plugins={[ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, rrulePlugin, googleCalendarPlugin ]} googleCalendarApiKey={GOOGLE_CALENDAR_API_KEY} eventSources={[{ events: baserowEvents, color: 'blue' }, { id: 'google', googleCalendarId: GOOGLE_CALENDAR_ID, color: '#009688', textColor: 'white' }]} initialView="dayGridMonth" headerToolbar={{ left: "title", center: "", right: "dayGridMonth,listWeek prev,next" }} locale="th" height="auto" editable={true} selectable={true} dateClick={handleDateClick} eventClick={handleEventClick} />
        </Card.Body></Card>
        <Card><Card.Body className="text-center p-4"><Card.Title as="h3">บริหารจัดการ (Admin)</Card.Title><Button as={Link} to="/customers" variant="primary">ไปหน้าบริหารจัดการ</Button></Card.Body></Card>
        <Card><Card.Body className="text-center p-4"><Card.Title as="h3">กิจกรรม (Event)</Card.Title><Button as={Link} to="/products/อาจารย์และบุคลากร" variant="outline-info">ดูกิจกรรมทั้งหมด</Button></Card.Body></Card>
        <Card><Card.Body className="text-center p-4"><Card.Title as="h3">เกี่ยวกับระบบ</Card.Title><Button as={Link} to="/about" variant="outline-secondary">อ่านต่อ</Button></Card.Body></Card>
      </div>

      {/* Modal เพิ่ม/แก้ไขข้อมูล */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton><Modal.Title>{selectedEvent.id > 0 ? "แก้ไขข้อมูลอีเว้น" : "เพิ่มข้อมูลอีเว้นใหม่"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>ชื่องาน</Form.Label><Form.Control type="text" value={selectedEvent.Name} onChange={(e) => handleInputChange("Name", e.target.value)} /></Form.Group>
          <Row><Col><Form.Group className="mb-3"><Form.Label>วันที่เริ่มต้น</Form.Label><Form.Control type="text" placeholder="DD/MM/YYYY" value={selectedEvent.Date} onChange={(e) => handleInputChange("Date", e.target.value)} /></Form.Group></Col><Col><Form.Group className="mb-3"><Form.Label>วันที่สิ้นสุด</Form.Label><Form.Control type="text" placeholder="DD/MM/YYYY" value={selectedEvent.EndDate} onChange={(e) => handleInputChange("EndDate", e.target.value)} /></Form.Group></Col></Row>
          <Form.Group className="mb-3"><Form.Label>ลิงก์ใบเสร็จ</Form.Label><Form.Control type="text" value={selectedEvent.File} onChange={(e) => handleInputChange("File", e.target.value)} /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>สถานะ</Form.Label><Form.Select value={selectedEvent.Status} onChange={(e) => handleInputChange("Status", e.target.value)}><option value="1">รอดำเนินการ</option><option value="2">อนุมัติแล้ว</option><option value="3">ต้องแก้ไข</option></Form.Select></Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {selectedEvent.id > 0 && !isStudent && (
            <Button variant="danger" className="me-auto" onClick={() => deleteEvent(selectedEvent.id)}>ลบ Event นี้</Button>
          )}
          <Button variant="secondary" onClick={handleClose}>ปิด</Button>
          <Button variant="primary" onClick={selectedEvent.id > 0 ? () => handleFormUpdate(selectedEvent.id) : handleFormCreate}>บันทึก</Button>
        </Modal.Footer>
      </Modal>

      {/* 🔥 Modal แจ้งเตือนกิจกรรมใกล้ถึงวัน (Reminder Popup) */}
      <Modal show={showReminder} onHide={() => setShowReminder(false)} centered>
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>🔔 แจ้งเตือน: กิจกรรมใกล้ถึงวันจัดงาน!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">มีกิจกรรมที่กำลังจะเกิดขึ้นภายใน 3 วันนี้:</p>
          <ListGroup variant="flush">
            {upcomingEvents.map((evt, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{evt.Name}</div>
                  <small className="text-muted">📅 {evt.Date ? evt.Date.split('T')[0] : ''}</small>
                </div>
                <Badge bg="primary" pill>
                  {Math.ceil((new Date(evt.Date) - new Date()) / (1000 * 60 * 60 * 24))} วัน
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReminder(false)}>รับทราบ</Button>
          <Button variant="primary" as={Link} to="/customers">ไปจัดการข้อมูล</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}