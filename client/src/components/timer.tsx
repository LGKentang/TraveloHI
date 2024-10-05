import React, { useEffect, useState } from "react";
import "../styles/main/main.scss";

const Timer = ({ duration }: any) => {
  const [time, setTime] = useState(duration  - Date.now());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTime(time - 1000);
    }, 1000);

    // Clear timeout on component unmount
    return () => clearTimeout(timer);
  }, [time]);

  const getFormattedTime = (ms: any) => {
    let total_second = parseInt(Math.floor(ms / 1000).toString());
    let total_minute = parseInt(Math.floor(total_second / 60).toString());
    let total_hour = parseInt(Math.floor(total_minute / 60).toString());
    let total_day = parseInt(Math.floor(total_hour / 24).toString());

    let seconds = (total_second % 60).toString().padStart(2, '0');
    let minutes = (total_minute % 60).toString().padStart(2, '0');
    let hours = (total_hour % 24).toString().padStart(2, '0');
  
    if (total_day > 0) return `${total_day}:${hours}:${minutes}:${seconds}`;
    else return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="timer-bg">
      <span className="material-symbols-outlined">schedule</span>
      {/* <h2>{duration}</h2> */}
      <h2>{getFormattedTime(time)}</h2>
    </div>
  );
};

export default Timer;
