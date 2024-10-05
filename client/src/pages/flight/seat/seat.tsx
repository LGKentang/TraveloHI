import "../../../styles/main/main.scss";
import "../../../styles/parts/flight/SeatSelector.scss";

export default function Seat({ text, seatClass, onClicked, selectedSeatClass, isSelected }: any) {
  const colorSelector = () => {
 switch (seatClass) {
      case "First Class":
        return  isSelected ? "first-class" : selectedSeatClass === "First Class" ? "first":"grayscale";
      case "Business Class":
        return isSelected ? "business-class" : selectedSeatClass === "Business Class" ? "second":"grayscale";
      case "Economy Class":
        return isSelected ? "economy-class" : selectedSeatClass === "Economy Class" ? "third":"grayscale";
      case "Taken":
        return "grayscale";
        default:
        return "";
    }
    
  };

  return (
    <div
      onClick={() => onClicked(text)}
      className={`seat-object ${colorSelector()} paper-np`}
      style={{ pointerEvents: selectedSeatClass === seatClass ? "auto" : "none" }} // Disable pointer events if seat class doesn't match selected class
    >
      {text}
    </div>
  );
}
