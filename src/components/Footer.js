import React, { Component } from "react";
import "../styles/homepage.scss";

class Footer extends Component {
  render() {
    return (
      <div className="content-wrapper">
        <div className="footer l-box is-center">
          <strong>Example search: </strong>
          <span className="wallet-address">
            qzs02v05l7qs5s24srqju498qu55dwuj0cx5ehjm2c
          </span>
        </div>
      </div>
    );
  }
}

export default Footer;
