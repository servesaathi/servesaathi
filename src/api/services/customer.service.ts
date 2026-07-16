import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';

export interface AddressPayload {
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  // Backend validates these as "latitude/longitude string or number"
  latitude?: string | number;
  longitude?: string | number;
}

export interface Address extends AddressPayload {
  id: string;
}

export const customerService = {
  getAddresses: async (): Promise<Address[]> => {
    const res = await apiClient.get<ApiEnvelope<Address[]>>(ENDPOINTS.customers.addresses);
    return res.data.data;
  },

  addAddress: async (payload: AddressPayload): Promise<Address> => {
    const res = await apiClient.post<ApiEnvelope<Address>>(
      ENDPOINTS.customers.addresses,
      payload
    );
    return res.data.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.customers.address(id));
  },
};

export default customerService;
