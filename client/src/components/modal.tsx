import { useState } from "react";
import "../styles/components/Modal/Modal.scss";
import Button, { ButtonType } from "./button";

export interface IModal {
    children: JSX.Element;
    div: JSX.Element;
    onclick?: () => void;
    cannotClose?: boolean;
}

export default function Modal({ children, div, onclick, cannotClose }: IModal) {
    const [modalOpened, setModalOpened] = useState(false);

    const toggleModal = () => {
        if (!modalOpened && onclick) {
            onclick();
            setModalOpened(true);
        }
    };

    return (
        <>
            <div onClick={toggleModal}>
                {div}
            </div>
            {modalOpened && (
                <>
                    <div onClick={toggleModal} className="overlay"></div>
                    <div className="modal-content">
                        {children}
                    </div>
                </>
            )}
        </>
    );
}
