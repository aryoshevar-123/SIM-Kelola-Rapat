import { Division } from "../models/divisionModel.js";

export const getDivisions = async (req, res) => {
    try {
        const divisions = await Division.findAll();
        res.status(200).json({ status: 'Success', results: divisions.length, divisions });
    } catch (error) {
        console.error("Error in getDivisions Controller:", error.message);
        res.status(500).json({ error: 'Error in getDivisions controller' });
    }
};

export const getDivisionDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const division = await Division.findOne({ id }, true);
        if (!division) return res.status(404).json({ message: 'Division not found' });

        res.status(200).json({ status: 'Success', division });
    } catch (error) {
        console.error("Error in getDivisionDetails Controller:", error.message);
        res.status(500).json({ error: 'Error in getDivisionDetails controller' });
    }
};

export const createDivision = async (req, res) => {
    const { name, description, employeeIds } = req.body; 
    if (!name) return res.status(400).json({ message: 'Division name is required' });

    try {
        const result = await Division.create({ name, description, employeeIds });
        if (!result.success && result.type === 'ALREADY_EXISTS') return res.status(400).json({ message: 'Division name already exists' });

        res.status(201).json({ message: 'Division created and employees transferred successfully', division: result.division });
    } catch (error) {
        console.error("Error in createDivision Controller:", error.message);
        res.status(500).json({ error: 'Error in createDivision controller' });
    }
};

export const updateDivision = async (req, res) => {
    const { id } = req.params;
    const { name, description, add_user_ids, remove_user_ids } = req.body;

    if (!name) return res.status(400).json({ message: 'Division name is required' });

    try {
        const result = await Division.update(id, { name, description, addUserIds: add_user_ids, removeUserIds: remove_user_ids });

        if (!result.success && result.type === 'NOT_FOUND') return res.status(404).json({ message: 'Division not found' });

        let successMessage = 'Division updated successfully.';
        if (result.stats.added > 0 || result.stats.removed > 0) {
            successMessage = `Division updated. Successfully added ${result.stats.added} members and remove ${result.stats.removed} members.`;
        }

        res.status(200).json({ status: 'Success', message: successMessage, division: result.division, stats: result.stats });
    } catch (error) {
        console.error("Error in updateDivision Controller:", error.message);
        res.status(500).json({ error: 'Error in updateDivision controller' });
    }
};

export const deleteDivision = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Division.delete(id);

        if (!result.success) {
            if (result.type === 'NOT_FOUND') return res.status(404).json({ message: 'Division not found' });
            if (result.type === 'ASSIGNED_TO_USERS') return res.status(400).json({ message: 'Cannot delete division. It is currently assigned to one or more users.' });
        }
        res.status(200).json({ message: 'Division deleted successfully', deletedDivision: result.deletedDivision });
    } catch (error) {
        console.error("Error in deleteDivision Controller:", error.message);
        res.status(500).json({ error: 'Error in deleteDivision controller' });
    }
};