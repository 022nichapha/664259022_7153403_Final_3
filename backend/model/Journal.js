const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Journal = sequelize.define(
  "Journal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "กรุณากรอกชื่อวารสาร",
        },
        len: {
          args: [1, 150],
          msg: "ชื่อวารสารต้องมี 1-150 ตัวอักษร",
        },
      },
    },

    publisher: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "กรุณากรอกชื่อผู้จัดพิมพ์",
        },
        len: {
          args: [1, 100],
          msg: "ชื่อผู้จัดพิมพ์ต้องมี 1-100 ตัวอักษร",
        },
      },
    },

    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [["วิชาการ", "วิจัย", "ทั่วไป"]],
          msg: "หมวดหมู่ไม่ถูกต้อง",
        },
      },
    },

    publishedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: "วันที่เผยแพร่ไม่ถูกต้อง",
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "กรุณากรอกรายละเอียด",
        },
        len: {
          args: [1, 2000],
          msg: "รายละเอียดต้องมี 1-2,000 ตัวอักษร",
        },
      },
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "journals",
    timestamps: true,
  },
);

module.exports = Journal;
