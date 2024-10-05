import "../styles/main/main.scss";

export enum ButtonType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  TERNARY = "ternary",
  FOURTH = "fourth",
  FIFTH = "fifth",
  SIXTH = "sixth",
  SEVENTH = "seventh",
}

export interface IButton {
  text?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: ButtonType;
  children?: JSX.Element
  key? : any
  css? : string
}

export default function Button({ text, onClick, type, children ,key,css}: IButton) {
  return (
    <button key={key} onClick={onClick} className={`btn ${type} ${css}`}>
      <i >{text ? text : children}</i>
    </button>
  );
}

// className={`button ${type}`}
