import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, ProgressBar, Badge } from "react-bootstrap";

const BASE_URL = "https://api.baserow.io/api/database/rows/table/731547";
const API_TOKEN = "Token 98AKl7obBru7KCXaMa6GeXe4ezSvlPBW"; 

export default function Stats() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    // ดึงข้อมูลทั้งหมดมาคำนวณ
    axios.get(`${BASE_URL}/?user_field_names=true`, { headers: { Authorization: API_TOKEN } })
      .then((res) => {
        const data = res.data.results;
        setEvents(data);
        
        // คำนวณสถิติ
        const total = data.length;
        
        // เช็ค Status (รองรับทั้งแบบ Object และ ID)
        const approved = data.filter(e => e.Status?.id === 2 || e.Status === 2).length;
        const pending = data.filter(e => e.Status?.id === 1 || e.Status === 1).length;
        const rejected = data.filter(e => e.Status?.id === 3 || e.Status === 3).length;

        setStats({ total, approved, pending, rejected });
      })
      .catch(err => console.error(err));
  }, []);

  // คำนวณเปอร์เซ็นต์
  const approvedPercent = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
  const pendingPercent = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const rejectedPercent = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;

  return (
    <Container className="p-4">
      <h1 className="mb-4">📊 แดชบอร์ดภาพรวม (Dashboard)</h1>

      {/* 1. การ์ดสรุปตัวเลข */}
      <Row className="mb-4 text-center">
        <Col md={3}>
          <Card className="bg-dark text-white border-primary mb-3">
            <Card.Body>
              <h3>{stats.total}</h3>
              <p className="mb-0 text-primary">งานทั้งหมด</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-dark text-white border-warning mb-3">
            <Card.Body>
              <h3>{stats.pending}</h3>
              <p className="mb-0 text-warning">รอดำเนินการ</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-dark text-white border-success mb-3">
            <Card.Body>
              <h3>{stats.approved}</h3>
              <p className="mb-0 text-success">อนุมัติแล้ว</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-dark text-white border-danger mb-3">
            <Card.Body>
              <h3>{stats.rejected}</h3>
              <p className="mb-0 text-danger">ต้องแก้ไข</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 2. กราฟแท่งแสดงสัดส่วน */}
      <Card className="mb-4 bg-dark text-white border-secondary">
        <Card.Header>สถานะงานทั้งหมด</Card.Header>
        <Card.Body>
          <ProgressBar style={{ height: '30px', fontSize: '1rem' }}>
            <ProgressBar variant="success" now={approvedPercent} label={`${stats.approved}`} key={1} />
            <ProgressBar variant="warning" now={pendingPercent} label={`${stats.pending}`} key={2} />
            <ProgressBar variant="danger" now={rejectedPercent} label={`${stats.rejected}`} key={3} />
          </ProgressBar>
          <div className="d-flex justify-content-center mt-2 gap-3">
             <small><Badge bg="success">●</Badge> อนุมัติแล้ว</small>
             <small><Badge bg="warning" text="dark">●</Badge> รอดำเนินการ</small>
             <small><Badge bg="danger">●</Badge> ต้องแก้ไข</small>
          </div>
        </Card.Body>
      </Card>

      {/* 3. รายการล่าสุด */}
      <Card className="bg-dark text-white border-secondary">
        <Card.Header>รายการล่าสุด (5 รายการ)</Card.Header>
        <Card.Body>
            {events.slice(0, 5).map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center border-bottom border-secondary py-2">
                    <div>
                        <strong style={{ color: '#00cfff' }}>{item.Name}</strong>
                        <br/>
                        <small className="text-muted">{item.Date ? item.Date.split('T')[0] : 'ไม่ระบุวันที่'}</small>
                    </div>
                    <Badge bg="secondary">
                        {item.Status?.value || "สถานะไม่ระบุ"}
                    </Badge>
                </div>
            ))}
            {events.length === 0 && <p className="text-center text-muted my-3">ไม่มีข้อมูล</p>}
        </Card.Body>
      </Card>

    </Container>
  );
}