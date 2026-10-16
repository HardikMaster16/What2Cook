import User from "../models/User.js";

import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../services/authService.js";
import verifyGoogleToken from "../services/googleAuthService.js";

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const passwordHash =
      await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        dietaryPreference:
          user.dietaryPreference,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create account.",
    });
  }
};

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const passwordMatches =
      await comparePassword(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        dietaryPreference:
          user.dietaryPreference,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to login.",
    });
  }
};

const getCurrentUser = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select(
      "-passwordHash"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch current user.",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    const googleUser = await verifyGoogleToken(credential);

    if (!googleUser.email) {
      return res.status(400).json({
        success: false,
        message: "Google account email could not be verified.",
      });
    }

    let user = await User.findOne({
      $or: [
        { googleId: googleUser.googleId },
        { email: googleUser.email.toLowerCase() },
      ],
    });

    if (!user) {
      user = await User.create({
        name: googleUser.name || "Google User",
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.googleId,
        avatar: googleUser.avatar,
        passwordHash: null,
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
      }

      if (googleUser.avatar) {
        user.avatar = googleUser.avatar;
      }

      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        avatar: user.avatar,
        dietaryPreference: user.dietaryPreference,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed.",
    });
  }
};

export {
  register,
  login,
  getCurrentUser,
  googleLogin,
};