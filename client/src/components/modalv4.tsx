import { useEffect } from "react";
import "../styles/components/Modal/Modal.scss";
import Button, { ButtonType } from "./button";

export interface IModalv4 {
    children: JSX.Element;
    div: JSX.Element;
    onClose?: () => void; // New prop for onClose callback
    isOpen: boolean; // Prop to control modal visibility
    toggleModal : () => void; // New prop for toggle modal visibility
}

export default function Modalv4({ children, div, onClose, isOpen, toggleModal }: IModalv4) {
    useEffect(() => {
        // If isOpen becomes false, call the onClose callback
        if (!isOpen && onClose) {
            onClose();
        }
    }, [isOpen, onClose]);



    return (
        <>
        <div onClick={toggleModal}>
        {div}
        </div>
            {isOpen && (
                <>
                    <div  onClick={toggleModal}  className="overlay"></div>
                    <div className="modal-content-3">
                        {children}
                    </div>
                </>
            )}
        </>
    );
}
