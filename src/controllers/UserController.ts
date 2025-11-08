import { NextFunction, Request, Response } from "express";
import { User } from "../models/UserModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { emit } from "process";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "";

export const signup = async (req: Request, res: Response) => {
  try {
    // EXTRACTING DATA FROM REQUEST
    const { fullName, email, password } = req.body;

    // VAlIDATION
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{12,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Entered password is not valid" });
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(400).json({
        message: "There's already an account with this email",
      });
    }

    // CREATING NEW ACCOUNT
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      bestScore: 0,
      previousScore: 0,
    });
    await user.save();
    res.status(200).json({ message: "User created sucessfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // EXTRACTING DATA FROM REQUEST
    const { email, password } = req.body;

    // VALIDATION
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // CREATING TOKEN
    const { email: userEmail, id, fullName, bestScore, previousScore } = user;
    const token = jwt.sign(
      { userEmail, id, fullName, bestScore, previousScore },
      JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Logged in sucessfully", token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

export const removeAccount = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOneAndDelete({ email });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.json({ error: err });
  }
};

export const updateScore = async (req: Request, res: Response) => {
  const { email, toChange, bestScore, previousScore } = req.body;
  console.log(previousScore, bestScore, toChange);

  try {
    const user = await User.findOne({ email });
    if (user) {
      if (toChange === "both") {
        user.bestScore = bestScore;
        user.previousScore = previousScore;
      }
      if (toChange === "bestScore") {
        user.bestScore = bestScore;
      }
      if (toChange === "previousScore") {
        user.previousScore = previousScore;
      }
      await user.save();
      res.json({ message: "User updated" });
    } else {
      res.json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const fetchScore = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      res.json({
        previousScore: user.previousScore,
        bestScore: user.bestScore,
      });
    } else {
      res.json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "fetch failed" });
  }
};

export const autenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenEntered = req.header("Authorization");

    if (!tokenEntered) {
      return res.status(401).json({ message: "Access denied" });
    }

    jwt.verify(tokenEntered, JWT_SECRET_KEY, (err, user) => {
      if (err) return res.status(401).json({ message: "Invalid Token" });
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Auth failed" });
  }
};
