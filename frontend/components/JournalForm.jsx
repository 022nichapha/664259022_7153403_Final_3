import { useState } from "react";

const initialForm = {
  title: "",
  publisher: "",
  category: "วิชาการ",
  publishedDate: "",
  description: "",
  status: true,
};

export default function JournalForm({ initialData, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() =>
    initialData
      ? {
          title: initialData.title,
          publisher: initialData.publisher,
          category: initialData.category,
          publishedDate: initialData.publishedDate,
          description: initialData.description,
          status: initialData.status,
        }
      : initialForm,
  );
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleaned = {
      ...form,
      title: form.title.trim(),
      publisher: form.publisher.trim(),
      description: form.description.trim(),
    };

    if (
      !cleaned.title ||
      !cleaned.publisher ||
      !cleaned.category ||
      !cleaned.publishedDate ||
      !cleaned.description
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (
      cleaned.title.length > 150 ||
      cleaned.publisher.length > 100 ||
      cleaned.description.length > 2000
    ) {
      setError("กรุณาตรวจสอบความยาวของข้อมูล");
      return;
    }

    setError("");

    try {
      await onSave(cleaned);
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(", ") ||
          err.response?.data?.message ||
          "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    }
  }

  return (
    <form className="journal-form" onSubmit={handleSubmit}>
      <h2>{initialData ? "แก้ไขวารสาร" : "เพิ่มวารสารใหม่"}</h2>

      <label htmlFor="title">ชื่อวารสาร</label>
      <input
        id="title"
        name="title"
        value={form.title}
        onChange={handleChange}
        maxLength={150}
        required
      />

      <label htmlFor="publisher">ผู้จัดพิมพ์</label>
      <input
        id="publisher"
        name="publisher"
        value={form.publisher}
        onChange={handleChange}
        maxLength={100}
        required
      />

      <label htmlFor="category">หมวดหมู่</label>
      <select
        id="category"
        name="category"
        value={form.category}
        onChange={handleChange}
        required
      >
        <option value="วิชาการ">วิชาการ</option>
        <option value="วิจัย">วิจัย</option>
        <option value="ทั่วไป">ทั่วไป</option>
      </select>

      <label htmlFor="publishedDate">วันที่เผยแพร่</label>
      <input
        id="publishedDate"
        type="date"
        name="publishedDate"
        value={form.publishedDate}
        onChange={handleChange}
        required
      />

      <label htmlFor="description">รายละเอียด</label>
      <textarea
        id="description"
        name="description"
        value={form.description}
        onChange={handleChange}
        maxLength={2000}
        rows={4}
        required
      />

      <label className="status-label">
        <input
          type="checkbox"
          name="status"
          checked={form.status}
          onChange={handleChange}
        />
        เผยแพร่ (ไม่เลือก = ฉบับร่าง)
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>

        <button type="button" className="secondary" onClick={onCancel}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
