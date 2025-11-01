require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://manypatel2002_db_user:0j21UlPlquTag54M@cluster0.nexlxvp.mongodb.net/?appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true


}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" }
});
const User = mongoose.model("User", userSchema);

// 🟢 Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, password });
    await user.save();
    res.json({ success: true, message: "User created" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// 🟢 Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.json({ success: false, message: "Invalid credentials" });
  res.json({ success: true, user });
});


// 🟣 Admin Dashboard Routes (CRUD for users)

// Get all users
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Add a user (admin panel)
app.post("/api/users", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user
app.put("/api/users/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🟢 Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
