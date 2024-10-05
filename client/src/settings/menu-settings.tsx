import AdminPage from "../pages/admin/AdminPage";
import CartPage from "../pages/cart/cart-page";
import DefaultPage from "../pages/default/default-page";
import AirlineSearchPage from "../pages/flight/airline-search-page";
import FlightReservationPage from "../pages/flight/flight-reservation-page";
import GamePage from "../pages/game/game-page";
import HomePage from "../pages/home/home-page";
import HotelBuyPage from "../pages/hotel/hotel-booking-page";
import HotelPage from "../pages/hotel/hotel-page";
import HotelSearchPage from "../pages/hotel/hotel-search-page";
import LoginPage from "../pages/login/login-page";
import OtpInput from "../pages/login/otp/otp-input";
import OtpLogin from "../pages/login/otp/otp-login";
import ForgotPassword from "../pages/profile/forgot-password";
import ProfilePage from "../pages/profile/profile-page";
import RegisterPage from "../pages/register/register-page";

export interface IMenu{
    name : string;
    path : string;
    element : JSX.Element;
}

export const MENU_LIST : IMenu[] = [
    {
        element : <HomePage></HomePage>,
        name : "Home",
        path : "/home"
    }
    ,
    {
        element : <LoginPage></LoginPage>,
        name : "Login",
        path : "/login"  
    }
    ,
    {
        element : <DefaultPage></DefaultPage>,
        name : "Default",
        path : "/" 
    }
    ,
    {
        element : <RegisterPage></RegisterPage>,
        name : "Register",
        path : "/register"
    }
    ,
    {
        element : <AdminPage></AdminPage>,
        name : "Admin",
        path : "/admin"
    }
    ,
    {
        element : <GamePage></GamePage>,
        name : "Game",
        path : "/game"
    }
    ,
    {
        element : <OtpLogin></OtpLogin>,
        name : "Otp Login",
        path : "/login/otp"
    }
    ,
    {
        element : <OtpInput></OtpInput>,
        name : "Otp Login",
        path : "/login/otp/verify"
    }
    ,
    {
        element : <HotelSearchPage></HotelSearchPage>,
        name : "hotel Search Page",
        path : "/home/search_hotels"
    }
    ,
    {
        element : <AirlineSearchPage></AirlineSearchPage>,
        name : "airline Search Page",
        path : "/home/airline"
    }
    ,
    {
        element : <FlightReservationPage></FlightReservationPage>,
        name : "Flight Reservation Page",
        path : "/home/flight/reservation"
    }
    ,
    {
        element : <HotelPage></HotelPage>,
        name : "Hotel Page",
        path : "/home/hotel"
    },
    {
        element : <ProfilePage></ProfilePage>,
        name : "Profile Page",
        path : "/profile"
    }
    ,
    {
        element : <ForgotPassword></ForgotPassword>,
        name : "Forgot Password",
        path : "/forgot-password"
    }
    ,   
     {
        element : <HotelBuyPage></HotelBuyPage>,
        name : "Hotel Booking",
        path : "/home/hotel/booking/:hotelId/:roomId"
    },
    {
        element : <CartPage></CartPage>,
        name : "Cart Page",
        path : "/cart"
    }
]

export const SHOW_MENU_BUTTON_GUEST = [
    'Login',
    'Register'
]

export const SHOW_MENU_BUTTON_USER = [
    // 'Game',
]

export const SHOW_MENU_BUTTON_ADMIN = [
    'Admin',
]
