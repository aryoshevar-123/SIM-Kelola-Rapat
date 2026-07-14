import { User } from "../models/userModel.js";
import { Division } from "../models/divisionModel.js";

export const getUsers = async (req, res) => {
    const { status } = req.query; 
    try {
        const users = await User.findAll(status);
        res.status(200).json({ status: 'Success', results: users.length, users });
    } catch (error) {
        console.error("Error in getUsers Controller:", error.message);
        res.status(500).json({ error: 'Error in getUsers controller' });
    }
};

export const getUserDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ id });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ status: 'Success', user });
    } catch (error) {
        console.error("Error in getUserDetails Controller:", error.message);
        res.status(500).json({ error: 'Error in getUserDetails controller' });
    }
};

export const createUserByAdmin = async (req, res) => {
    const { name, email, password, role, division_id } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

    try {
        const sanitizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: sanitizedEmail });
        if (userExists) return res.status(400).json({ message: 'Email already registered' });

        if (division_id) {
            const divisionExist = await Division.findOne({ id: division_id });
            if (!divisionExist) return res.status(400).json({ message: 'Division does not exist' });
        }

        const newUser = await User.create({
            name, email: sanitizedEmail, password, role, divisionId: division_id
        });

        res.status(201).json({ message: 'User created successfully by Admin', user: newUser });
    } catch (error) {
        console.error("Error in createUserByAdmin Controller:", error.message);
        res.status(500).json({ error: 'Error in createUserByAdmin controller' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, role, division_id, is_active } = req.body;

    if (!name || !role || is_active === undefined) {
        return res.status(400).json({ message: 'Name, role, and activation status are required' });
    }

    try {
        if (division_id) {
            const divisionExist = await Division.findOne({ id: division_id });
            if (!divisionExist) return res.status(400).json({ message: 'Division does not exist' });
        }

        const updatedUser = await User.update(id, {
            name, role, divisionId: division_id, isActive: is_active
        });

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error("Error in updateUser Controller:", error.message);
        res.status(500).json({ error: 'Error in updateUser controller' });
    }
};

export const toggleUserActivation = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) return res.status(400).json({ message: 'Activation status is required' });

    try {
        const updatedUser = await User.update(id, { isActive: is_active });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        const statusMessage = is_active ? 'User activated successfully' : 'User deactivated successfully';
        res.status(200).json({ message: statusMessage, user: updatedUser });
    } catch (error) {
        console.error("Error in toggleUserActivation Controller:", error.message);
        res.status(500).json({ error: 'Error in toggleUserActivation controller' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await User.delete(id);

        if (!result.success) {
            if (result.type === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' });
            if (result.type === 'IS_ACTIVE') return res.status(400).json({ message: 'Cannot delete active user' });
            if (result.type === 'OPERATIONAL_HISTORY') {
                return res.status(400).json({ message: 'Cannot delete user. This user has operational history (e.g., booked meetings) in the system.' });
            }
        }
        res.status(200).json({ message: 'User deleted successfully', deletedUser: result.deletedUser });
    } catch (error) {
        console.error("Error in deleteUser Controller:", error.message);
        res.status(500).json({ error: 'Error in deleteUser controller' });
    }
};