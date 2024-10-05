export const getAllPromo = async () => {
    const response = await fetch("http://localhost:3000/api/promo/all",{
        method: "GET",
        credentials: "include",
    }
    );
    const data = await response.json();
    return data;
}


