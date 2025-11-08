import { Router } from "express";
import {
  autenticateJWT,
  fetchScore,
  login,
  removeAccount,
  signup,
  updateScore,
} from "../controllers/UserController";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/removeAccount", autenticateJWT, removeAccount);

router.post("/updateScore", autenticateJWT, updateScore);

router.post("/fetchScore", autenticateJWT, fetchScore);

// Protected Route
router.get("/protected", autenticateJWT, (req, res) => {
  res.json({ message: "Authenticated", user: req.user });
});

export default router;
