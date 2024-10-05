import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainTemplate from "./template/main-template";
import { IMenu, MENU_LIST } from "./settings/menu-settings";
import { UserProvider } from "./context/user-provider";
import { CurrencyProvider } from "./context/currency-provider";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <CurrencyProvider>
          <MainTemplate>
            <Routes>
              {MENU_LIST.map((menu: IMenu, index: number) => (
                <Route
                  key={index}
                  path={menu.path}
                  element={menu.element}
                ></Route>
              ))}
            </Routes>
          </MainTemplate>
        </CurrencyProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
