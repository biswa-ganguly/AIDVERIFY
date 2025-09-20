import jwt from "jsonwebtoken";

const AdminLogin = async (req, res) => {
  try {
    const pass = process.env.ADMIN_PASSWORD;
    const jwtsecret = process.env.ADMIN_JWT_SECRET;
    const { password } = req.body;

    if (!pass) {
      return res
        .status(500)
        .json({ error: "ADMIN_PASSWORD is not defined or loaded." });
    }

    if (!jwtsecret) {
      return res
        .status(500)
        .json({ error: "ADMIN_JWT_SECRET is not defined or loaded." });
    }

    if (pass !== password) {
      return res.status(403).json({ message: "WRONG PASSWORD ENTERED." });
    }

    const token = jwt.sign({ role: "ADMIN" }, jwtsecret, { expiresIn: "1h" });

    return res.json({
      message: "Login successful",
      token: token,
      expiresIn: "1 HOUR",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
};

export default AdminLogin;
