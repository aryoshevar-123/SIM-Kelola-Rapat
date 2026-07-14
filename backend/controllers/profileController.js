import { User } from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinaryHelper.js';

export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ status: 'Success', user });
    } catch (error) {
        console.error("Error in getMyProfile:", error.message);
        res.status(500).json({ error: 'Error in getMyProfile controller' });
    }
};

export const updateMyProfile = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    try {
        const sanitizedEmail = email.toLowerCase().trim();
        const emailCheck = await User.findOne({ email: sanitizedEmail });
        if (emailCheck && emailCheck.id !== req.user.id) {
            return res.status(400).json({ message: 'Email is already taken by another user' });
        }

        const currentProfile = await User.findOne({ id: req.user.id });
        const oldImageUrl = currentProfile?.profile_picture;
        let imageUrl = oldImageUrl;

        if (req.file) {
            if (oldImageUrl) await deleteFromCloudinary(oldImageUrl);
            imageUrl = await uploadToCloudinary(req.file.buffer, 'sim_kelola_rapat/profiles');
        }

        const updatedUser = await User.update(req.user.id, {
            name, email: sanitizedEmail, profilePicture: imageUrl
        });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, profile_picture: updatedUser.profile_picture }
        });
    } catch (error) {
        console.error("Error in updateMyProfile:", error.message);
        res.status(500).json({ error: 'Error in updateMyProfile controller' });
    }
};

export const updateMyPassword = async (req, res) => {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) return res.status(400).json({ message: 'Current and new passwords are required' });
    
    try {
        const user = await User.findOne({ id: req.user.id }, true);
        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        await User.update(req.user.id, { password: new_password });
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Error in updateMyPassword:", error.message);
        res.status(500).json({ error: 'Error in updateMyPassword controller' });
    }
};