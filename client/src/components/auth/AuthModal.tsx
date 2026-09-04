import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { apiService, type User } from '../../services/api';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export function AuthModal({ open, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<number>(0); // 0 = Login, 1 = Register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 0) {
        // Login
        const res = await apiService.login(email, password);
        localStorage.setItem('token', res.token);
        onAuthSuccess(res.user);
        onClose();
      } else {
        // Register
        const res = await apiService.register(name, email, password);
        localStorage.setItem('token', res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Tabs value={tab} onChange={(_e, v) => { setTab(v); setError(''); }} variant="fullWidth">
          <Tab label="Sign In" />
          <Tab label="Register" />
        </Tabs>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {tab === 1 && (
            <TextField
              label="Full Name"
              type="text"
              fullWidth
              required
              margin="dense"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            required
            margin="dense"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Processing...' : tab === 0 ? 'Sign In' : 'Create Account'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
