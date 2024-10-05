import { useNavigate } from "react-router-dom";

export default function GlobalNavigator () {
    const navigate = useNavigate();

    const navigateToHotelPage = (id: number) => {
        navigate("/home/hotel", { state: { hotelId: id } });
    };



    
    return {navigateToHotelPage}
}