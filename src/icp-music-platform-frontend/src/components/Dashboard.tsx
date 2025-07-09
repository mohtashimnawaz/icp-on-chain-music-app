import React, { useEffect, useState } from 'react';
import { getRoyaltyBalance, withdrawRoyalties, getPaymentHistory } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';

const ARTIST_ID = 1n; // TODO: Replace with real artist/user context

const Dashboard: React.FC = () => {
  const [royalty, setRoyalty] = useState<bigint>(0n);
  const [history, setHistory] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string|null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  useEffect(() => {
    fetchRoyalty();
    fetchHistory();
  }, []);

  const fetchRoyalty = async () => {
    try {
      const r = await getRoyaltyBalance(ARTIST_ID);
      setRoyalty(BigInt(r));
    } catch { 
      setRoyalty(0n); 
      showMessage('Failed to fetch royalty balance', 'error');
    }
  };

  const fetchHistory = async () => {
    try {
      const h = await getPaymentHistory(ARTIST_ID);
      setHistory(h);
    } catch { 
      setHistory([]); 
      showMessage('Failed to fetch payment history', 'error');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || BigInt(withdrawAmount) <= 0) {
      showMessage('Please enter a valid amount', 'error');
      return;
    }

    if (BigInt(withdrawAmount) > royalty) {
      showMessage('Insufficient balance', 'error');
      return;
    }

    const withdrawPromise = (async () => {
      try {
        const amt = BigInt(withdrawAmount);
        const ok = await withdrawRoyalties(ARTIST_ID, amt);
        if (ok) {
          setMessage('Withdrawal successful!');
          setMessageType('success');
          showMessage('Withdrawal successful!', 'success');
          setWithdrawAmount('');
          await fetchRoyalty();
          await fetchHistory();
        } else {
          setMessage('Withdrawal failed.');
          setMessageType('error');
          showMessage('Withdrawal failed.', 'error');
        }
      } catch {
        setMessage('Withdrawal failed.');
        setMessageType('error');
        showMessage('Withdrawal failed.', 'error');
      }
    })();
    
    await withLoading(withdrawPromise, 'Processing withdrawal...');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: '#fff', fontWeight: 900, letterSpacing: 1 }}>
        Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* Royalty Balance Card */}
        <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #7b1fa2 0%, #42a5f5 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 8s ease-in-out infinite',
            boxShadow: '0 8px 32px 0 rgba(123,31,162,0.18)',
            borderRadius: 4,
            transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.04)',
              boxShadow: '0 16px 48px 0 rgba(123,31,162,0.22)',
            },
          }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 48, mb: 2, filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
              <Typography variant="h4" gutterBottom sx={{
                background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
                letterSpacing: 1,
                textShadow: '0 2px 8px #42a5f5',
              }}>
                {royalty.toString()}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>Current Balance</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Withdrawal Card */}
        <Box sx={{ flex: { xs: '1', md: '0 0 67%' } }}>
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(90deg, #00e5ff 0%, #7b1fa2 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 12s ease-in-out infinite',
            borderRadius: 4,
            boxShadow: '0 4px 24px 0 rgba(0,229,255,0.12)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PaymentIcon sx={{ mr: 1, color: '#fff', filter: 'drop-shadow(0 2px 8px #00e5ff)' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, color: '#fff' }}>Withdraw Royalties</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                type="number"
                label="Amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  inputProps: { min: 0, max: royalty.toString() }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleWithdraw} 
                disabled={loading || !withdrawAmount}
                sx={{ minWidth: 120 }}
              >
                Withdraw
              </Button>
            </Box>
            
            {message && (
              <Alert severity={messageType} sx={{ mt: 2 }}>
                {message}
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Payment History */}
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <HistoryIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Payment History</Typography>
          </Box>
          
          {history.length === 0 ? (
            <Alert severity="info">
              No payment history available yet.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Payer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((payment, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        {new Date(Number(payment.timestamp) * 1000).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {payment.payer?.toString?.() ?? payment.payer}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {payment.amount?.toString?.() ?? payment.amount}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 