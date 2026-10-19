import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getJournals = (params = {}) => api.get("/journals", { params });

export const getJournalById = (id) => api.get(`/journals/${id}`);

export const createJournal = (data) => api.post("/journals", data);

export const updateJournal = (id, data) => api.put(`/journals/${id}`, data);

export const deleteJournal = (id) => api.delete(`/journals/${id}`);
