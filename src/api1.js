const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const ParkingSlot = require('./ParkingSlot')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const parkingRoutes = require('./vehicle.controller'); 
const app = express();

// Check if the SECRET_KEY environment variable is set
if (!process.env.SECRET_KEY) {
  console.error('SECRET_KEY environment variable is not set');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/smart-parking-system'
// , {
  //useNewUrlParser: true,
  //useUnifiedTopology: true,
//}
)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Failed to connect to MongoDB:', error));

// Add middleware functions
app.use(express.json());
app.use(cors());

// Define User model
const User = mongoose.model('User', {
  fullName: String,
  email: String,
  password: String,
  phone: { type: String, default: null },
  address: { type: String, default: null }
});

const Admin = mongoose.model('Admin', {
  fullName: String,
  email: String,
  password: String,
  phone: { type: String, default: null },
  address: { type: String, default: null }
});

// Function to generate token
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: '1h',
  });
  return token;
};

// Function to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'Access denied' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// API routes
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken(user);
      res.json({ message: 'Signed in successfully', token, role: 'admin' });
    } else {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken(user);
      res.json({ message: 'Signed in successfully', token, role: 'user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    const token = generateToken(user);
    res.json({ message: 'Signed up successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Hello from protected route!' });
});

app.get('/api/user', authenticateToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

//feedback storing in mongodb from user
const feedbackSchema = new mongoose.Schema({
  ratingEmoji: { type: String, required: true }, // store emoji rating
  ratingValue: { type: Number, required: true }, // store numerical rating value
  message: { type: String, required: true },
  type: { type: String, required: true },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

app.get('/api/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json({ feedbacks});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching feedback' });
  }
});

// API endpoint to submit feedback
app.post('/api/submit-feedback', async (req, res) => {
  console.log('Received feedback submission request');
  try {
    const { message, type, ratingEmoji, ratingValue } = req.body;

    // Create a new feedback document
    const newFeedback = new Feedback({ ratingEmoji,ratingValue, message, type });
    // Save the feedback document
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully',  feedback: newFeedback });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});


//floors
app.get('/api/smart-parking-system/floors', async (req, res) => {
  try {
    const parkingSlots = await ParkingSlot.find();
    const floors = [...new Set(parkingSlots.map(slot => slot.floorNumber))].sort((a, b) => a - b);
    res.json(floors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch floors' });
  }
});

app.get('/api/smart-parking-system/parkingslots/:floorNumber', async (req, res) => {
  try {
    const floorNumber = req.params.floorNumber;
    const parkingSlots = await ParkingSlot.find({ floorNumber: floorNumber });
    res.json(parkingSlots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch parking slots' });
  }
});

//parking slot api
app.post('/api/parkingslots/:slotId/book', async (req, res) => {
  try {
    const slotId = req.params.slotId;
    const parkingSlot = await ParkingSlot.findOne({ slotId: slotId });
    if (!parkingSlot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    if (parkingSlot.status === 'Booked') {
      return res.status(400).json({ message: 'Parking slot is already booked' });
    }
    parkingSlot.status = 'Booked';
    await parkingSlot.save();
    res.json({ message: 'Parking slot booked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error booking parking slot' });
  }
});

//edit profile
app.patch('/api/user', authenticateToken, async (req, res) => {
  console.log('Received PATCH request to /api/user');
  try {
    const userId = req.user.userId;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const existingUser = await User.findOne({ email: req.body.email });
if (existingUser && existingUser._id.toString() !== userId) {
return res.status(400).json({ error: 'Email already exists' });
}
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

//admin profile
app.get('/api/admins', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


//edit profile for admin

app.patch('/api/admins', authenticateToken, async (req, res) => {
  console.log('Received PATCH request to /api/admins');
  try {
    const adminId = req.user.userId;
    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, 
      {fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
    }, { new: true });
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    const existingAdmin = await Admin.findOne({ email: req.body.email });
    if (existingAdmin && existingAdmin._id.toString() !== adminId) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.json(updatedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating admin profile' });
  }
}); 

//report model
const reportSchema = new mongoose.Schema({
  category: String,
  description: String,
  phoneNumber: String,
  image: String,
});

Report = mongoose.model('Report', reportSchema);


app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find();
    // Ensure you're sending back the image URL or filename in the response
    if (!reports) {
      return res.status(404).json({ message: 'No reports found' });
    }
    const reportsWithImageUrls = reports.map(report => ({
      ...report.toObject(),
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${report.image}`
    }));
    res.json(reportsWithImageUrls);  // Send image URLs or filenames
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
});


// GET endpoint to retrieve all uploaded images

//correct code:-
const uploadPath = path.join(__dirname, '../uploads');
const uploadsDir = path.join(__dirname, '../uploads');

app.use('/uploads', express.static(uploadsDir));


app.get('/api/images', (req, res) => {
 
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Error reading upload directory' });
    } else {
      res.json(files);
    }
  });
});



// Set up multer storage and file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage: storage });


// API route for submitting the report
app.post('/api/submit-report', upload.single('image'), (req, res) => {
  try {
    const { category, description,phoneNumber} = req.body;
    let imageUrl = null;

    if (req.file) {
      // If an image is uploaded, create the image URL
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Save the report with category, description, and imageUrl
    const newReport = new Report({
      category,
      description,
      phoneNumber,
      image: imageUrl, // Save the image URL
    });

    newReport.save()
      .then(() => {
        res.json({
          message: 'Report submitted successfully',
          imageUrl: imageUrl || null, // Send image URL if available
        });
      })
      .catch((error) => {
        console.error('Error saving report:', error);
        res.status(500).json({ error: 'Failed to save the report' });
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to submit the report' });
  }
});

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(path.join(__dirname,uploadPath)); // Create uploads directory if it doesn't exist
}
app.use('/uploads', express.static(uploadsDir));

//admin profile updation dynamically for users and parking slots
app.get('/api/user-count', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user count' });
  }
});

app.get('/api/parking-slot-count', async (req, res) => {
  try {
    const parkingSlotCount = await ParkingSlot.countDocuments();
    res.json({ parkingSlotCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching parking slot count' });
  }
});

//dynamic form for book now
app.get('/api/parking-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  try {
    const slot = await ParkingSlot.findOne({ slotId });
    if (slot) {
      res.json(slot);
    } else {
      res.status(404).json({ error: 'Slot not found' });
    }
  } catch (error) {
    console.error('Error fetching parking slot by ID:', error);
    res.status(500).json({ error: 'Failed to fetch parking slot' });
  }
});

app.post('/api/parking-slots/calculate-charge', async (req, res) => {
  console.log('Endpoint called');
  const { slotId, duration } = req.body;
  if (!slotId || !duration || duration <= 0) {
    return res.status(400).json({ error: 'Invalid slotId or duration.' });
  }

try {
  const slot = await ParkingSlot.findOne({ slotId }); // Replace with actual DB query
  if (!slot) {
    return res.status(404).json({ error: 'Slot not found.' });
  }
  const slotData = slot._doc; 
  console.log(slotData.hourlyRate)
  const totalAmount = slotData.hourlyRate* duration;
  res.json({ totalAmount });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
}
});

//payment
const accountSchema = new mongoose.Schema({
  paymentMethod: { type: String, required: true },
   accountDetails: { type: Object, required: true },
 });

 const Account = mongoose.model("Account", accountSchema);
// API route to fetch account details based on payment method
app.get("/api/account/:paymentMethod", async (req, res) => {
const { paymentMethod } = req.params;

try {
  const account = await Account.findOne({ paymentMethod });
  if (account) {
    res.json({ accountDetails: account.accountDetails });
  } else {
    console.error("Account details not found for payment method: `${paymentMethod}`");
    res.status(404).json({ message: "Account details not found" });
  }
} catch (err) {
  console.error("Error fetching account details:", err.message);
  res.status(500).json({ message: "Error fetching account details" });
}
});

// API route to validate account details
app.post("/api/validateAccount", async (req, res) => {
  const { paymentMethod, details } = req.body;
  try {
    console.log("Validating account:", paymentMethod, details);
    const account = await Account.findOne({ paymentMethod, accountDetails: details });
    console.log("Account object:", account);
    if (account) {
      res.status(200).json({ success: true, message: "Payment successful" });
    } else {
      console.log("Account not found");
      res.status(404).json({ success: false, message: "Account validation failed" });
    }
  } catch (err) {
    console.error("Error validating account:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// MongoDB schema and model definition
const paymentSchema = new mongoose.Schema({
  paymentMethod: { type: String, required: true },
  cardHolderName: { type: String },
  cardNumber: { type: String },
  expiryDate: { type: String },
  cvv: { type: String },
  paypalEmail: { type: String },
  upiId: { type: String },
  date: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);

// API route to save payment details
app.post("/api/savePayment", async (req, res) => {
  const {
    paymentMethod,
    cardHolderName,
    cardNumber,
    expiryDate,
    cvv,
    paypalEmail,
    upiId,
  } = req.body;

  const newPayment = new Payment({
    paymentMethod,
    cardHolderName,
    cardNumber,
    expiryDate,
    cvv,
    paypalEmail,
    upiId,
  });

  try {
    const savedPayment = await newPayment.save();
    res.status(201).json({
      success: true,
      message: "Payment details saved successfully",
      data: savedPayment,
    });
  } catch (error) {
    console.error("Error saving payment details:", error.message);
    res.status(500).json({
      success: false,
      message: "Error saving payment details",
    });
  }
});


//location
app.get('/api/parkingslots/:slotId', async (req, res) => {
  try {
    // Query the parkingSlots collection for the slotId
    const slot = await ParkingSlot.findOne({ slotId: req.params.slotId });
    if (!slot) {
      console.error(`Slot with ID ${req.params.slotId} not found.`);
      return res.status(404).json({ message: 'Slot not found' });
    }
 
    // Return the latitude and longitude
    res.json({
      latitude: slot.latitude,
      longitude: slot.longitude,
    });
  } catch (error) {
    console.error('Error fetching slot:', error);
    res.status(500).json({ message: 'Error fetching slot details' });
  }
});

//email sending automatically
// Add this endpoint to handle GET requests to /paymentDetailsDB/payments
app.get('/paymentDetailsDB/payments', async (req, res) => {
  try {
    const payments = await Payment.find(); // Assuming you have a Payment model
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// You also need to define the Payment model
const paymentSchema1 = new mongoose.Schema({
  paymentId: Number,
  slotId: String,
  paymentDate: Date,
  amount: Number,
});

const Payment1 = mongoose.model('Payment1', paymentSchema1);
// Update parking slot status to available
app.get('/api/update-slot-status', async (req, res) => {
  try {
    const slotId = req.query.slotId;
    const updatedSlot = await ParkingSlot.findOneAndUpdate({ slotId }, { status: 'Available' }, { new: true });
    if (updatedSlot) {
      console.log(`Slot ${updatedSlot.slotId} status updated to available!`);
      res.json({ success: true, message: 'Slot status updated successfully!' });
    } else {
      console.error(`Slot ${slotId} not found!`);
      res.status(404).json({ error: 'Slot not found' });
    }
  } catch (error) {
    console.error('Error updating slot status:', error);
    res.status(500).json({ error: 'Failed to update slot status' });
  }
});




//vehicle selector
console.log(require.resolve('./vehicle.controller'));


app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Use the parking slots routes
app.use('/api/smart-parking-system', parkingRoutes);

// Handle unmatched routes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


// Start server
const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


