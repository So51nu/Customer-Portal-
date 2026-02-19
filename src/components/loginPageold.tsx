import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  Avatar,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

interface User {
  email: string;
  password: string;
  name: string;
}

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ Always read fresh from localStorage
    const storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const normalizedEmail = email.trim().toLowerCase();

    console.log("Login attempt:", normalizedEmail);
    console.log("Stored users:", storedUsers);

    const user = storedUsers.find(
      (u) => u.email.trim().toLowerCase() === normalizedEmail && u.password === password
    );

    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      setSuccess("Login successful!");
      setTimeout(() => onLogin(), 800);
    } else {
      setError("Invalid email or password");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // ✅ Always read fresh from localStorage
    const storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    // ✅ Normalize email for consistent comparison
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log("Signup attempt:", normalizedEmail);
    console.log("Current users:", storedUsers);

    const existingUser = storedUsers.find(
      (u) => u.email.trim().toLowerCase() === normalizedEmail
    );
    
    if (existingUser) {
      setError("Email already registered");
      return;
    }

    // ✅ Store normalized email
    const newUser = { email: normalizedEmail, password, name };
    const updatedUsers = [...storedUsers, newUser];

    // ✅ Save to localStorage immediately
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    console.log("User registered:", newUser);
    console.log("Updated users list:", updatedUsers);

    setSuccess("Account created successfully! Please login.");
    setShowSignup(false);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            backdropFilter: "blur(10px)",
            backgroundColor: "#ffffffe6",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          {/* 🔹 Logo Section */}
          <Avatar
            alt="VibeConnect Logo"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt045dvUV4inNYH8sIIJmzzuuW1QwY-wllLyoBrrbglw&s"
            sx={{
              width: 110,
              height: 70,
              mx: "auto",
              mb: 2,
              bgcolor: "primary.main",
            }}
          />

          <Typography variant="h5" fontWeight={600} gutterBottom>
            {showSignup ? "Create Account" : "Welcome Back"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {showSignup
              ? "Sign up to get started with Arvind SmartSpaces"
              : "Login to your Arvind SmartSpaces account"}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={showSignup ? handleSignup : handleLogin}>
            {showSignup && (
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              helperText={showSignup ? "Minimum 6 characters" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.2,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: "none",
                transition: "0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 16px rgba(85, 99, 222, 0.4)",
                },
              }}
            >
              {showSignup ? "Sign Up" : "Login"}
            </Button>
          </form>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2">
              {showSignup ? (
                <>
                  Already have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      setShowSignup(false);
                      setError("");
                      setSuccess("");
                    }}
                    sx={{ fontWeight: 600 }}
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      setShowSignup(true);
                      setError("");
                      setSuccess("");
                    }}
                    sx={{ fontWeight: 600 }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;