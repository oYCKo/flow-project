import React, { useState } from 'react';
import axios from 'axios';

const ActivityInput = ({ onSaveSuccess }) => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Token ใหม่ และ ID ตาราง
  const API_URL = "https://api.baserow.io/api/database/rows/table/717286/?user_field_names=true";
  const API_TOKEN = "Token 98AKl7obBru7KCXaMa6GeXe4ezSvlPBW"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post(
        API_URL,
        {
          // ✅ แก้ให้ตรงกับหัวตารางใน Baserow แล้ว (สำคัญมาก)
          "Name": eventName,
          "รายละเอียดงาน": description
        },
        {
          headers: {
            Authorization: API_TOKEN,
            "Content-Type": "application/json"
          }
        }
      );
      
      alert('✅ บันทึกข้อมูลสำเร็จ!');
      setEventName('');
      setDescription('');
      
      // ถ้ามีฟังก์ชันปิด Popup ส่งมา ให้เรียกใช้
      if (onSaveSuccess) {
        onSaveSuccess();
      }

    } catch (error) {
      console.error("Full Error:", error);
      const errorMsg = error.response?.data?.error || JSON.stringify(error.response?.data);
      alert(`❌ บันทึกไม่ได้: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
        <div>
          <label style={{fontWeight:'bold'}}>ชื่อกิจกรรม:</label>
          <input 
            type="text" 
            value={eventName} 
            onChange={(e) => setEventName(e.target.value)} 
            placeholder="ตัวอย่าง: Global Game Jam 2026" 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }} 
          />
        </div>
        
        <div>
          <label style={{fontWeight:'bold'}}>รายละเอียดงาน:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="ใส่รายละเอียดที่นี่..." 
            rows="4" 
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }} 
          />
        </div>

        <button type="submit" disabled={isSaving} style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
          {isSaving ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
        </button>
      </div>
    </form>
  );
};

export default ActivityInput;