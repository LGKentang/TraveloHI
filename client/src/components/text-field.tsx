import '../styles/main/main.scss'

interface ITextField {
  label: string;
  name: string;
  type?: string;
  onchange? : (event: React.ChangeEvent<HTMLInputElement>) => void;
  value? : any;
}

export default function TextField({ label, name , type, onchange, value }: ITextField) {

  return (
    <div>
      <label>{label}</label>
      <input type={type ? type : "text"} name = {name} onChange={onchange} value={value}/>
    </div>
  );
}
