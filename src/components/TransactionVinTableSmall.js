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

class TransactionVinTableSmall extends Component {

  render() {
    let vinBody = [];let p

      this.props.vin.forEach((v, ind) => {
          if (v.addresses)
          {
            const cashAddress = this.props.bitbox.Address.toCashAddress(v.addresses[0], false);

            vinBody.push(
            <tr key={ind} className={this.props.parsed.input && this.props.parsed.input == ind ? "active" : ""}>
              <td>
                <Link
                  to={Utils.transactionUrl(v.addresses[0])}>
                  <i className="fas fa-chevron-left" />
                </Link>
              </td>
              <td>
               <FormattedNumber maximumFractionDigits={8} value={this.props.bitbox.BitcoinCash.toBitcoinCash(v.prev_value)}/>
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
      <div className="l-box pure-u-1 small">
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

export default withRouter(TransactionVinTableSmall);
