import React, { useState, useEffect } from 'react';
import project from "../assets/banner.mp4";
// import banner from "../assets/banner.mp4";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  CardMedia,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  Tooltip,
  Dialog,
  Fade,
  Slide,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountBalanceIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { LogOut } from 'lucide-react';
import Notes from "@mui/icons-material/StickyNote2";
import Email from "@mui/icons-material/Email";
import Call from "@mui/icons-material/Call";
import Task from "@mui/icons-material/Task";
import GroupsIcon from '@mui/icons-material/Groups';
import ActionDialog from "../components/ActionDialog";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DMSPage from './DMS';
// import EventIcon from "@mui/icons-material/Event";
// import OpenInNewIcon from "@mui/icons-material/OpenInNew";
// import SupportAgentIcon from "@mui/icons-material/SupportAgent";
// import BugReportIcon from "@mui/icons-material/BugReport";
import { fetchCustomerProfile, fetchConstructionUpdates } from "../api/endpoint";
//import DemandNotePage from "./DemandNote";
import PaymentReceiptsPage from "./PaymentReceipts";
//import CustomerLedger from "./CustomerOverview";
//import InterestLedger from "./InterestLedger";
import DemandNotePage from "./DemandNote";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SubTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface VibeConnectPortalProps {
  onLogout: () => void;
}


export interface CustomerProfile {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  residence_address: string;
  avatar?: string;
  bookings?: Booking[];
}

export interface Booking {
  id: number;
  date: string;
  booking_units?: BookingUnit[];
  service: string;
  payment_plan?: string;
  agreement_value?: string;
  booking_date?: string;
  carpet_area?: string;
  parking?: string | number;
  funding?: {
    loan_amount?: string;
  };
}

export interface BookingUnit {
  tower: string | number;
  tower_name?: string;
  floor: string | number;
  floor_name?: string;
  unit: string | number;
  unit_name?: string;
  project: string | number;
  project_name?: string;
}

export interface UnitDetails {
  unitNo: string;
  tower: string;
  floor: string;
  projectName: string;
}

export interface BookingDetails {
  agreementValue: number;
  sourceOfBooking: string;
  dateOfBooking: string;
  carpetArea: string;
  carParking: number;
}

export interface FinancialItem {
  totalDemandRaised: number;
  totalDemandPaid: number;
  registrationDate: string;
  progress: number;
  payableAmount: number;
}

export interface CustomerData {
  customerProfile: CustomerProfile;
  unitDetails: UnitDetails;
  bookingDetails: BookingDetails;
  project?: string;
  progress?: number;
   // FIX THIS
  financialData: {
    [unitNo: string]: FinancialItem;
  };
}

export interface ConstructionUpdate {
  id: number;
  update_id: string;
  project: number;
  project_name: string;
  title: string;
  description: string;
  status: "Active" | "Draft" | "Inactive";
  created_on: string;
  created_by: string;
  attachments: {
    id: number;
    file: string;
    uploaded_on: string;
  }[];
}



function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function SubTabPanel(props: SubTabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function VibeConnectPortal({ onLogout }: VibeConnectPortalProps) {
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogType, setDialogType] = useState<"note" | "email" | "call" | "task" | "meeting" | null>(null);
  
  // Sidebar visibility states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Mobile view state: 'left' | 'center' | 'right'
const [mobileView, setMobileView] = useState<'left' | 'center' | 'right'>('left');
  
  // const [open, setOpen] = useState(false);
  // const [selectedImage, setSelectedImage] = useState("");
  const [data, setData] = useState<CustomerData | null>(null);
  const [unitOptions, setUnitOptions] = useState<UnitDetails[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitDetails>({
    unitNo: "-",
    tower: "-",
    floor: "-",
    projectName: "-",
  });
  const [, setLoading] = useState(false);
  const [progressData, setProgressData] = useState<ConstructionUpdate[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [progressImageOpen, setProgressImageOpen] = useState(false);
  const [selectedProgressImage, setSelectedProgressImage] = useState<string>("");
  // 1️⃣ ADD userProjectId STATE
  const [userProjectId, setUserProjectId] = useState<number | null>(null);

   // State for selected view
  const [selectedView, setSelectedView] = useState<string | null>(null);


  

  // const handleMainTabChange = (_: React.SyntheticEvent, newValue: number) => {
  //   setMainTab(newValue);
  // };

  const handleSubTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSubTab(newValue);
  };

  // const handleSelectUnit = (unit: { tower: string; floor: string; unitNo: string }) => {
  //   setSelectedUnit(unit);
  //   setAnchorEl(null);
  // };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    onLogout();
  };

  // const handleOpen = (img: string) => {
  //   setSelectedImage(img);
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  //   setSelectedImage("");
  // };

  // const handleOpenProgressImage = (img: string) => {
  //   setSelectedProgressImage(img);
  //   setProgressImageOpen(true);
  // };

  const handleCloseProgressImage = () => {
    setSelectedProgressImage("");
    setProgressImageOpen(false);
  };

// Handle mobile menu cycling
const handleMobileMenuToggle = () => {
  if (mobileView === 'left') {
    setMobileView('center');
  } else if (mobileView === 'center') {
    setMobileView('right');
  } else {
    setMobileView('left');
  }
};


 useEffect(() => {
  const loadProfile = async () => {
    setLoading(true);
    // try {
    //   // Get logged-in user data from localStorage
    //   const authState = JSON.parse(localStorage.getItem("authState") || "{}");
    //   const userData = authState.user;
      
    //   if (!userData || !userData.id) {
    //     console.error("No user data found. Please login again.");
    //     setLoading(false);
    //     return;
    //   }
     try {
      // Get applicant_id from localStorage directly
      const applicantIdStr = localStorage.getItem("applicant_id");

      if (!applicantIdStr) {
        console.error("No applicant_id found in localStorage. Please login again.");
        setLoading(false);
        return;
      }
      const applicantId = Number(applicantIdStr);
      // Use the logged-in user's ID instead of hardcoded 35
      // const customerId = userData.id;
      const profile = await fetchCustomerProfile(applicantId);
      console.log("API response:", profile);

      const bookingUnits = profile.bookings?.[0]?.booking_units?.map((unit:any) => ({
        tower: unit.tower_name.toString(),
        floor: unit.floor_name.toString(),
        unitNo: unit.unit_name.toString(),
        projectName: unit.project_name.toString(),
      })) || [];

      setUnitOptions(bookingUnits);
      setSelectedUnit(bookingUnits[0] || null);

            // ✅ EXTRACT PROJECT ID FROM BOOKING UNIT
      const project = profile.bookings?.[0]?.booking_units?.[0]?.project;
      if (project) {
        setUserProjectId(project); // Store user's project ID
        console.log("User's Project ID:", project);
      }

      const firstBookingUnit = bookingUnits[0];

      const mappedData: CustomerData = {
        customerProfile: {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          mobile: profile.mobile,
          residence_address: profile.residence_address,
          avatar: profile.avatar,
        },
        unitDetails: firstBookingUnit || {
          tower: "-",
          floor: "-",
          unitNo: "-",
          projectName: "-",
        },
        bookingDetails: {
          agreementValue: parseFloat(profile.bookings?.[0]?.agreement_value || "0"),
          sourceOfBooking: profile.bookings?.[0]?.payment_plan || "-",
          dateOfBooking: profile.bookings?.[0]?.booking_date || "-",
          carpetArea: profile.bookings?.[0]?.carpet_area || "-",
          carParking: profile.bookings?.[0]?.parking ? 1 : 0,
        },
        financialData: {
          [firstBookingUnit?.unitNo]: {
            totalDemandRaised: parseFloat(profile.bookings?.[0]?.funding?.loan_amount || "0"),
            totalDemandPaid: 0,
            registrationDate: profile.bookings?.[0]?.booking_date || "-",
            progress: 0,
            payableAmount: 200000,
          },
        }
      };

      setData(mappedData);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  loadProfile();
}, []);

// 3️⃣ UPDATE Construction Updates useEffect to use userProjectId

useEffect(() => {
   // ✅ ONLY FETCH IF USER HAS A PROJECT ID
  if (!userProjectId) {
    console.warn("No project ID found for user");
    return;
  } // const projectId = 10;

  // Only fetch when "Construction Progress" tab is selected
  if (mainTab === 1) {
    const loadConstructionUpdates = async () => {
      setLoadingProgress(true);
      try {
        // ✅ USE USER'S PROJECT ID INSTEAD OF HARDCODED 10
        const updates = await fetchConstructionUpdates(userProjectId);
        
        console.log(`Fetched ${updates.length} updates for project ${userProjectId}`);
        setProgressData(updates);
      } catch (error) {
        console.error("Failed to fetch construction updates:", error);
        setProgressData([]); // Clear data on error
      } finally {
        setLoadingProgress(false);
      }
    };

    loadConstructionUpdates();
  }
}, [mainTab,userProjectId]); // run whenever mainTab changes


  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
      {/* App Bar */}
     <AppBar
  position="fixed"
  sx={{
    bgcolor: "white",
    zIndex: 1201,
    borderBottomLeftRadius: { xs: 0, md: 24 },
    borderBottomRightRadius: { xs: 0, md: 24 },
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  }}
>
  <Toolbar
    sx={{
      minHeight: { xs: 65, sm: 75, md: 90 },
      px: { xs: 1.5, sm: 3, md: 4 },
      display: "flex",
      alignItems: "center",
    }}
  >
    {/* Mobile Menu Button */}
    <IconButton
      sx={{
        display: { xs: "flex", md: "none" },
        mr: 1,
        color: "#1976d2",
      }}
      onClick={handleMobileMenuToggle}
    >
      <MenuIcon />
    </IconButton>

    {/* LOGO */}
    {/* <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    ><Box
        component="img"
        // src="https://www.arvindsmartspaces.com/wp-content/uploads/2022/08/arvind-logo.png"
        src="../../public/lotusNew.png"
        alt="Arvind Logo"
        sx={{
          height: { xs: 30, sm: 40, md: 65 },
          objectFit: "contain",
        }}
      />
      <Box
        component="img"
        // src="https://www.arvindsmartspaces.com/wp-content/uploads/2022/08/arvind-logo.png"
        src="../../public/darkTextLogo.png"
        alt="Arvind Logo"
        sx={{
          height: { xs: 35, sm: 35, md: 65 },
          objectFit: "contain",
        }}
      />
    </Box> */}
    <Box
  sx={{
    display: "flex",
    alignItems: "center",
  }}
>
  <Box
    component="img"
    src="../../public/lotusNew.png"
    alt="Arvind Logo"
    sx={{
      height: { xs: 30, sm: 40, md: 65 },
      objectFit: "contain",
      mr: { xs: 1, sm: 2, md: 3 }, // add horizontal space
    }}
  />
  <Box
    component="img"
    src="../../public/darkTextLogo.png"
    alt="Arvind Logo"
    sx={{
      height: { xs: 35, sm: 30, md: 65 },
      objectFit: "contain",
    }}
  />
</Box>


    {/* PUSH CONTENT TO RIGHT */}
    <Box sx={{ flexGrow: 1 }} />

    {/* ACTION SECTION */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 0.5, sm: 1 },
        overflow: 'hidden',
        flexShrink: 1
      }}
    >
      {/* WhatsApp only on md+ screens */}
      <IconButton
        sx={{
            fontSize: { xs: 18, sm: 22 },
        '& svg': { fontSize: { xs: 18, sm: 22 } },
          color: "#25D366",
          "&:hover": { bgcolor: "rgba(37, 211, 102, 0.08)" },
        }}
        onClick={() => window.open("https://wa.me/917506283400", "_blank")}
      >
        <WhatsAppIcon />
      </IconButton>

      <IconButton
        sx={{
          display: { xs: 'none', sm: 'inline-flex' }, // hide on extra small
        '& svg': { fontSize: { xs: 18, sm: 22 } },
          color: "#98baddff",
          "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
        }}
      >
        <NotificationsIcon />
      </IconButton>

      {/* Settings visible only on md+ */}
      <IconButton
        sx={{
         fontSize: { xs: 18, sm: 22 },
        '& svg': { fontSize: { xs: 18, sm: 22 } },
          color: "#1976d2",
          "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
        }}
      >
        <SettingsIcon />
      </IconButton>

      {/* Logout Always visible */}
      <IconButton
        onClick={handleLogout}
        sx={{
          color: "#1976d2",
          "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
        }}
      >
        <LogOut size={19} />
      </IconButton>
    </Box>
  </Toolbar>
</AppBar>


      {/* Left Sidebar */}
      
        <Card 
          sx={{
            p: 2.3,
            width: { xs: leftSidebarOpen ? '100%' : 0, md: leftSidebarOpen ? 427 : 0 },
            overflow: 'auto',
            transition: 'width 0.3s ease',
            position: { xs: 'fixed', md: 'relative' },
            zIndex: { xs: 1200, md: 'auto' },
            height: { xs: '100vh', md: 'auto' },
            display: { xs: mobileView === 'left' ? 'block' : 'none', md: 'block' },
          }}
        >
        <Box
          sx={{
            width: { xs: '100%', md: 307 },
            bgcolor: 'white',
            mt: { xs: 8, md: 9 },
            overflow: 'auto',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            display: leftSidebarOpen ? 'block' : 'none',
          }}
        >
          {/* Profile Section */}
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Avatar
              sx={{ 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 2,
                border: '4px solid #f5f5f5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: '2.5rem',
                bgcolor: 'darkgray',
                fontWeight: 600
              }}
              src="https://i.pravatar.cc/150?img=12"
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {data?.customerProfile.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem' }}>
              {data?.customerProfile.email}
            </Typography>
          </Box>

          {/* Action Icons */}
          <Box sx={{ display: "flex", justifyContent: "space-around", mt: 0, mb: 3, px: 2, textAlign: "center" }}>
            <Box onClick={() => setDialogType("note")} sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
              <IconButton size="small"><Notes sx={{ fontSize: 28 }} /></IconButton>
              <Typography sx={{ fontSize: 12, fontWeight: 520 }}>Notes</Typography>
            </Box>
            <Box onClick={() => setDialogType("email")} sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
              <IconButton size="small"><Email sx={{ fontSize: 28 }} /></IconButton>
              <Typography sx={{ fontSize: 12, fontWeight: 520 }}>Email</Typography>
            </Box>
            <Box onClick={() => setDialogType("call")} sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
              <IconButton size="small"><Call sx={{ fontSize: 28 }} /></IconButton>
              <Typography sx={{ fontSize: 12, fontWeight: 520 }}>Call</Typography>
            </Box>
            <Box onClick={() => setDialogType("task")} sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
              <IconButton size="small"><Task sx={{ fontSize: 28 }} /></IconButton>
              <Typography sx={{ fontSize: 12, fontWeight: 520 }}>Task</Typography>
            </Box>
            <Box onClick={() => setDialogType("meeting")} sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
              <IconButton size="small"><GroupsIcon sx={{ fontSize: 28 }} /></IconButton>
              <Typography sx={{ fontSize: 12, fontWeight: 520 }}>Meeting</Typography>
            </Box>
          </Box>

          {dialogType && (
            <ActionDialog open={Boolean(dialogType)} onClose={() => setDialogType(null)} type={dialogType} />
          )}

          <Box sx={{ px: 2 }}>
            {/* Tower Details */}
            <Button fullWidth variant="contained" sx={{ bgcolor: 'darkgray', color: 'white', mb: 2, py: 1.2, textTransform: 'none', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: 'gray' } }}>
              Tower Details
            </Button>

            {selectedUnit && (
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Unit Details</Typography>
                  <Tooltip title="Select Tower / Unit">
                    <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                      <ExpandMoreIcon />
                    </IconButton>
                  </Tooltip>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    {unitOptions.map((unit, idx) => (
                      <MenuItem 
                        key={idx} 
                        onClick={() => { setSelectedUnit(unit); setAnchorEl(null); }}
                      >
                        {unit.tower} — {unit.unitNo} ({unit.floor})
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Project:</Typography>
                  <Typography variant="caption" fontWeight={500}>{selectedUnit?.projectName || "-"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Tower:</Typography>
                  <Typography variant="caption" fontWeight={500}>{selectedUnit?.tower || "-"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Floor:</Typography>
                  <Typography variant="caption" fontWeight={500}>{selectedUnit?.floor || "-"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Unit No.:</Typography>
                  <Typography variant="caption" fontWeight={500}>{selectedUnit?.unitNo || "-"}</Typography>
                </Box>
              </CardContent>
            )}

            {/* Booking Details */}
            <Button fullWidth variant="contained" sx={{ bgcolor: 'darkgray', color: 'white', mb: 2, py: 1.2, textTransform: 'none', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: 'gray' } }}>
              Booking Details
            </Button>

            {data && (
              <Card sx={{ mb: 2, boxShadow: 'none', bgcolor: '#f9f9f9', borderRadius: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Agreement Value:</Typography>
                    <Typography variant="caption" fontWeight={500}>₹{data.bookingDetails.agreementValue.toLocaleString()} L</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Source of Booking:</Typography>
                    <Typography variant="caption" fontWeight={500}>{data.bookingDetails.sourceOfBooking || "-"}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Date Of Booking:</Typography>
                    <Typography variant="caption" fontWeight={500}>{data.bookingDetails.dateOfBooking || "-"}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Carpet Area:</Typography>
                    <Typography variant="caption" fontWeight={500}>{data.bookingDetails.carpetArea || "-"} sq.ft</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>No. of Car Parking:</Typography>
                    <Typography variant="caption" fontWeight={500}>{data.bookingDetails.carParking || 0}</Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Application Details */}
            <Button fullWidth variant="contained" sx={{ bgcolor: 'darkgray', color: 'white', mb: 2, py: 1.2, textTransform: 'none', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: 'gray' } }}>
              Application Details
            </Button>

            {data && (
              <Card sx={{ mb: 2, boxShadow: 'none', bgcolor: '#f9f9f9', borderRadius: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Name:</Typography>
                    <Typography variant="caption" fontWeight={500}>{data.customerProfile.full_name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Email:</Typography>
                    <Typography variant="caption" fontWeight={500}>{data.customerProfile.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Mobile:</Typography>
                    <Typography variant="caption" fontWeight={500}>{data.customerProfile.mobile}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Address:</Typography>
                    <Typography variant="caption" fontWeight={500} sx={{ textAlign: 'right', maxWidth: '60%' }}>{data.customerProfile.residence_address}</Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Customer Summary */}
            <Button fullWidth variant="contained" sx={{ bgcolor: 'darkgray', color: 'white', mb: 2, py: 1.2, textTransform: 'none', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: 'gray' } }}>
              Customer Summary
            </Button>

           {data && selectedUnit && (
  <Card sx={{ mb: 3, boxShadow: "none", bgcolor: "#f9f9f9", borderRadius: 2 }}>
    <CardContent sx={{ py: 2 }}>

      {(() => {
        const financial = data?.financialData?.[selectedUnit.unitNo] ?? null;

        if (!financial) {
          return (
            <Typography variant="caption" color="error">
              No financial data available for selected unit.
            </Typography>
          );
        }

        const safeNumber = (v: any) => {
          const n = Number(v);
          return isNaN(n) ? 0 : n;
        };

        const raised = safeNumber(financial.totalDemandRaised);
        const paid = safeNumber(financial.totalDemandPaid);
        const registrationDate = financial?.registrationDate || "-";

        return (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Demand Raised:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                ₹{raised.toFixed(2)} L
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total Demand Paid:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                ₹{paid.toFixed(2)} L
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Registration Date:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {registrationDate}
              </Typography>
            </Box>
          </>
        );
      })()}

    </CardContent>
  </Card>
)}


          </Box>
        </Box>
      </Card>

      {/* Center Content */}
      {/* Center Content */}
<Box sx={{ 
 
  flexGrow: 1, 
  mt: { xs: 8, md: 9 }, 
  overflow: 'auto', 
  display: { xs: mobileView === 'center' ? 'flex' : 'none', md: 'flex' },
  flexDirection: 'column',
  position: 'relative',
}}>
        {/* Desktop Toggle Buttons */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: { xs: 'none', md: 'block' } }}>
          <IconButton onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}>
            {leftSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: { xs: 'none', md: 'block' } }}>
          <IconButton onClick={() => setRightSidebarOpen(!rightSidebarOpen)} sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f5f5f5' } }}>
            {rightSidebarOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        {/* Video Section */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Paper sx={{ 
            width: '100%',
            maxWidth: 900,
            mx: 'auto',
            aspectRatio: { xs: '16/9', md: '12/5' },
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            
         <video
  controls
  autoPlay
  muted
  loop
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover", // fills area, crops excess
  }}
  poster="https://via.placeholder.com/1600x900/1e3a5f/ffffff?text=Welcome+to+Vibe+Connect"
>
  <source src={project} type="video/mp4" />
  Your browser does not support the video tag.
</video>
          </Paper>
        </Box>

        {/* Tabs Section */}
 {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, md: 3 } }}>
          <Tabs
            value={mainTab}
            onChange={(_, v) => setMainTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: { xs: '0.8rem', md: '0.9rem' } } }}
          >
            <Tab label="Financial" />
            <Tab label="Construction Progress" />
            <Tab label="Communication" />
            <Tab label="DMS" />
            <Tab label="Projects" />
            <Tab label="Help Desk" />
            <Tab label="Bank Approvals" />
          </Tabs>
        </Box>
  {/* --------------------------------------------Financial Details ----------------------------------------------- */}


{/* Tab Content */}
<TabPanel value={mainTab} index={0}>
  {data && data.financialData && selectedUnit && (
    <>
      {(() => {
        const activeFinancial =
          data.financialData[selectedUnit.unitNo] || null;

        const raised = Number(activeFinancial?.totalDemandRaised ?? 0);
        const paid = Number(activeFinancial?.totalDemandPaid ?? 0);
        const payable = raised - paid;
        const progress = Number(activeFinancial?.progress ?? 0);

        const actionCards = [
          { 
            icon: <DescriptionIcon sx={{ fontSize: { xs: 25, md: 35 } }} />, 
            label: "Demand Letter",
            component: "demand-letter",
            color: "#1976d2"
          },
          { 
            icon: <ReceiptIcon sx={{ fontSize: { xs: 25, md: 35 } }} />, 
            label: "Payment Receipt",
            component: "payment-receipt",
            color: "#2e7d32"
          },
          { 
            icon: <MenuBookIcon sx={{ fontSize: { xs: 25, md: 35 } }} />, 
            label: "Customer Ledger",
            component: "customer-ledger",
            color: "#ed6c02"
          },
          { 
            icon: <ShowChartIcon sx={{ fontSize: { xs: 25, md: 35 } }} />, 
            label: "Interest Ledger",
            component: "interest-ledger",
            color: "#9c27b0"
          },
        ];

        const handleCardClick = (component: string) => {
          setSelectedView(component);
        };

        const handleBackToCards = () => {
          setSelectedView(null);
        };

        /* ---------------------------------------
           🔥 THIS IS THE ONLY THING UPDATED
        ----------------------------------------*/
        const renderTableComponent = () => {
          switch (selectedView) {
            case "demand-letter":
              return <DemandNotePage />;

            case "payment-receipt":
              return <PaymentReceiptsPage />;

            // case "customer-ledger":
            //   return <CustomerLedger />;

            // case "interest-ledger":
            //   return <InterestLedger />;

            default:
              return null;
          }
        };

        const getSelectedCardLabel = () => {
          const card = actionCards.find(c => c.component === selectedView);
          return card?.label || "";
        };

        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            
            {/* Show Table View when a card is selected */}
            {selectedView ? (
              <Slide direction="left" in={selectedView !== null} mountOnEnter unmountOnExit>
                <Box sx={{ width: "90%" }}>

                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      mb: 3, 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 2,
                      bgcolor: "background.paper"
                    }}
                  >
                    <IconButton 
                      onClick={handleBackToCards}
                      color="primary"
                      size="large"
                      sx={{ 
                        bgcolor: "primary.light",
                        "&:hover": { 
                          bgcolor: "primary.main", 
                          color: "white",
                          transform: "scale(1.1)"
                        },
                        transition: "all 0.2s"
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Back to Financial Overview
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {getSelectedCardLabel()} - Unit {selectedUnit?.unitNo || "-"}
                      </Typography>
                    </Box>
                  </Paper>
                  
                  {/* Render the selected page */}
                  <Fade in={selectedView !== null} timeout={500}>
                    <Box>
                      {renderTableComponent()}
                    </Box>
                  </Fade>
                </Box>
              </Slide>
            ) : (
              /* Keep original card layout – unchanged */
              <Fade in={selectedView === null} mountOnEnter unmountOnExit>
                <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  
                  {/* All your UI remains same */}
                  {/* ====================== TOP FINANCIAL CARD ====================== */}
                  <Card
                    sx={{
                      maxWidth: 700,
                      width: "100%",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderRadius: 3,
                      mb: 3,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                        Unit {selectedUnit?.unitNo || "-"}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                        Project Name - {selectedUnit?.projectName || "No project info"}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Box>
                          <Typography variant="caption">Total Demand Raised</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            ₹{raised.toFixed(2)} L
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                          <Typography variant="caption">Total Demand Paid</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            ₹{paid.toFixed(2)} L
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
                            Payment Progress
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
                            {activeFinancial?.progress || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ height: 10, borderRadius: 5, mb: 2 }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CalendarIcon />
                          <Box>
                            <Typography variant="caption">Registration Date</Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {activeFinancial?.registrationDate || "-"}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AccountBalanceIcon />
                          <Box>
                            <Typography variant="caption">Amount Payable</Typography>
                            <Typography variant="body2" fontWeight={700}>
                              ₹{payable.toFixed(2)} L
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* ====================== ACTION GRID ====================== */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 2,
                      mt: 1,
                      width: "99%",
                    }}
                  >
                    {actionCards.map((item, i) => (
                      <Paper
                        key={i}
                        onClick={() => handleCardClick(item.component)}
                        elevation={3}
                        sx={{
                          width: { xs: "45%", sm: 170 },
                          height: { xs: 120, sm: 150 },
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          borderRadius: 3,
                          transition: "all 0.3s ease",
                          border: "2px solid transparent",
                          "&:hover": { 
                            transform: "translateY(-8px)",
                            boxShadow: 6,
                            borderColor: item.color,
                            "& .card-icon": {
                              color: item.color,
                              transform: "scale(1.2)"
                            }
                          },
                        }}
                      >
                        <Box 
                          className="card-icon"
                          sx={{ 
                            transition: "all 0.3s ease",
                            color: "text.primary"
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mt: 1,
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                            textAlign: "center",
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        );
      })()}
    </>
  )}
</TabPanel>


          {/* --------------------------------------------construction update ----------------------------------------------- */}


<TabPanel value={mainTab} index={1}>
  <Box sx={{ maxWidth: 720, mx: "auto" }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 2, md: 3 }, color: "text.primary" }}>
       Progress
    </Typography>

    {/* Loading / Empty */}
    {loadingProgress ? (
      <Typography variant="body2" color="text.secondary">
        Loading updates...
      </Typography>
    ) : !progressData || progressData.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        No construction updates available.
      </Typography>
    ) : (
      <Box
        sx={{
          position: "relative",
          pl:{ xs: 2, sm: 3 },
          "&::before": {
            content: '""',
            position: "absolute",
            left: { xs: 8, sm: 16 },
            top: 0,
            bottom: 0,
            width: "2px",
            backgroundColor: "#f3c57b",
          },
        }}
      >
        {progressData.map((item) => {
          //  const imageURL =
          //   item.attachments?.[0]?.file
          //     ? `${import.meta.env.VITE_API_BASE_URL}${item.attachments[0].file}`
          //     : null;
          // const baseURL = import.meta.env.VITE_API_BASE_URL || "";
          // const filePath = item.attachments?.[0]?.file;

          // const imageURL = filePath ? `${baseURL}${filePath}` : null;

          const baseURL = "http://localhost:8001";
          const filePath = item.attachments?.[0]?.file;
          const imageURL = filePath ? `${baseURL}${filePath}` : null;

          return (
            <Box key={item.id} sx={{ display: "flex", flexDirection: "column", mb: 3, position: "relative" }}>
              
              {/* Timeline Dot */}
              <Box
                sx={{
                  width: { xs: 10, sm: 12 },
                  height: { xs: 10, sm: 12 },
                  borderRadius: "50%",
                  backgroundColor: "#f3c57b",
                  position: "absolute",
                  left: { xs: "-1px", sm: "-2px" },
                  top:  { xs: 8, sm: 10 },
                }}
              />

              {/* Card */}
              <Paper
                elevation={1}
                sx={{
                  borderRadius: { xs: 2, md: 3 },
                  p: { xs: 2, sm: 3, md: 4 },
                  ml: { xs: 3, sm: 4 },
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {/* Text Section */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#f3c57b", fontWeight: 600 }}>
                      {item.created_on}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '0.875rem', md: '1rem' },
                        mt: { xs: 1, sm: 0 }
                         }}>
                    {item.description}
                  </Typography>
                </Box>

                {/* Clickable Image */}
                {imageURL && (
                  <Box
                    component="img"
                    src={imageURL}
                    alt="progress"
                      onClick={() => {
                          setSelectedProgressImage(imageURL);
                          setProgressImageOpen(true);
                        }}
                    sx={{
                      width: { xs: '100%', sm: 80 },
                      height: { xs: 120, sm: 60 },
                      borderRadius: 2,
                      objectFit: "cover",
                      flexShrink: 0,
                      border: "1px solid #eee",
                      cursor: "pointer",
                      transition: "0.3s",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    )}

    {/* Image Popup */}
    <Dialog
      open={progressImageOpen} onClose={handleCloseProgressImage}
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden", background: "rgba(0,0,0,0.8)" } }}
      TransitionComponent={Fade}
    >
      <Box sx={{ position: "relative" , minHeight: { xs: "100vh", sm: "auto" } }}>
        <IconButton
          // onClick={() => setOpen(false)}
          onClick={handleCloseProgressImage}
          sx={{
            position: "absolute",
            top: { xs: 16, sm: 8 },
            right: { xs: 16, sm: 8 },
            color: "white",
            zIndex: 2,
            bgcolor: "rgba(0,0,0,0.3)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
          }}
        >
          <CloseIcon />
        </IconButton>
       
       {selectedProgressImage && (
  <Box
    component="img"
    src={selectedProgressImage}
    alt="preview"
    sx={{
      width: "100%",
        height: { xs: "100vh", sm: "auto" },
        maxHeight: { xs: "100vh", sm: "85vh" },
      objectFit: "contain",
       display: "block"
    }}
  />
)}
      </Box>
      
    </Dialog>
  </Box>
</TabPanel>



      {/* --------------------------------------------communication  section ----------------------------------------------- */}

       <TabPanel value={mainTab} index={2}>
  <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
    {/* Sub Tabs - Responsive */}
    <Box 
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: { xs: 2, sm: 3 },
        display: 'flex', 
        justifyContent: { xs: 'flex-start', sm: 'center' },
        overflowX: { xs: 'auto', sm: 'visible' }
      }}
    >
      <Tabs 
        value={subTab} 
        onChange={handleSubTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            minWidth: { xs: 100, sm: 160 },
            px: { xs: 2, sm: 3 }
          }
        }}
      >
        <Tab label="Notice Board" />
        <Tab label="Events" />
      </Tabs>
    </Box>

    {/* ========== NOTICE BOARD TAB ========== */}
    <SubTabPanel value={subTab} index={0}>
      <Box 
          sx={{
    display: 'flex',
    gap: { xs: 2, sm: 3 },
    flexWrap: { xs: 'wrap', md: 'nowrap' }, // 🟢 wrap on small, no wrap on medium+
    justifyContent: 'center', // center horizontally
    width: '100%',
  }}
      >
        {/* Notice Card 1 - Active */}
        <Card 
          sx={{ 
            width: { xs: '100%', sm: 350, md: '45%' }, // 🟢 take 45% of container on md+
            maxWidth: 350,
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-4px)' },
              boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.08)', sm: '0 8px 20px rgba(0,0,0,0.12)' }
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                Dear Residents,
              </Typography>
              <Chip 
                label="Active" 
                color="success" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Community Meeting
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                lineHeight: 1.6,
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              Monthly community meeting to discuss upcoming events and maintenance updates. All residents are welcome to join and participate...
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 }, 
                pt: 2, 
                borderTop: '1px solid #f0f0f0',
                flexWrap: 'wrap'
              }}
            >
              <CalendarIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'text.secondary' }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                13 May 2025
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                • 10:00 AM
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Notice Card 2 - Expired */}
        <Card 
          sx={{ 
            width: { xs: '100%', sm: 350, md: '45%' }, // 🟢 take 45% of container on md+
            maxWidth: 350,
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-4px)' },
              boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.08)', sm: '0 8px 20px rgba(0,0,0,0.12)' }
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                Dear Residents,
              </Typography>
              <Chip 
                label="Expired" 
                color="error" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Holi Celebration
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                lineHeight: 1.6,
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              Thank you for making our Holi celebration colorful and memorable. Looking forward to more community events together...
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 }, 
                pt: 2, 
                borderTop: '1px solid #f0f0f0',
                flexWrap: 'wrap'
              }}
            >
              <CalendarIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'text.secondary' }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                14 Mar 2025
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                • 10:00 AM
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </SubTabPanel>

    {/* ========== EVENTS TAB ========== */}
    <SubTabPanel value={subTab} index={1}>
      <Box 
        sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 3 }, 
          flexWrap: { xs: 'wrap', md: 'nowrap' }, // 🟢 wrap on small, no wrap on medium+
          justifyContent: 'center', // center horizontally
          width: '100%',
        }}
      >
        {/* Event Card 1 - Upcoming */}
        <Card 
          sx={{ 
            width: { xs: '100%', sm: 350, md: '45%' }, // 🟢 take 45% of container on md+
            maxWidth: 350,
            position: 'relative', 
            overflow: 'hidden', 
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-4px)' },
              boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.08)', sm: '0 8px 20px rgba(0,0,0,0.12)' }
            }
          }}
        >
          <Box
            sx={{
              height: { xs: 160, sm: 180 },
              backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <Chip 
              label="Upcoming" 
              color="success" 
              size="small"
              sx={{ 
                position: 'absolute', 
                top: { xs: 8, sm: 12 }, 
                right: { xs: 8, sm: 12 },
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            />
          </Box>
          
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 600, 
                display: 'block', 
                mb: 1,
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            >
              Dear Residents,
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Diwali Celebration
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                lineHeight: 1.6,
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              Join us for the grand Diwali celebration with music, dance, and festive activities for all ages...
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 }, 
                pt: 2, 
                borderTop: '1px solid #f0f0f0',
                flexWrap: 'wrap'
              }}
            >
              <CalendarIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'text.secondary' }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                05 Nov 2025
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                • 06:00 PM
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Event Card 2 - Completed */}
        <Card 
          sx={{ 
            width: { xs: '100%', sm: 350, md: '45%' }, // 🟢 take 45% of container on md+
            maxWidth: 350,
            position: 'relative', 
            overflow: 'hidden', 
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-4px)' },
              boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.08)', sm: '0 8px 20px rgba(0,0,0,0.12)' }
            }
          }}
        >
          <Box
            sx={{
              height: { xs: 160, sm: 180 },
              backgroundImage: 'url(https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <Chip 
              label="Completed" 
              size="small" 
              sx={{ 
                position: 'absolute', 
                top: { xs: 8, sm: 12 }, 
                right: { xs: 8, sm: 12 }, 
                bgcolor: '#757575', 
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            />
          </Box>
          
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 600, 
                display: 'block', 
                mb: 1,
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            >
              Dear Residents,
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Ganesh Chaturthi
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 3 }, 
                lineHeight: 1.6,
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              Thank you all for making our Ganesh Chaturthi celebration a grand success with your participation...
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 }, 
                pt: 2, 
                borderTop: '1px solid #f0f0f0',
                flexWrap: 'wrap'
              }}
            >
              <CalendarIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'text.secondary' }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                07 Sep 2025
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                • 05:00 PM
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </SubTabPanel>
  </Box>
</TabPanel>

{/*------------------------------------- DMS--------------------------------------  */}
<TabPanel value={mainTab} index={3}>
  <DMSPage />
</TabPanel>


  {/* --------------------------------------------project referrals----------------------------------------------- */}


  <TabPanel value={mainTab} index={4}>
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
    {/* Sub Tabs - Responsive */}
    <Box 
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: { xs: 2, sm: 3 },
        display: 'flex', 
        justifyContent: { xs: 'flex-start', sm: 'center' },
        overflowX: { xs: 'auto', sm: 'visible' }
      }}
    >
      <Tabs 
        value={subTab} 
        onChange={handleSubTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            minWidth: { xs: 100, sm: 160 },
            px: { xs: 2, sm: 3 }
          }
        }}
      >
        <Tab label="Other Projects" />
      <Tab label="Referrals" />
      </Tabs>
    </Box>

  {/* ===================== Other Projects Tab ===================== */}
  <SubTabPanel value={subTab} index={0}>
    <Box   sx={{
    display: 'flex',
    gap: { xs: 2, sm: 3 },
    flexWrap: { xs: 'wrap', md: 'nowrap' }, // 🟢 wrap on small, no wrap on medium+
    justifyContent: 'center', // center horizontally
    width: '100%',
  }}
    >
      {[
        {
          title: "Lotus Ayana",
          location: "Juhu, Mumbai",
          img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
        },
        {
          title: "Lotus Arc One",
          location: "Juhu, Mumbai",
          img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        },
      ].map((item, idx) => (
        <Card
          key={idx}
          sx={{
            width: { xs: '100%', sm: 350, md: 350 }, // Full width on mobile, fixed on larger screens
            maxWidth: 350, // Prevent cards from getting too large
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <CardMedia
            component="img"
            height="180"
            image={item.img}
            alt={item.title}
            sx={{
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              objectFit: "cover",
            }}
          />
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}> {/* Responsive padding */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {item.location}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="text"
                size="small"
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: { xs: '0.875rem', sm: '0.9rem' } // Responsive font size
                }}
              >
                I am Interested →
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  </SubTabPanel>

  {/* ===================== Referrals Tab ===================== */}
  <SubTabPanel value={subTab} index={1}>
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 2,
      px: { xs: 1, sm: 2 } // Add horizontal padding on mobile
    }}>
      {[
        { name: "Ananya", person: "Anurag Sharma", status: "Processed" },
        { name: "The Arcadian", person: "Aniket Parkar", status: "Approved" },
      ].map((ref, idx) => (
        <Card
          key={idx}
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            p: { xs: 2, sm: 2.5 }, // Responsive padding
            display: "flex",
            flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on mobile
            justifyContent: "space-between",
            alignItems: { xs: 'flex-start', sm: 'center' }, // Align differently on mobile
            gap: { xs: 1.5, sm: 0 }, // Add gap on mobile
            bgcolor:'lightgray'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' } // Responsive font size
            }}>
              {ref.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ref.person}
            </Typography>
          </Box>
          <Chip
            label={ref.status}
            sx={{
              fontWeight: 600,
              bgcolor: ref.status === "Approved" ? "#a7e3a7" : "#cfd8e6",
              color: ref.status === "Approved" ? "#1b5e20" : "#0d47a1",
              alignSelf: { xs: 'flex-start', sm: 'auto' } // Align chip on mobile
            }}
          />
        </Card>
      ))}
    </Box>
  </SubTabPanel>
  </Box>
</TabPanel>

        {/*--------------------------------- help desk  --------------------------------------*/}

    <TabPanel value={mainTab} index={5}>
  <Box sx={{ 
    borderBottom: 1, 
    borderColor: 'divider', 
    mb: 3,
    
    // width: '100%', // Changed from fixed 755px
    maxWidth: 900, // Add max width for very large screens
    mx: 'auto', // Center the content
    px: { xs: 1, sm: 2 } // Add horizontal padding
  }}>
   
    {/* Top Summary Cards */}
    <Box sx={{ 
      display: "flex", 
      gap: { xs: 1, sm: 1.5 }, 
      flexWrap: "wrap", 
      mb: 1,
      justifyContent: { xs: 'center', sm: 'flex-start' } // Center on mobile
    }}>
      {[
        { label: "Pending", count: 1, color: "error.main" },
        { label: "Complaint", count: 1, color: "primary.main" },
        { label: "Request", count: 0, color: "text.disabled" },
        { label: "Suggestion", count: 0, color: "text.disabled" },
      ].map((item) => (
        <Box
          key={item.label}
          sx={{
            flex: { xs: "1 1 calc(50% - 8px)", sm: "1 1 100px" }, // 2 columns on mobile
            maxWidth: { xs: 180, sm: 160 },
            minWidth: { xs: 140, sm: 100 },
            textAlign: "center",
            borderRadius: 4,
            py: { xs: 0.8, sm: 0.6 },
            px: 1,
            boxShadow: 1,
            border: `1.5px solid ${item.count ? item.color : "#e0e0e0"}`,
            bgcolor: item.count ? "#fff" : "#f9f9f9",
            transition: "all 0.25s ease",
            cursor: "pointer",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: 3,
              borderColor: item.color,
              bgcolor: "#fafafa",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}
          >
            {item.label}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: item.color,
              fontWeight: 600,
              fontSize: { xs: 16, sm: 18 },
            }}
          >
            {item.count}
          </Typography>
        </Box>
      ))}
    </Box>
    <br />

    {/* Filter and Search Row */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mb: 2,
      }}
    >
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 2,
        flexWrap: "wrap",
        width: { xs: '100%', md: 'auto' }
      }}>
        <FormControl 
          size="small" 
          sx={{ 
            minWidth: { xs: '100%', sm: 180 },
            maxWidth: { sm: 250 }
          }}
        >
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filter}
            label="Filter by Status"
            onChange={(e) => setFilter(e.target.value)}
            sx={{
              borderRadius: 5,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {["All", "Open", "Closed", "Pending", "Completed"].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Search */}
        <TextField
          placeholder="Search by Title, Ticket number..."
          size="small"
          sx={{ 
            width: { xs: '100%', sm: 250, md: 300 },
            '& input::placeholder': {
              fontSize: { xs: 13, sm: 14 }
            }
          }}
        />
      </Box>

      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />

      {/* Add Button */}
      <Button
        variant="outlined"
        sx={{
          borderRadius: 8,
          px: { xs: 3, sm: 5 },
          py: { xs: 0.75, sm: 1 },
          textTransform: "none",
          fontWeight: 600,
          width: { xs: '100%', sm: 'auto' }
        }}
        onClick={() => setShowForm(!showForm)}
      >
        Add
      </Button>
    </Box>

    {/* New Ticket Form */}
    {showForm && (
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: "#fff",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(to right, darkgray)",
            p: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ 
              color: "white", 
              textAlign: "center", 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            New Ticket
          </Typography>
        </Box>

        {/* Requestor Details */}
        <Typography
          variant="subtitle1"
          sx={{ 
            fontWeight: 600, 
            mb: 2, 
            color: "text.primary",
            fontSize: { xs: '0.95rem', sm: '1rem' }
          }}
        >
          Requestor Details:
        </Typography>

        {/* Two Column Layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 2, sm: 2 },
            mb: 3,
          }}
        >
          {/* Related To */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
            >
              Related To
            </Typography>
            <Select fullWidth defaultValue="" size="small">
              <MenuItem value="area1">Area 1</MenuItem>
              <MenuItem value="area2">Area 2</MenuItem>
            </Select>
          </Box>

          {/* Type Of */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
            >
              Type Of
            </Typography>
            <Select fullWidth defaultValue="" size="small">
              <MenuItem value="issue1">Issue Type 1</MenuItem>
              <MenuItem value="issue2">Issue Type 2</MenuItem>
            </Select>
          </Box>

          {/* Categories */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
            >
              Categories
            </Typography>
            <Select fullWidth defaultValue="" size="small">
              <MenuItem value="cat1">Category 1</MenuItem>
              <MenuItem value="cat2">Category 2</MenuItem>
            </Select>
          </Box>

          {/* Title */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
            >
              Title
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter Title"
              variant="outlined"
            />
          </Box>

          {/* Description */}
          <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
            >
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your concern"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* File Upload */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
          >
            Upload Files
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              color: "gray",
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Choose Files
            <input type="file" hidden />
          </Button>
        </Box>

        {/* Buttons */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ 
              textTransform: "none", 
              borderRadius: 2,
              color: 'gray',
              order: { xs: 2, sm: 1 }
            }}
          >
            Submit
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ 
              textTransform: "none", 
              borderRadius: 2,
              order: { xs: 1, sm: 2 }
            }}
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    )}

    {/* Table Section */}
    {!showForm && (
      <Box sx={{ overflowX: 'auto', mx: { xs: -1, sm: 0 } }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            minWidth: { xs: 600, sm: 'auto' } // Enable horizontal scroll on mobile
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "darkgray" }}>
              <TableRow>
                {[
                  "Action",
                  "Ticket num",
                  "Customer name",
                  "Category",
                  "Sub category",
                  "Title",
                  "Description",
                  "Status",
                  "Created by",
                  "Created on",
                  "Ticket type",
                  "Total time",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 600,
                      color: "white",
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                      fontSize: { xs: 13, sm: 14 },
                      px: { xs: 1.5, sm: 2 }
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 } }}>
                  <IconButton size="small" color="primary">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>11737</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>Mohit Pasi</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>Housekeeping</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>Cleaning</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>User Ticket Test</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>User Ticket Description</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>Pending</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>Mohit Pasi</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>28/10/2025</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>Complaint</TableCell>
                <TableCell sx={{ px: { xs: 1.5, sm: 2 }, fontSize: { xs: 13, sm: 14 } }}>15 days ago</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    )}
  </Box>
</TabPanel>

  {/* --------------------------------------------project approval bank----------------------------------------------- */}

      <TabPanel value={mainTab} index={6}>
  <Box sx={{ 
    p: { xs: 1, sm: 2 }, // Responsive padding
    maxWidth: 900, // Limit max width for better readability on large screens
    mx: 'auto' // Center the content
  }}>
    {[
      {
        id: 1,
        name: "ICICI Bank",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu4blF5gq3mzFpwhBJ9sXW-UVMyzsiEjxcdFzNQfm-cg&s",
        project: "Arvind Forreste",
        tower: "Tower 7",
        bankName: "ICICI Bank Ltd",
        apfNumber: "P11362312",
      },
      {
        id: 2,
        name: "Axis Bank",
        logo: "https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/axis-bank-logo-icon.png",
        project: "Arvind Forreste",
        tower: "Tower 7",
        bankName: "Axis Bank Ltd",
        apfNumber: "P11362312",
      },
      {
        id: 3,
        name: "HDFC Bank",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj_1OG2yhMLzYsORV2ceGWdPqYXUHpxvaboQ&s",
        project: "Arvind Forreste",
        tower: "Tower 7",
        bankName: "HDFC Bank Ltd",
        apfNumber: "P11362312",
      },
    ].map((bank) => (
      <Accordion
        key={bank.id}
        sx={{
          mb: { xs: 1.5, sm: 2 }, // Responsive margin
          borderRadius: { xs: 2, sm: 3 }, // Responsive border radius
          boxShadow: 3,
          overflow: "hidden",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#fff",
            py: { xs: 0.5, sm: 1 }, // Responsive vertical padding
            px: { xs: 1.5, sm: 2 }, // Responsive horizontal padding
            minHeight: { xs: 56, sm: 64 }, // Ensure minimum touch target size
            '& .MuiAccordionSummary-content': {
              my: { xs: 1, sm: 1.5 }, // Responsive margin
              alignItems: 'center'
            }
          }}
        >
          <Avatar
            src={bank.logo}
            alt={bank.name}
            variant="square"
            sx={{
              width: { xs: 36, sm: 45 }, // Responsive size
              height: { xs: 36, sm: 45 },
              mr: { xs: 1.5, sm: 2 }, // Responsive margin
              borderRadius: 1,
              bgcolor: "#fff",
              border: "1px solid #e0e0e0",
            }}
          />
          <Typography 
            variant="subtitle1" 
            fontWeight="bold"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' } // Responsive font size
            }}
          >
            {bank.name}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            px: { xs: 1.5, sm: 2 }, // Responsive horizontal padding
            pt: { xs: 1, sm: 2 },
            pb: { xs: 1.5, sm: 2 }
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 }, // Responsive padding
              borderRadius: 2,
              bgcolor: "#fafafa",
            }}
          >
            {[
              { label: "Project", value: bank.project },
              { label: "Tower", value: bank.tower },
              { label: "Bank Name", value: bank.bankName },
              { label: "Apf Number", value: bank.apfNumber },
            ].map((field, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
                  justifyContent: "space-between",
                  mb: { xs: 1.5, sm: 1 }, // More spacing on mobile
                  gap: { xs: 0.5, sm: 0 }, // Gap between label and value on mobile
                  '&:last-child': {
                    mb: 0 // Remove margin from last item
                  }
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ 
                    color: "text.secondary", 
                    fontWeight: 600,
                    fontSize: { xs: '0.813rem', sm: '0.875rem' } // Responsive font size
                  }}
                >
                  {field.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ 
                    fontWeight: 500, 
                    color: "text.primary",
                    fontSize: { xs: '0.813rem', sm: '0.875rem' }, // Responsive font size
                    wordBreak: 'break-word' // Prevent overflow on long text
                  }}
                >
                  {field.value}
                </Typography>
              </Box>
            ))}
          </Paper>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
</TabPanel>


      </Box>

      {/* --------------------------------------------About Us----------------------------------------------- */}

      {/* Right Sidebar - About Us */}
<Card
  sx={{
    p: 2.3,
    width: { xs: rightSidebarOpen ? '100%' : 0, md: rightSidebarOpen ? 427 : 0 },
    overflow: 'auto',
    transition: 'width 0.3s ease',
    position: { xs: 'fixed', md: 'relative' },
    zIndex: { xs: 1200, md: 'auto' },
    height: { xs: '100vh', md: 'auto' },
    display: { xs: mobileView === 'right' ? 'block' : 'none', md: 'block' },
  }}
>
   <Box
      sx={{
            width: { xs: '90%', md: 307 },
            bgcolor: 'white',
            mt: { xs: 8, md: 9 },
            overflow: 'auto',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            display: rightSidebarOpen ? 'block' : 'none',
             mx: "auto", // center content
          }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 2,
          textAlign: "center",
          color:"gray"
        }}
      >
        {/* Arvind SmartSpaces */}
        LOTUS DEVELOPERS
      </Typography>

      {/* ⭐ TECH SUPPORT CARD — place this ABOVE all accordions */}
<Card
  sx={{
    borderRadius: 3,
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    mb: 3,
    p: 2,
    bgcolor: "#ffffff",
     width: { xs: '80%', md: '260px' },  // smaller than outer container (307px)
    mx: "auto",  
  }}
>
  <Box display="flex" alignItems="center" >
  {/* Avatar */}
  <Avatar
    src="https://i.pravatar.cc/150?img=7"
    // src={`https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`}
    alt="Tech Support"
    sx={{ width: 56, height: 56, mr: 2 }}
  />

  <Box>
    <Typography variant="subtitle1" fontWeight={700}>
      Rahul Sharma
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Customer Support Engineer
    </Typography>

    <Box display="flex" alignItems="center" gap={1} mt={1}>
  {/* Status */}
  <Chip
    label="Online"
    size="small"
    color="success"
    sx={{ fontSize: "0.7rem" }}
  />

  {/* Score */}
  <Typography
    variant="body2"
    sx={{ fontWeight: 600, color: "#2479dbff" }}
  >
    ⭐ Score: 85%
  </Typography>
</Box>

  </Box>
</Box>


  {/* Contact Details */}
  <Box sx={{ mt: 2 }}>
    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Email sx={{ fontSize: 15 }} />&nbsp; rahul.it@company.com
    </Typography>

    <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
      📱&nbsp; +91 98765 43210
    </Typography>
  </Box>

  {/* Contact Buttons */}
  {/* <Box display="flex" gap={1} mt={2}>
    <Button
      fullWidth
      variant="contained"
      size="small"
      sx={{ textTransform: "none", borderRadius: 2 }}
    >
      Chat Now
    </Button>
    <Button
      fullWidth
      variant="outlined"
      size="small"
      sx={{ textTransform: "none", borderRadius: 2 }}
    >
      Email
    </Button>
  </Box> */}
</Card>


      {/* 1️⃣ ABOUT COMPANY */}
      <Accordion  sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={{ fontWeight: 700 }}>Company Info</Typography>
        </AccordionSummary>
           <AccordionDetails>
        <CardMedia
          component="img"
          image="https://www.arvindsmartspaces.com/wp-content/uploads/2022/02/Artboard-3-1-1.jpg"
          alt="Arvind SmartSpaces"
          sx={{
            borderRadius: 3,
            height: 160,
            objectFit: "cover",
            mb: 2,
          }}
        />

        {/* <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Arvind SmartSpaces Ltd</strong>, part of the Lalbhai Group,
          was founded in 2009 to transform urban landscapes with innovation,
          sustainability, and trust.
          
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          From residential to commercial developments, Arvind SmartSpaces
          delivers exceptional quality and transparency.
        </Typography> */}
        <Typography variant="body2" color="text.secondary" paragraph>
  <strong>Lotus Developers</strong> — founded in 2015 (with brand presence since 2003) — is a Mumbai‑based real estate developer focusing on luxury and ultra‑luxury residential and commercial projects, especially in the western suburbs such as Juhu, Andheri, Versova, Bandra etc. 
  <br />
  {/* <a href="https://lotusdevelopers.com" target="_blank" rel="noopener noreferrer">
    lotusdevelopers.com
  </a> */}
</Typography>

<Typography variant="body2" color="text.secondary" paragraph>
  They have delivered millions of square feet of high‑end real estate — including completed, ongoing and upcoming developments — offering homes with premium amenities, sea‑facing views, designer finishes, and commercial spaces.
</Typography>

      </AccordionDetails>
      </Accordion>

      {/* 2️⃣ NOTIFICATIONS */}
      <Accordion sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={{ fontWeight: 700 }}>
            Notifications <Chip label="0" size="small" sx={{ ml: 1 }} />
          </Typography>
        </AccordionSummary>

        {/* <AccordionDetails>
          {[
            "New project update available",
            "Your KYC will expire soon",
            "New document uploaded to your account"
          ].map((item, index) => (
            <Card
              key={index}
              sx={{
                mb: 1.5,
                borderRadius: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <NotificationsIcon sx={{ mr: 2, color: "#1976d2" }} />
                <Typography variant="body2">{item}</Typography>
              </CardContent>
            </Card>
          ))}
        </AccordionDetails> */}
      </Accordion>

      {/* 3️⃣ SUPPORT / TECHNICAL HELP */}
      <Accordion sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={{ fontWeight: 700 }}>
            Technical Support
             {/* <Chip label="" size="small" sx={{ ml: 1 }} /> */}
          </Typography>
        </AccordionSummary>

        {/* <AccordionDetails>
          {[
            { label: "Raise a Ticket", icon: BugReportIcon },
            { label: "Chat with Support", icon: SupportAgentIcon },
            { label: "Email Support", icon: SupportAgentIcon }
          ].map((support, i) => (
            <Card
              key={i}
              sx={{
                mb: 1.5,
                borderRadius: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <support.icon sx={{ mr: 2, color: "#0288d1" }} />
                <Typography variant="body2">{support.label}</Typography>
              </CardContent>
            </Card>
          ))}
        </AccordionDetails> */}
      </Accordion>

      {/* 4️⃣ YOUR OPEN TICKETS */}
      <Accordion sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={{ fontWeight: 700 }}>
            Open Tickets <Chip label="0" size="small" sx={{ ml: 1 }} />
          </Typography>
        </AccordionSummary>

        {/* <AccordionDetails>
          {[
            { title: "Portal Login Issue", status: "In Progress" },
            { title: "Payment Delay", status: "Resolved" }
          ].map((ticket, i) => (
            <Card
              key={i}
              sx={{
                mb: 1.5,
                borderRadius: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {ticket.title}
                  </Typography>
                  <IconButton size="small">
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Chip
                  label={ticket.status}
                  color={ticket.status === "Resolved" ? "success" : "warning"}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          ))}
        </AccordionDetails> */}
      </Accordion>

      {/* 5️⃣ UPCOMING MEETINGS */}
      <Accordion sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={{ fontWeight: 700 }}>
            Meetings <Chip label="0" size="small" sx={{ ml: 1 }} />
          </Typography>
        </AccordionSummary>

        {/* <AccordionDetails>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <EventIcon sx={{ mr: 2, color: "#8e24aa" }} />
              <Box>
                <Typography fontWeight={600}>Project Review Call</Typography>
                <Typography variant="body2" color="text.secondary">
                  Nov 20, 2025 • 4:00 PM
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </AccordionDetails> */}
      </Accordion>
       {/* 2️⃣ Vision & Mission Accordion */}
    <Accordion
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
          Vision & Mission
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, mb: 1, color: "#1e3a8a" }}
        >
          Vision
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          To be the most trusted real estate developer creating spaces that
          enrich lives and nurture communities.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, mb: 1, color: "#1e3a8a" }}
        >
          Mission
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          - Deliver superior quality through innovation.<br />
          - Foster transparency and trust.<br />
          - Build sustainable spaces.
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, mb: 1, color: "#1e3a8a" }}
        >
          Core Values
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Integrity • Innovation • Excellence • Sustainability • Trust
        </Typography>
      </AccordionDetails>
    </Accordion>

    {/* 3️⃣ Contact Information Accordion */}
    <Accordion
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
          Contact & Office Info
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Corporate Office:</strong><br />
         5th & 6th Floor, Lotus Tower, 1 Jai Hind Society, N. S. Road No. 12/A, JVPD Scheme, Juhu, Mumbai 400049, Maharashtra, India
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Phone:</strong> +91 7506283400
<br />
          <strong>Email:</strong> compliance@lotusdevelopers.com
        </Typography>

        <Typography variant="body2" color="text.secondary">
          <strong>Website:</strong>{" "}
          <a
            href="https://lotusdevelopers.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1e3a8a", textDecoration: "none" }}
          >
            www.lotusdevelopers.com
          </a>
        </Typography>
      </AccordionDetails>
    </Accordion>
    </Box>
</Card>

    </Box>
  );
}
