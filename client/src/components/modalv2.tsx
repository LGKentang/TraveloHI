import { useState } from "react";
import "../styles/components/Modal/Modal.scss";
import Button, { ButtonType } from "./button";

export interface IModalv2 {
  children: JSX.Element;
  div: JSX.Element;
  modal: boolean;
  toggleModal: () => void;
}

export default function Modalv2({
  children,
  div,
  modal,
  toggleModal,
}: IModalv2) {
  return (
    <>
      <div onClick={toggleModal}>{div}</div>
      {modal && (
        <>
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">{children}</div>
        </>
      )}
    </>
  );
}

{
  /* <Button onClick={toggleModal} text={text} type={type}/> */
}
// className={`modal ${modal ? 'active' :  ''}`}
