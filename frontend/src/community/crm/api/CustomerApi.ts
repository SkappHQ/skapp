import authFetch from "~community/common/utils/axiosInterceptor";
import { CreateCrmCompanyPayload } from "../types/CrmCompanyTypes";
import { companyEndpoints } from "./utils/ApiEndpoints";

export const createNewCompany = async (companyDetails: CreateCrmCompanyPayload) => {
    try {
        const response = await authFetch.post(
            companyEndpoints.CREATE_COMPANY,
            companyDetails
        );
        return response.data.results[0];
    } catch (error) {
        console.error("Error adding customer:", error);
        throw error;
    }
}    