import axiosInstance from "./axiosInstance";

// ===== Customer Portal Types =====

// Unit information inside a booking
export interface BookingUnit {
  tower: string;
  floor: string | number;
  unit: string;
  project: string;
}
// ================= DEMAND NOTE ENDPOINTS =================

export const APPLICANT_BY_ACCOUNT_ID = "/applicant-id/";

export const DEMAND_NOTES = "/Financial/demand-notes/";

// Booking details from API
export interface Booking {
  id: number;
  date: string;
  booking_units?: BookingUnit[];   // array of unit objects
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

// Customer profile from API
export interface CustomerProfile {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  residence_address: string;
  avatar?: string;
  bookings?: Booking[];
}

// Unit details used in your UI
export interface UnitDetails {
  unitNo: string;
  tower: string;
  floor: string;
  projectName: string;
}

// Booking details used in your UI
export interface BookingDetails {
  agreementValue: number;
  sourceOfBooking: string;
  dateOfBooking: string;
  carpetArea: string;
  carParking: number;
}

// Financial summary used in your UI
export interface FinancialData {
  totalDemandRaised: number;
  totalDemandPaid: number;
  registrationDate: string;
}

// Combined type for component state
export interface CustomerData {
  customerProfile: CustomerProfile;
  unitDetails: UnitDetails;
  bookingDetails: BookingDetails;
  financialData: FinancialData;
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
    file: string; // actual URL from backend
    uploaded_on: string;
  }[];
}

export interface Notice {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  status: "Active" | "Expired";
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  image: string;
  status: "Upcoming" | "Completed";
}

export interface ProjectReference {
  id: number;
  title: string;
  location: string;
  image: string;
}

export interface Referral {
  id: number;
  projectName: string;
  referredPerson: string;
  status: "Processed" | "Approved" | "Pending";
}

export interface BankApproval {
  id: number;
  bankName: string;
  logo: string;
  project: string;
  tower: string;
  apfNumber: string;
}

export interface HelpDeskTicket {
  id: number;
  ticketNumber: string;
  customerName: string;
  category: string;
  subCategory: string;
  title: string;
  description: string;
  status: "Open" | "Closed" | "Pending" | "Completed";
  createdBy: string;
  createdOn: string;
  ticketType: "Complaint" | "Request" | "Suggestion";
  totalTime: string;
}

// ===== Customer Portal API Endpoints =====

/**
 * Fetch customer profile by ID
 */
// export const fetchCustomerProfile = async (customerId: number): Promise<CustomerProfile> => {
//   const response = await axiosInstance.get<CustomerProfile>(`/applicants/${customerId}/`);
//   return response.data;
// };
export const fetchCustomerProfile = async (customerId: number): Promise<CustomerProfile> => {
  try {
    // Add query parameter to get expanded/nested data if your API supports it
    const response = await axiosInstance.get<CustomerProfile>(
      `/applicants/${customerId}/`,
      {
        params: {
          expand: 'bookings,bookings.booking_units' // Adjust based on your API
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    throw error;
  }
};

/**
 * Fetch all units owned by customer
 */
export const fetchCustomerUnits = async (customerId: number): Promise<UnitDetails[]> => {
  const response = await axiosInstance.get<UnitDetails[]>(`/customer-portal/units/${customerId}/`);
  return response.data;
};

/**
 * Fetch financial summary for a specific unit
 */


/**
 * Fetch construction progress updates for a project
 */
// export const fetchConstructionUpdates = async (id: number): Promise<ConstructionUpdate[]> => {
//   const response = await axiosInstance.get<ConstructionUpdate[]>(`/construction_update/construction-updates/${id}/`);
//   return response.data;
// };

export const fetchConstructionUpdates = async (projectId: number): Promise<ConstructionUpdate[]> => {
  const response = await axiosInstance.get(
    `/construction_update/construction-updates/?project=${projectId}`
  );
  return response.data;
};



/**
 * Fetch notices for customer
 */
export const fetchCustomerNotices = async (customerId: number): Promise<Notice[]> => {
  const response = await axiosInstance.get<Notice[]>(`/customer-portal/notices/${customerId}/`);
  return response.data;
};

/**
 * Fetch events for customer
 */
export const fetchCustomerEvents = async (customerId: number): Promise<Event[]> => {
  const response = await axiosInstance.get<Event[]>(`/customer-portal/events/${customerId}/`);
  return response.data;
};

/**
 * Fetch other project references
 */
export const fetchProjectReferences = async (): Promise<ProjectReference[]> => {
  const response = await axiosInstance.get<ProjectReference[]>("/customer-portal/projects/");
  return response.data;
};

/**
 * Fetch customer referrals
 */
export const fetchCustomerReferrals = async (customerId: number): Promise<Referral[]> => {
  const response = await axiosInstance.get<Referral[]>(`/customer-portal/referrals/${customerId}/`);
  return response.data;
};

/**
 * Submit new referral
 */
export const createReferral = async (data: {
  customerId: number;
  projectName: string;
  referredPerson: string;
  referredEmail: string;
  referredPhone: string;
}) => {
  const response = await axiosInstance.post("/customer-portal/referrals/", data);
  return response.data;
};

/**
 * Fetch bank approvals for project
 */
export const fetchBankApprovals = async (projectId: number): Promise<BankApproval[]> => {
  const response = await axiosInstance.get<BankApproval[]>(`/customer-portal/bank-approvals/${projectId}/`);
  return response.data;
};

/**
 * Fetch help desk tickets for customer
 */
export const fetchHelpDeskTickets = async (customerId: number): Promise<HelpDeskTicket[]> => {
  const response = await axiosInstance.get<HelpDeskTicket[]>(`/customer-portal/tickets/${customerId}/`);
  return response.data;
};

/**
 * Create new help desk ticket
 */
export const createHelpDeskTicket = async (data: {
  customerId: number;
  relatedTo: string;
  typeOf: string;
  category: string;
  title: string;
  description: string;
  files?: File[];
}) => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'files' && value !== undefined) {
      formData.append(key, value as string);
    }
  });

  if (data.files) {
    data.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await axiosInstance.post("/customer-portal/tickets/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  
  return response.data;
};

/**
 * Download demand letter
 */
export const downloadDemandLetter = async (unitId: string): Promise<Blob> => {
  const response = await axiosInstance.get(`/customer-portal/documents/demand-letter/${unitId}/`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Download payment receipt
 */
export const downloadPaymentReceipt = async (unitId: string, paymentId: number): Promise<Blob> => {
  const response = await axiosInstance.get(`/customer-portal/documents/payment-receipt/${unitId}/${paymentId}/`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Download customer ledger
 */
export const downloadCustomerLedger = async (unitId: string): Promise<Blob> => {
  const response = await axiosInstance.get(`/customer-portal/documents/customer-ledger/${unitId}/`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Download interest ledger
 */
export const downloadInterestLedger = async (unitId: string): Promise<Blob> => {
  const response = await axiosInstance.get(`/customer-portal/documents/interest-ledger/${unitId}/`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (customerId: number, data: Partial<CustomerProfile>) => {
  const response = await axiosInstance.put(`/customer-portal/profile/${customerId}/`, data);
  return response.data;
};

/**
 * Fetch dashboard summary
 */
export const fetchDashboardSummary = async (customerId: number) => {
  const response = await axiosInstance.get(`/customer-portal/dashboard/${customerId}/`);
  return response.data;
};

export const getAllDocumentConfiguration = async()=>{
const res = await axiosInstance.get("/DMS/document-configurations/");
return res;
}