import { useState } from "react";
import "../styles/components/Modal/Modal.scss";
import Button, { ButtonType } from "./button";

export interface IModalv3 {
  children: JSX.Element;
  div: JSX.Element;
  onclick?: () => void;
}

export default function Modalv3({ children, div, onclick }: IModalv3) {
  const [modalOpened, setModalOpened] = useState(false);

  const toggleModal = () => {
    setModalOpened(!modalOpened);
  };

  return (
    <>
      <div onClick={toggleModal}>{div}</div>
      {modalOpened && (
        <>
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content-3">{children}</div>
        </>
      )}
    </>
  );
}
