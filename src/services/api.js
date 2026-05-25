const BASE_URL = 'http://localhost:5000/api';

export const api = {
    transactions: {
        getAll: async () => {
            const response = await fetch(`${BASE_URL}/transactions`);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            return response.json();
        },
        add: async (transaction) => {
            const response = await fetch(`${BASE_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });
            if (!response.ok) throw new Error('Failed to add transaction');
            return response.json();
        },
        update: async (id, updates) => {
            const response = await fetch(`${BASE_URL}/transactions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error('Failed to update transaction');
            return response.json();
        },
        delete: async (id) => {
            const response = await fetch(`${BASE_URL}/transactions/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete transaction');
            return response.json();
        }
    },
    ai: {
        extract: async (imageFile) => {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${BASE_URL}/ai/extract`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('AI extraction failed');
            return response.json();
        }
    }
};
