import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.transactions.getAll();
            setTransactions(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = useCallback(async (transactionData) => {
        try {
            const newTransaction = await api.transactions.add(transactionData);
            setTransactions(prev => [newTransaction, ...prev]);
            return newTransaction;
        } catch (err) {
            console.error('Failed to add transaction:', err);
            throw err;
        }
    }, []);

    const updateTransaction = useCallback(async (id, updates) => {
        try {
            const updated = await api.transactions.update(id, updates);
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updated } : tx));
            return updated;
        } catch (err) {
            console.error('Failed to update transaction:', err);
            throw err;
        }
    }, []);

    const deleteTransaction = useCallback(async (id) => {
        try {
            await api.transactions.delete(id);
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        } catch (err) {
            console.error('Failed to delete transaction:', err);
            throw err;
        }
    }, []);

    const extractFromImage = useCallback(async (imageFile) => {
        try {
            return await api.ai.extract(imageFile);
        } catch (err) {
            console.error('AI extraction error:', err);
            throw err;
        }
    }, []);

    return {
        transactions,
        loading,
        error,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        extractFromImage
    };
};
