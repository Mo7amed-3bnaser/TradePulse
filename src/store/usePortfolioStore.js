import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePortfolioStore = create(
  persist(
    (set, get) => ({
      transactions: [],

      // Add a new transaction (buy/sell)
      addTransaction: (transaction) => {
        const newTransaction = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...transaction,
        };
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
      },

      // Remove a transaction
      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      // Update a transaction
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      // Get transactions for a specific coin
      getTransactionsByCoin: (coinId) => {
        return get().transactions.filter((t) => t.coinId === coinId);
      },

      // Calculate total investment
      getTotalInvestment: () => {
        return get().transactions.reduce((total, t) => {
          if (t.type === "buy") {
            return total + t.amount * t.price;
          }
          return total;
        }, 0);
      },

      // Calculate current value with current prices
      getCurrentValue: (currentPrices) => {
        const holdings = get().getHoldings();
        return Object.entries(holdings).reduce((total, [coinId, amount]) => {
          const currentPrice = currentPrices[coinId] || 0;
          return total + amount * currentPrice;
        }, 0);
      },

      // Get holdings (amount of each coin)
      getHoldings: () => {
        const holdings = {};
        get().transactions.forEach((t) => {
          if (!holdings[t.coinId]) {
            holdings[t.coinId] = 0;
          }
          if (t.type === "buy") {
            holdings[t.coinId] += t.amount;
          } else if (t.type === "sell") {
            holdings[t.coinId] -= t.amount;
          }
        });
        // Remove coins with zero or negative holdings
        Object.keys(holdings).forEach((key) => {
          if (holdings[key] <= 0) {
            delete holdings[key];
          }
        });
        return holdings;
      },

      // Clear all transactions
      clearAll: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: "portfolio-storage",
    }
  )
);

export default usePortfolioStore;
