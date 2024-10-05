import { createContext, useContext, useEffect, useState } from "react";
import { IChildren } from "../interface/children-interface";
// import { Buffer } from 'buffer';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

// global.Buffer = Buffer;


interface ITokenResponse {
  success: boolean;
  token: string;
}

interface IErrorResponse {
  error: string;
}

interface IUserContext {
  user: IUser | null;
  login: (name: string, password: string) => Promise<ITokenResponse | IErrorResponse>;
  logout : () => void;
  bypassLogin : (email : string) => void;
  getUser: (email: string) => Promise<any>;
}

const context = createContext<IUserContext>({} as IUserContext);


export function UserProvider({ children }: IChildren) {
  const [user, setUser] = useState<IUser | null>(null);
  const navigate = useNavigate()

  const getUserRole =  async (email : string) => {
    // if (user) {
      const response = await fetch(
        `http://localhost:3000/api/user/email/${email}`,
        { method: "GET" }
      );
      const data = await response.json();

      if (response.ok) return data.Role
  }

  const getUser =  async (email : string) => {
    // if (user) {
      const response = await fetch(
        `http://localhost:3000/api/user/email/${email}`,
        { method: "GET" }
      );
      const data = await response.json();

      if (response.ok) return data
  }


  useEffect(() => {
    (async()=>{
      const storedToken = Cookies.get("Authorization")
      
      if (storedToken) {
        const decodedToken = jwtDecode(storedToken);
        const userId = decodedToken.sub ? parseInt(decodedToken.sub, 10) : undefined;
        let userRole;
        if (decodedToken.email) {
           userRole = await getUserRole(decodedToken.email);
        }
        setUser({ Email: decodedToken.email, Id: userId, Role: userRole});
      }
      
      else{
        setUser(null)
      }

    })()
  }, []);

  async function login(email: string, password: string): Promise<ITokenResponse | IErrorResponse> {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data: ITokenResponse | IErrorResponse = await response.json();

      if (response.ok) {
        const storedToken = Cookies.get("Authorization")
    
        if (storedToken) {
          const decodedToken = jwtDecode(storedToken);
          const userId = decodedToken.sub ? parseInt(decodedToken.sub, 10) : undefined;
          let userRole;
          if (decodedToken.email) {
             userRole = await getUserRole(decodedToken.email);
          }
          setUser({ Email: decodedToken.email, Id: userId, Role: userRole});
        }
        
        if ('token' in data) {
          localStorage.setItem("token", data.token);
        }
      }

      return data;
    } catch (error) {
      console.error("Login failed =", error);
      throw error;
    }
  }

  function bypassLogin(email: string){
    setUser({ Email: email });
  }

  async function logout() {
    await fetch("http://localhost:3000/logout", {
      method: "GET",
      credentials: "include",
    });
    
    setUser(null);
    navigate("/login")
  }

  const data = { user, login, logout , bypassLogin, getUser};

  return <context.Provider value={data}>{children}</context.Provider>;
}

export default function useUser() {
  return useContext(context);
}
