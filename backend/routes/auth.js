const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const authController = require("../controllers/authController");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Geçersiz veri",
      errors: errors.array(),
    });
  }
  next();
};

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Yetkilendirme token'ı bulunamadı",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Geçersiz token",
    });
  }
};

// Öğrenci Kayıt
router.post(
  "/student/register",
  [
    body("email").isEmail().withMessage("Geçerli bir e-posta adresi girin"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Şifre en az 6 karakter olmalı"),
    body("firstName").notEmpty().withMessage("Ad gerekli"),
    body("lastName").notEmpty().withMessage("Soyad gerekli"),
    body("studentNumber").notEmpty().withMessage("Okul numarası gerekli"),
  ],
  validate,
  authController.studentRegister
);

// Öğrenci Giriş
router.post(
  "/student/login",
  [
    body("studentNumber").notEmpty().withMessage("Okul numarası gerekli"),
    body("password").notEmpty().withMessage("Şifre gerekli"),
  ],
  validate,
  authController.studentLogin
);

// Akademisyen Kayıt
router.post(
  "/academician/register",
  [
    body("email").isEmail().withMessage("Geçerli bir e-posta adresi girin"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Şifre en az 6 karakter olmalı"),
    body("firstName").notEmpty().withMessage("Ad gerekli"),
    body("lastName").notEmpty().withMessage("Soyad gerekli"),
    body("username").notEmpty().withMessage("Kullanıcı adı gerekli"),
  ],
  validate,
  authController.academicianRegister
);

// Akademisyen Giriş
router.post(
  "/academician/login",
  [
    body("username").notEmpty().withMessage("Kullanıcı adı gerekli"),
    body("password").notEmpty().withMessage("Şifre gerekli"),
  ],
  validate,
  authController.academicianLogin
);

// Kullanıcı Bilgileri (Korumalı)
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
