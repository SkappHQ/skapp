import { Box } from "@mui/material"
import { useCrmStore } from "~community/crm/store/crmStore"

const AddCompanyModal: React.FC = () => {
    const {
        setIsAddCompanyModalOpen,
        setCrmModalType
    } = useCrmStore((store) => {
        return {
            setIsAddCompanyModalOpen: store.setIsAddCompanyModalOpen,
            setCrmModalType: store.setCompanyModalType
        }
    })

    return (
        <Box>
            Company Add Modal
        </Box>
    )
}

export default AddCompanyModal;