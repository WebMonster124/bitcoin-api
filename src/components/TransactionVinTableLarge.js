import React, { Component } from 'react';
import moment from 'moment';
import {
  Link,
  Redirect,
  withRouter
} from 'react-router-dom';

import {FormattedNumber} from 'react-intl';

import "../styles/homepage.scss";
import Utils from '../utils';

class TransactionVinTableLarge extends Component {
  render() {
    let vinBody = [];
    
      this.props.vin.forEach((v, ind) => {
          // vinBody.push(
          //   <tr key={ind} className={this.props.parsed.input && this.props.parsed.input == ind ? "active" : ""}>
          //     <td>Coinbase</td>
          //     <td>No Inputs</td>
          //     <td></td>
          //     <td></td>
          //   </tr>
          // );
    
          if (v.prev_addresses && v.prev_addresses[0])
          {
            const cashAddress = this.props.bitbox.Address.toCashAddress(v.prev_addresses[0], false);
            
            vinBody.push(
              <tr key={ind} className={this.props.parsed.input && this.props.parsed.input == ind ? "active" : ""}>
                <td>
                  <Link
                    to={Utils.transactionUrl(v.prev_tx_hash)}>
                    <i className="fas fa-chevron-left" />
                  </Link>
                </td>
                <td>
               
                </td>
                <td>
                  <Link
                    to={Utils.addressUrl(cashAddress)}>
                    {cashAddress}
                  </Link>
                </td>
                <td>
                {v.n}
                </td>
              </tr>
            );
          }
      });
    return (
      <div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-2 large">
        <h3 className='content-subhead'><i className="fas fa-long-arrow-alt-down" /> Inputs</h3>
        <table className="pure-table">
          <thead>
            <tr>
              <th></th>
              <th>Cash Value</th>
              <th>Cash Address</th>
              <th>#</th>
            </tr>
          </thead>
          <tbody>
            {vinBody}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(TransactionVinTableLarge);
