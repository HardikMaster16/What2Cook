import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

const comparePassword = async (
  password,
  passwordHash
) => {
  return bcrypt.compare(password, passwordHash);
};

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export {
  hashPassword,
  comparePassword,
  generateToken,
};