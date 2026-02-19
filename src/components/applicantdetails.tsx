import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { fetchCustomerProfile } from "../api/endpoint";

// Define the type HERE inside the file
export interface CustomerProfile {
  id: number;
  full_name: string;
  last_name:string;
  email: string;
  mobile: string;
  residence_address: string;
  avatar?: string;
}


interface Props {
  customerId: number;
}

const CustomerProfileCard: React.FC<Props> = ({ customerId }) => {
  const [data, setData] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchCustomerProfile(customerId);
        console.log("API response:", result);
        setData(result);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (!data) return <Typography>No data found</Typography>;

  return (
    <Card sx={{ mb: 2, boxShadow: 'none', bgcolor: '#f9f9f9', borderRadius: 2 }}>
      <CardContent sx={{ py: 2 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Full Name:
          </Typography>
          <Typography variant="caption" fontWeight={500}>
            {data.full_name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Last Name:
          </Typography>
          <Typography variant="caption" fontWeight={500}>
            {data.last_name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Email Id:
          </Typography>
          <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
            {data.email}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Phone:
          </Typography>
          <Typography variant="caption" fontWeight={500}>
            {data.mobile}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Address:
          </Typography>
          <Typography variant="caption" fontWeight={500} sx={{ textAlign: 'right', maxWidth: '60%' }}>
            {data.residence_address}
          </Typography>
        </Box>

      </CardContent>
    </Card>
  );
};

export default CustomerProfileCard;