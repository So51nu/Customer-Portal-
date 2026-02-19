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

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState(""); // used as username
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clientUsername, setClientUsername] = useState("test"); // dynamically change if needed

  const BACKEND_URL = "https://accountsetup.myciti.life/api";
  const POSTSALES_URL = "https://ps.myciti.life/api";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password: password,
          client_username: clientUsername,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || "Invalid credentials");
        return;
      }

      const data = await response.json();
      console.log("Login response:", data);

      // Store tokens and tenant info
      localStorage.setItem(
        "authState",
        JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token || "",
          tenant_info: data.tenant,
        })
      );

      const accountUserId = data.tenant?.user_id;
      const tenantAlias = data.tenant?.alias;

      if (!tenantAlias) {
        setError("Tenant alias missing. Please login again.");
        return;
      }

      // Wait a short time before fetching applicant ID
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.access_token}`,
        "X-Tenant-Alias": tenantAlias,
      };

      const applicantResponse = await fetch(
        `${POSTSALES_URL}/applicant-id/?account_user_id=${accountUserId}`,
        { method: "GET", headers }
      );

      if (!applicantResponse.ok) {
        const errData = await applicantResponse.json().catch(() => ({}));
        setError(errData.detail || "Failed to fetch applicant ID");
        return;
      }

      const applicantData = await applicantResponse.json();
      console.log("Applicant data:", applicantData);

      const applicantId = applicantData.applicant_id || applicantData.id;
      if (!applicantId) {
        setError("Applicant ID missing in response");
        return;
      }
      localStorage.setItem("applicant_id", applicantId.toString());

      setSuccess("Login successful!");
      setTimeout(() => onLogin(), 500);
    } catch (err) {
      console.error("Network error:", err);
      setError(
        "Network error. Ensure backend URL is correct and CORS is enabled."
      );
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
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

    try {
      const response = await fetch(`${BACKEND_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          email,
          password,
          full_name: name,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || "Signup failed");
        return;
      }

      setSuccess("Account created successfully! Please login.");
      setShowSignup(false);
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      console.error("Network error:", err);
      setError(
        "Network error. Ensure backend URL is correct and CORS is enabled."
      );
    }
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
          <Avatar
            alt="VibeConnect Logo"
            src="../../public/lotusNew.png"
            sx={{ width: 100, height: 90, mx: "auto", mb: 2 }}
          />

          <Typography variant="h5" fontWeight={600} gutterBottom>
            {showSignup ? "Create Account" : "Welcome Back"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {showSignup
              ? "Sign up to get started with Lotus Developers"
              : "Login to your Lotus Developers account"}
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
              label="Email / Username"
              type="text"
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
                "&:hover": { transform: "scale(1.05)", boxShadow: "0px 6px 16px rgba(85, 99, 222, 0.4)" },
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
                  <Link component="button" variant="body2" onClick={() => { setShowSignup(false); setError(""); setSuccess(""); }} sx={{ fontWeight: 600 }}>Login</Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link component="button" variant="body2" onClick={() => { setShowSignup(true); setError(""); setSuccess(""); }} sx={{ fontWeight: 600 }}>Sign up</Link>
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