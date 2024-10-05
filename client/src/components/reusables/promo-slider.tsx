import { useEffect, useState } from "react";
import Slider, { ICard } from "../slider/slider";
import { getAllPromo } from "../../context/db";

export default function PromoSlider() {
  const [promos, setPromos] = useState<ICard[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currPromos = await getAllPromo();
        // console.log(currPromos);
        const promoCards: ICard[] = currPromos.map((promo: any) => ({
            image: promo.ImagePath,
            routePath: promo.ID
        }));
        // console.log(promoCards);
        setPromos(promoCards);
      } catch (error) {
        console.error("Error fetching promos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Slider cards={promos}></Slider>
  );
}
