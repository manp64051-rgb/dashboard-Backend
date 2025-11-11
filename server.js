require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: ["https://dashboard-frontend-8bbm.onrender.com", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {     
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

// 🟢 Register Route
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // ✅ Step 1: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // ✅ Step 2: Create new user
    const user = new User({ name, email, password });
    await user.save();

    res.json({ success: true, message: "User created" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


app.get("/test", async (req, res) => {
  res.json("this is a test date");
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

// ✅ Root route (helps test deployment)
app.get("/", (req, res) => {
  res.send("✅ Backend is running on Render!");
});
// 🟢 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
