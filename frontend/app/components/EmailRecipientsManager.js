// components/EmailRecipientsManager.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EmailRecipientsManager() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        "http://localhost:8000/api/emails/addresses/"
      );
      setEmails(res.data);
    } catch {
      setError("Falha ao carregar lista de e-mails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post("http://localhost:8000/api/emails/", {
        email: newEmail,
      });
      setSuccess("E-mail adicionado com sucesso");
      setNewEmail("");
      fetchEmails();
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao adicionar e-mail");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // busca todos para achar o ID
      const all = await axios.get("http://localhost:8000/api/emails/");
      const target = all.data.find((item) => item.email === email);
      if (target) {
        await axios.delete(`http://localhost:8000/api/emails/${target.id}`);
        setSuccess("E-mail removido");
        fetchEmails();
      } else {
        setError("E-mail não encontrado");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao remover e-mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 3,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Gerenciamento de E-mails de Alerta
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleAdd}
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          label="Novo e-mail"
          variant="outlined"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          fullWidth
          required
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Adicionar"}
        </Button>
      </Box>

      <List>
        {loading && <CircularProgress />}
        {emails.map((email) => (
          <ListItem
            key={email}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDelete(email)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={email} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
