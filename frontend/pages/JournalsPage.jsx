import { useEffect, useState } from "react";
import {
  BookOpen,
  CircleCheck,
  Eye,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
} from "../src/services/journalService";
import JournalForm from "../components/JournalForm";

export default function JournalsPage() {
  const [journals, setJournals] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const publishedCount = journals.filter((journal) => journal.status).length;
  const draftCount = journals.length - publishedCount;

  useEffect(() => {
    let active = true;

    getJournals({ search, category })
      .then((response) => {
        if (active) setJournals(response.data.data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบ Backend",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, category, reloadKey]);

  async function handleSave(data) {
    setSaving(true);
    setNotice("");

    try {
      if (editing) {
        await updateJournal(editing.id, data);
        setNotice("แก้ไขวารสารสำเร็จ");
      } else {
        await createJournal(data);
        setNotice("เพิ่มวารสารสำเร็จ");
      }

      setEditing(null);
      setShowForm(false);
      setLoading(true);
      setReloadKey((key) => key + 1);
    } finally {
      setSaving(false);
    }
  }

  async function handleDetail(id) {
    setError("");
    setNotice("");
    setDetailLoadingId(id);

    try {
      const response = await getJournalById(id);
      setDetail(response.data.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "ไม่สามารถเปิดรายละเอียดวารสารได้",
      );
    } finally {
      setDetailLoadingId(null);
    }
  }

  async function handleDelete(journal) {
    const confirmed = window.confirm(
      `ยืนยันการลบวารสาร "${journal.title}" หรือไม่?`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await deleteJournal(journal.id);
      setNotice("ลบวารสารสำเร็จ");

      if (detail?.id === journal.id) {
        setDetail(null);
      }

      setLoading(true);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.message || "ลบวารสารไม่สำเร็จ");
    }
  }

  function openCreateForm() {
    setEditing(null);
    setDetail(null);
    setShowForm(true);
  }

  function openEditForm(journal) {
    setEditing(journal);
    setDetail(null);
    setShowForm(true);
  }

  function cancelForm() {
    setEditing(null);
    setShowForm(false);
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setLoading(true);
    setError("");
    setNotice("");
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setLoading(true);
    setError("");
  }

  function handleCategoryChange(event) {
    setCategory(event.target.value);
    setLoading(true);
    setError("");
  }

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">JOURNAL MANAGEMENT</p>
          <h1>ระบบจัดการวารสาร</h1>
          <p>จัดการข้อมูลวารสารและสถานะการเผยแพร่</p>
        </div>

        <button onClick={openCreateForm}>
          <Plus size={17} aria-hidden="true" />
          เพิ่มวารสาร
        </button>
      </header>

      <section className="summary-strip" aria-label="สรุปรายการวารสาร">
        <div className="summary-item">
          <span className="summary-icon total">
            <BookOpen size={20} aria-hidden="true" />
          </span>
          <div>
            <span className="summary-label">รายการที่แสดง</span>
            <strong>{journals.length}</strong>
          </div>
        </div>
        <div className="summary-item">
          <span className="summary-icon published-icon">
            <CircleCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <span className="summary-label">เผยแพร่แล้ว</span>
            <strong>{publishedCount}</strong>
          </div>
        </div>
        <div className="summary-item">
          <span className="summary-icon draft-icon">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <span className="summary-label">ฉบับร่าง</span>
            <strong>{draftCount}</strong>
          </div>
        </div>
      </section>

      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}

      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}

      {!showForm && !detail && (
        <>
          <section className="filter-panel">
            <div className="field">
              <label htmlFor="search">ค้นหาชื่อวารสาร</label>
              <input
                id="search"
                placeholder="พิมพ์ชื่อวารสาร..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <div className="field">
              <label htmlFor="filterCategory">หมวดหมู่</label>
              <select
                id="filterCategory"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="">ทุกหมวดหมู่</option>
                <option value="วิชาการ">วิชาการ</option>
                <option value="วิจัย">วิจัย</option>
                <option value="ทั่วไป">ทั่วไป</option>
              </select>
            </div>

            <button className="secondary" onClick={clearFilters}>
              ล้างตัวกรอง
            </button>
          </section>

          <section className="table-panel">
            <h2>รายการวารสาร ({journals.length})</h2>

            {loading ? (
              <p className="empty" role="status" aria-live="polite">
                กำลังโหลดข้อมูล...
              </p>
            ) : journals.length === 0 ? (
              <p className="empty">ไม่พบข้อมูลวารสารที่ตรงกับเงื่อนไข</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>รหัส</th>
                      <th>ชื่อวารสาร</th>
                      <th>ผู้จัดพิมพ์</th>
                      <th>หมวดหมู่</th>
                      <th>วันที่เผยแพร่</th>
                      <th>สถานะ</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {journals.map((journal) => (
                      <tr key={journal.id}>
                        <td>{journal.id}</td>
                        <td>{journal.title}</td>
                        <td>{journal.publisher}</td>
                        <td>{journal.category}</td>
                        <td>{journal.publishedDate}</td>
                        <td>
                          <span
                            className={
                              journal.status ? "badge published" : "badge draft"
                            }
                          >
                            {journal.status ? "เผยแพร่" : "ฉบับร่าง"}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="small"
                              disabled={detailLoadingId === journal.id}
                              onClick={() => handleDetail(journal.id)}
                            >
                              {detailLoadingId === journal.id ? (
                                "กำลังโหลด..."
                              ) : (
                                <>
                                  <Eye size={14} aria-hidden="true" />
                                  ดู
                                </>
                              )}
                            </button>
                            <button
                              className="small secondary"
                              onClick={() => openEditForm(journal)}
                            >
                              <Pencil size={14} aria-hidden="true" />
                              แก้ไข
                            </button>
                            <button
                              className="small danger"
                              onClick={() => handleDelete(journal)}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {showForm && (
        <section className="form-panel">
          <JournalForm
            key={editing?.id ?? "new"}
            initialData={editing}
            onSave={handleSave}
            onCancel={cancelForm}
            saving={saving}
          />
        </section>
      )}

      {detail && (
        <section className="detail-panel">
          <h2>รายละเอียดวารสาร</h2>

          <dl>
            <dt>รหัส</dt>
            <dd>{detail.id}</dd>

            <dt>ชื่อวารสาร</dt>
            <dd>{detail.title}</dd>

            <dt>ผู้จัดพิมพ์</dt>
            <dd>{detail.publisher}</dd>

            <dt>หมวดหมู่</dt>
            <dd>{detail.category}</dd>

            <dt>วันที่เผยแพร่</dt>
            <dd>{detail.publishedDate}</dd>

            <dt>รายละเอียด</dt>
            <dd className="description">{detail.description}</dd>

            <dt>สถานะ</dt>
            <dd>{detail.status ? "เผยแพร่" : "ฉบับร่าง"}</dd>

            <dt>สร้างเมื่อ</dt>
            <dd>{detail.createdAt || "-"}</dd>

            <dt>แก้ไขล่าสุด</dt>
            <dd>{detail.updatedAt || "-"}</dd>
          </dl>

          <div className="actions">
            <button onClick={() => openEditForm(detail)}>แก้ไขรายการนี้</button>
            <button className="secondary" onClick={() => setDetail(null)}>
              กลับไปหน้ารายการ
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
