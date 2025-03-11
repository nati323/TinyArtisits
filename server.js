import express, { Router } from "express";
import cors from "cors";
import fetch from "node-fetch";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 3001;


app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>console.log("connected to MangoDB"))
.catch(err => console.error("MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: String, required: true},
  drawings: [{ type: String }]
});
const User = mongoose.model("TinyArtisitsUser", UserSchema); 

const router = express.Router();
app.use(router);

//sing-up
router.post("/register", async (req,res)=>{
  const {username,email,password,age} = req.body

  const exsitingUser = await User.findOne({email});
  if(exsitingUser) return res.status(400).json({error: "Email already registerd"});

  //hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  try{
    const newUser = new User({username,email, password : hashedPassword , age}) ;
    await newUser.save();
    res.json({message: "User registered successfully!"});

  }catch(error){
    console.error("Registration error:", error); 
    res.status(500).json({ error: "Error registering user" });
  }

});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  // Compare passwords
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: "Incorrect password" });

  // Generate a JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "defaultSecretKey", { expiresIn: "1h" });

  res.json({ token, user: { id: user._id, username: user.username, email: user.email , age:user.age } });
});
// verfiy token Route
router.post("/verify-token", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; 
  if (!token){
    console.log("no token") 
    return res.json({ valid: false });}

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); 
    if (!user) return res.json({ valid: false });

    res.json({ valid: true, user });
  } catch (error) {
    console.error("error in try", error)
    res.json({ valid: false });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });