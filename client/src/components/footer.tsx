// Footer.jsx
import useUser from '../context/user-provider';
import '../styles/components/footer.scss';

export default function Footer() {
  const {user} = useUser();

  return (
    <div className="footer">
      <div className='upper-footer'>
        <div className='upper-footer-container'>

          <div className='upper-footer-div'>
            <a href="/home">Homepage</a>
            <a href="/profile">My Profile</a>
            <a href="/game">Game</a>
            <a href="/forgot-password">Forgot Password</a>


          </div>

          
          <div className='upper-footer-div'>
            <a href="https://www.instagram.com/">Instagram</a>
            <a href="https://www.facebook.com/">Facebook</a>
            <a href="https://www.twitter.com/">Twitter</a>
            <a href="https://www.youtube.com/">Youtube</a>
            <a href="https://www.pinterest.com/">Pinterest</a>
          </div>

          
          <div className='upper-footer-div'>

          </div>

        </div>
      </div>

      <hr />

      <div className='bottom-footer'>
        Copyright © 2024 TraveloHI. All Rights Reserved
      </div>
    </div>
  );
}
