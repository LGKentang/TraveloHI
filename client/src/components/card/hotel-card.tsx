interface IHotelCard{
    photoPath : string;
    name : string;
    address : string;
    description : string;
}

export default function HotelCard ({photoPath, name, address, description} : IHotelCard){
    return (
        <div className="hotel-card">
            <img src={photoPath} alt={name} />
            <div className="hotel-details">
                <h3>{name}</h3>
                <p>{address}</p>
                <p>{description}</p>
            </div>
        </div>
    );
}