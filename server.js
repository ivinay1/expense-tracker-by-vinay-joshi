const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());

const BASE_URL = 'http://strapi.koders.in/api/expenses/';

// Function to get all expenses
async function getExpenses() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}

// Function to update expense by ID
async function updateExpense(id, updateData) {
    try {
        await axios.put(`${BASE_URL}${id}`, updateData);
    } catch (error) {
        console.error('Error updating expense:', error);
    }
}

// Cron job to handle recurring expenses
cron.schedule('0 0 * * *', async () => {
    const expenses = await getExpenses();
    const currentDate = new Date().toISOString().split('T')[0];

    expenses.forEach(expense => {
        if (expense.frequency !== 'One-Time') {
            const updatedAmount = expense.amount + expense.base;
            updateExpense(expense.id, { amount: updatedAmount, date: currentDate });
        }
    });
});

// Create a new expense
app.post('/expenses', async (req, res) => {
    const { date, amount, description, frequency, base } = req.body;
    try {
        const response = await axios.post(BASE_URL, { date, amount, description, frequency, base });
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error creating expense');
    }
});

// Get all expenses
app.get('/expenses', async (req, res) => {
    try {
        const response = await axios.get(BASE_URL);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching expenses');
    }
});

// Update an expense
app.put('/expenses/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const response = await axios.put(`${BASE_URL}${id}`, updateData);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error updating expense');
    }
});

// Delete an expense
app.delete('/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await axios.delete(`${BASE_URL}${id}`);
        res.send('Expense deleted');
    } catch (error) {
        res.status(500).send('Error deleting expense');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

