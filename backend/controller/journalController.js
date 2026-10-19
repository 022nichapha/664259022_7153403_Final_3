const { Op } = require("sequelize");
const Journal = require("../model/Journal");

const CATEGORIES = ["วิชาการ", "วิจัย", "ทั่วไป"];

const FIELDS = [
  "title",
  "publisher",
  "category",
  "publishedDate",
  "description",
  "status",
];

function validateId(id) {
  return /^\d+$/.test(String(id)) && Number(id) > 0;
}

function validateJournal(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["ข้อมูลต้องอยู่ในรูปแบบ object"];
  }

  for (const field of FIELDS) {
    if (body[field] === undefined || body[field] === null) {
      errors.push(`กรุณาระบุ ${field}`);
    }
  }

  if (errors.length) return errors;

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const publisher =
    typeof body.publisher === "string" ? body.publisher.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (title.length < 1 || title.length > 150) {
    errors.push("ชื่อวารสารต้องมี 1-150 ตัวอักษร");
  }

  if (publisher.length < 1 || publisher.length > 100) {
    errors.push("ผู้จัดพิมพ์ต้องมี 1-100 ตัวอักษร");
  }

  if (!CATEGORIES.includes(body.category)) {
    errors.push("หมวดหมู่ต้องเป็น วิชาการ วิจัย หรือ ทั่วไป");
  }

  if (
    typeof body.publishedDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.publishedDate)
  ) {
    errors.push("วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD");
  } else {
    const date = new Date(`${body.publishedDate}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== body.publishedDate
    ) {
      errors.push("วันที่เผยแพร่ไม่ถูกต้อง");
    }
  }

  if (description.length < 1 || description.length > 2000) {
    errors.push("รายละเอียดต้องมี 1-2,000 ตัวอักษร");
  }

  if (typeof body.status !== "boolean") {
    errors.push("สถานะต้องเป็น true หรือ false");
  }

  return errors;
}

function sendControllerError(error, res, message) {
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "ข้อมูลไม่ถูกต้อง",
      errors: error.errors.map((item) => item.message),
    });
  }

  console.error(error);
  return res.status(500).json({ message });
}

function cleanBody(body) {
  return {
    title: body.title.trim(),
    publisher: body.publisher.trim(),
    category: body.category,
    publishedDate: body.publishedDate,
    description: body.description.trim(),
    status: body.status,
  };
}

// GET /api/journals
// รองรับ ?search=คำค้น&category=วิจัย
exports.getJournals = async (req, res) => {
  try {
    const searchParam = req.query.search ?? "";
    const category = req.query.category ?? "";

    if (typeof searchParam !== "string" || typeof category !== "string") {
      return res.status(400).json({
        message: "search และ category ต้องเป็นข้อความ",
      });
    }

    const search = searchParam.trim();

    if (search.length > 150) {
      return res.status(400).json({
        message: "คำค้นหาต้องมีความยาวไม่เกิน 150 ตัวอักษร",
      });
    }

    const where = {};

    if (search) {
      where.title = {
        [Op.iLike]: `%${search}%`,
      };
    }

    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({
          message: "หมวดหมู่ไม่ถูกต้อง",
        });
      }

      where.category = category;
    }

    const journals = await Journal.findAll({
      where,
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      data: journals,
      total: journals.length,
    });
  } catch (error) {
    return sendControllerError(error, res, "ไม่สามารถอ่านข้อมูลวารสารได้");
  }
};

// GET /api/journals/:id
exports.getJournalById = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        message: "id ต้องเป็นจำนวนเต็มบวก",
      });
    }

    const journal = await Journal.findByPk(req.params.id);

    if (!journal) {
      return res.status(404).json({
        message: "ไม่พบวารสารที่ต้องการ",
      });
    }

    return res.status(200).json({ data: journal });
  } catch (error) {
    return sendControllerError(error, res, "ไม่สามารถอ่านรายละเอียดวารสารได้");
  }
};

// POST /api/journals
exports.createJournal = async (req, res) => {
  try {
    const errors = validateJournal(req.body);

    if (errors.length) {
      return res.status(400).json({
        message: "ข้อมูลไม่ถูกต้อง",
        errors,
      });
    }

    const journal = await Journal.create(cleanBody(req.body));

    return res.status(201).json({
      message: "เพิ่มวารสารสำเร็จ",
      data: journal,
    });
  } catch (error) {
    return sendControllerError(error, res, "ไม่สามารถเพิ่มวารสารได้");
  }
};

// PUT /api/journals/:id
exports.updateJournal = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        message: "id ต้องเป็นจำนวนเต็มบวก",
      });
    }

    const errors = validateJournal(req.body);

    if (errors.length) {
      return res.status(400).json({
        message: "ข้อมูลไม่ถูกต้อง",
        errors,
      });
    }

    const journal = await Journal.findByPk(req.params.id);

    if (!journal) {
      return res.status(404).json({
        message: "ไม่พบวารสารที่ต้องการแก้ไข",
      });
    }

    await journal.update(cleanBody(req.body));

    return res.status(200).json({
      message: "แก้ไขวารสารสำเร็จ",
      data: journal,
    });
  } catch (error) {
    return sendControllerError(error, res, "ไม่สามารถแก้ไขวารสารได้");
  }
};

// DELETE /api/journals/:id
exports.deleteJournal = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        message: "id ต้องเป็นจำนวนเต็มบวก",
      });
    }

    const journal = await Journal.findByPk(req.params.id);

    if (!journal) {
      return res.status(404).json({
        message: "ไม่พบวารสารที่ต้องการลบ",
      });
    }

    await journal.destroy();

    return res.status(200).json({
      message: "ลบวารสารสำเร็จ",
      data: { id: Number(req.params.id) },
    });
  } catch (error) {
    return sendControllerError(error, res, "ไม่สามารถลบวารสารได้");
  }
};
