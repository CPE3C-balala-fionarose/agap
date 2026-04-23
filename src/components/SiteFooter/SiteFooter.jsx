import logoImage from "../../assets/logo.png";
import "./SiteFooter.css";

export default function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="site-footer__container">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <div className="site-footer__brand-icon">
              <img src={logoImage} alt="AGAP logo" className="site-footer__logo" />
            </div>
            <div className="site-footer__brand-text">
              <div>AGAP</div>
              <div>AUTOMATED GEOSPATIAL</div>
              <div>ALERT PLATFORM</div>
            </div>
          </div>
          <div className="site-footer__contact">
            <h3>Contact Us</h3>
            <div>
              <p>Email: agap.system@gmail.com</p>
              <p>Phone: +63 912 345 6789</p>
              <p>Location: Malolos, Bulacan, Philippines</p>
            </div>
          </div>
        </div>
        <div className="site-footer__copyright">Copyright © 2026 AGAP All Rights Reserved</div>
      </div>
    </footer>
  );
}
