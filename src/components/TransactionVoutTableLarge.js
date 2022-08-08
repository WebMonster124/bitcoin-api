import React, { Component } from "react";
import moment from "moment";
import { Link, Redirect, withRouter } from "react-router-dom";
import MemoLarge from "./MemoLarge";
import BlockpressLarge from "./BlockpressLarge";
import MemoSmall from "./MemoSmall";

import { FormattedNumber } from "react-intl";

import "../styles/homepage.scss";
import Utils from "../utils";

class TransactionVoutTableLarge extends Component {
  handleRedirect(path) {
    this.props.handleRedirect(path);
  }

  render() {
    let voutBody = [];
    if (this.props.vout) {
      this.props.vout.forEach((v, ind) => {
        let output;
        let largeNullData;
        if (v.address && v.address.length > 0) {
          const cashAddress = this.props.bitbox.Address.toCashAddress(
            v.address,
            false
          );

          output = (
            <Link to={Utils.addressUrl(v.address)}>{v.address}</Link>
          );
        } else {
          let op = v.asm;

          let memoPrefixes = [365, 621, 877, 1133, 1389, 1645, 1901, 3181];
          let blockpressPrefixes = [
            397,
            653,
            909,
            1165,
            1677,
            1933,
            2189,
            2445,
            4237,
            4493
          ];

          let split = op.split(" ");
          let prefix = +split[1];
          if (memoPrefixes.includes(prefix)) {
            largeNullData = (
              <MemoLarge
                handleRedirect={this.handleRedirect.bind(this)}
                active={
                  this.props.parsed.output &&
                  this.props.this.props.parsed.output == ind
                    ? "active"
                    : ""
                }
                parsed={this.props.parsed}
                key={ind + 1}
                split={split}
                prefix={prefix}
                bitbox={this.props.bitbox}
                txid={this.props.txid}
              />
            );
          }

          if (blockpressPrefixes.includes(prefix)) {
            largeNullData = (
              <BlockpressLarge
                handleRedirect={this.handleRedirect.bind(this)}
                active={
                  this.props.parsed.output &&
                  this.props.this.props.parsed.output == ind
                    ? "active"
                    : ""
                }
                parsed={this.props.parsed}
                key={ind + 2}
                split={split}
                prefix={prefix}
                bitbox={this.props.bitbox}
                txid={this.props.txid}
              />
            );
          }
        }

        let times;
        if (v.spender !== null) {
          times = <i className="fas fa-times" />;
        }
        voutBody.push(
          <tr
            key={ind}
            className={
              this.props.parsed.output && this.props.parsed.output == ind
                ? "active"
                : ""
            }
          >
            <td>{v.n}</td>
            <td className="address">{output}</td>
            <td className="address">{times}</td>
            <td>
              <FormattedNumber maximumFractionDigits={8} value={v.value} />
            </td>
          </tr>
        );
        if (largeNullData) {
          voutBody.push(largeNullData);
        }
      });
    }

    return (
      <div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-2 outputs large">
        <h3 className="content-subhead">
          <i className="fas fa-long-arrow-alt-up" /> Outputs
        </h3>
        <table className="pure-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cash Address</th>
              <th>Sent?</th>
              <th>Cash Value</th>
            </tr>
          </thead>
          <tbody>{voutBody}</tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(TransactionVoutTableLarge);
