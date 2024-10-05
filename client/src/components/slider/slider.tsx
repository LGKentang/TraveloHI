import { Link } from 'react-router-dom';
import '../../styles/components/Slider/slider.scss'

export interface ICard {
    image : string;
    routePath : string;
}

interface ISlider {
    cards : ICard[] | null;
}

export default function Slider({cards} : ISlider){
    return <>
   <div className="slider">
            <div className="carousel">
                {cards && cards.map((card, index) => (    
                    <Link key={index} to={card.routePath} className="card">
                        <img src={card.image}/>
                    </Link>
                ))}
            </div>
        </div>
    </>
}