import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// SignUp a new user
export const Signup = async(req, res)=>{
    const { fullName, email, password, bio} = req.body;

    try{
        if (!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details"})
        }
        const user = await User.findOne({email});
        if(user){
             return res.json({success: false, message: "Account already exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id)

        res.json({success: true, userData: newUser, token, message: "Account created successfully"})
    }
    catch (error) {
        console.log(error.message);
        
        res.json({success: false, message: error.message})
    }
}

//Controller to login a user
export const login = async (req, res) =>{
    try {
        const { email, password} = req.body;
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            return res.json({ success: false, message: "Invalid credentials"});
            
        }
        const token = generateToken(userData._id)

        res.json({success: true, userData, token, message: "Login successful"})
    } catch (error) {
         console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//Controller to check in user is authenticated
export const checkAuth = (req, res)=>{
    res.json({success: true, user: req.user});
}

// Controller to update user profile details
// Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { bio, fullName } = req.body;
    const profilePicFile = req.file; // This comes from multer
    const userId = req.user._id;

    console.log('Update profile request:', { 
      hasFile: !!profilePicFile,
      fileInfo: profilePicFile ? {
        originalname: profilePicFile.originalname,
        size: profilePicFile.size,
        mimetype: profilePicFile.mimetype
      } : null
    });

    let updateFields = {};

    // Update text fields
    if (bio !== undefined) updateFields.bio = bio;
    if (fullName !== undefined) updateFields.fullName = fullName;

    // Handle profile picture upload to Cloudinary
    if (profilePicFile) {
      try {
        console.log('Uploading to Cloudinary...');
        
        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(profilePicFile.buffer).toString("base64");
        const dataURI = "data:" + profilePicFile.mimetype + ";base64," + b64;
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: "profile_pics",
          resource_type: "image"
        });

        console.log('Cloudinary upload success:', uploadResult.secure_url);
        updateFields.profilePic = uploadResult.secure_url;

      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        return res.json({ 
          success: false, 
          message: 'Image upload failed: ' + uploadError.message 
        });
      }
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateFields, 
      { new: true, runValidators: true }
    );

    console.log('Database update successful');
    res.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Update profile error:', error);
    res.json({ success: false, message: error.message });
  }
};