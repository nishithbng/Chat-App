import React, { useContext, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  
  const navigate = useNavigate();

  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    return name !== authUser?.fullName || 
           bio !== authUser?.bio || 
           file !== null;
  }, [name, bio, file, authUser]);

  // Handle image change - PREVIEW ONLY
  const handleFileChange = (e) => {
    setError("");
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Validate file size (max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("File size too large (max 2MB)");
      return;
    }
    
    // Validate file type
    if (!selectedFile.type.match(/image\/(jpeg|png|jpg|webp)/)) {
      setError("Only JPEG, JPG, PNG or WEBP files are allowed");
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setFile({
      file: selectedFile, // Keep the original file for upload
      preview: objectUrl  // Keep the preview URL for display
    });
  };

  // Save only changed fields
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!hasChanges) {
      setError("No changes to save");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      if (name !== authUser?.fullName) {
        formData.append('fullName', name);
      }
      
      if (bio !== authUser?.bio) {
        formData.append('bio', bio);
      }
      
      // Add file if selected - send the ACTUAL File object
      if (file) {
        formData.append('profilePic', file.file);
      }

      // Call updateProfile with FormData
      const result = await updateProfile(formData);
      
      if (result && result.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
      // Don't revoke the URL here - we might need it for preview until page reload
    }
  };

  // Get preview URL for display
  const getPreviewUrl = () => {
    if (file) return file.preview; // Use the preview URL
    if (authUser?.profilePic) return authUser.profilePic; // Use existing profile pic
    return assets.avatar_icon; // Default avatar
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (file && file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-4">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        
        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-lg font-semibold">Profile details</h3>

          {error && (
            <div className="bg-red-500 text-white p-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Upload */}
          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
            <input 
              onChange={handleFileChange} 
              type="file" 
              id="avatar" 
              accept=".png,.jpeg,.jpg,.webp" 
              hidden 
            />
            <img 
              src={getPreviewUrl()} 
              alt="avatar preview" 
              className="w-12 h-12 rounded-full object-cover" 
            />
            <span className="text-sm">Upload profile image</span>
          </label>

          {/* Name */}
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              type="text" 
              placeholder="Your name" 
              className="w-full p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm mb-1">Bio</label>
            <textarea 
              onChange={(e) => setBio(e.target.value)} 
              value={bio} 
              placeholder="Write profile bio" 
              className="w-full p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent"
              rows={4}
            ></textarea>
          </div>

          {/* Save */}
          <button 
            type="submit" 
            disabled={loading || !hasChanges}
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
        
        {/* Preview */}
        <div className="flex flex-col items-center p-4">
          <h4 className="mb-4 font-medium">Preview</h4>
          <img 
            className="w-44 h-44 rounded-full mx-10 max-sm:mt-10 object-cover border-2 border-violet-500" 
            src={getPreviewUrl()} 
            alt="Profile Preview" 
          />
          <div className="mt-4 text-center">
            <h3 className="font-medium">{name || "Your Name"}</h3>
            <p className="text-sm text-gray-400 mt-2">{bio || "Your bio will appear here"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage;