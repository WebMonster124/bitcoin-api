import React, { Component } from 'react';
import moment from 'moment';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { FormattedNumber } from 'react-intl';
import queryString from 'query-string';
import TransactionVinTableLarge from './TransactionVinTableLarge';
import TransactionVoutTableLarge from './TransactionVoutTableLarge';
import TransactionVinTableSmall from './TransactionVinTableSmall';
import TransactionVoutTableSmall from './TransactionVoutTableSmall';

import '../styles/homepage.scss';
import Utils from '../utils';
import Shortener from '../utils/shortener';
import axios from 'axios'
class Transaction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tx: [],
      redirect: false,
      id: null,
      vin: [],
      vout: [],
    };
  }

  componentDidMount() {
    let id = this.props.match.params.id;
    document.title = `Transaction ${id} - CASH EXPLORER`;
    this.setState({
      id: id,
    });

    if (Shortener.isShortened(id)) {
      Shortener.redirectFromShortened(this.props.history, 'transaction', id);
    } else {
      this.fetchTransactionData(id);
    }
  }

  componentWillReceiveProps(props) {
    let id = props.match.params.id;
    document.title = `Transaction ${id} - CASH EXPLORER`;
    this.setState({
      id: id,
      blockhash: '',
      blockheight: '',
      confirmations: '',
      size: '',
      time: '',
      txid: '',
      valueOut: '',
      vin: [],
      vout: [],
      path: '',
    });

    this.fetchTransactionData(id);
  }

  fetchTransactionData(id) {
    debugger
    axios.get('https://api.blockchain.info/haskoin-store/btc/transaction/'+id).then(
      response => {
        const result = response.data;
        this.setState({    
          size: result.size / 1000,
          time: result.time,
          txid: result.txid,
          vout: result.outputs,
          vin: result.inputs,
        });
        axios.get('https://chain.api.btc.com/v3/tx/'+id).then(
          result => {
            this.setState({
              blockheight : result.data.data.block_height,
              valueOut: result.data.data.outputs_value,
              confirmations: result.data.data.confirmations,
              blockhash: result.data.data.blockhash,
            })
          }
    )
      },
    
      err => {
        console.log(err);
        this.props.history.push('/', {
          error: 'Could not retrieve transaction details.',
        });
      },
    );
   
  }

  handleRedirect(path) {
    this.setState({
      redirect: true,
      path: path,
    });
  }

  render() {
    if (this.state.redirect) {
      window.location = this.state.path;
    }

    let parsed = queryString.parse(this.props.location.search);

    let formattedBlockHeight;
    if (this.state.blockheight) {
      formattedBlockHeight = <FormattedNumber value={this.state.blockheight} />;
    }

    let formattedConfirmations;
    if (this.state.confirmations) {
      formattedConfirmations = (
        <FormattedNumber value={this.state.confirmations} />
      );
    }

    let formattedValue;
    if (this.state.valueOut) {
      formattedValue = <FormattedNumber value={this.state.valueOut} />;
    }

    let formattedSize;
    if (this.state.size) {
      formattedSize = this.state.size;
    }

    let date;
    if (this.state.time) {
      date = moment.unix(this.state.time).format('MMMM Do YYYY, h:mm:ss a');
    }
    // <tbody className='navTable'>
    //   {transactions}
    // </tbody>

    let transactionVinTableLarge;
    let transactionVinTableSmall;
    if (this.state.vin.length > 0) {
      transactionVinTableLarge = (
        <TransactionVinTableLarge
          parsed={parsed}
          bitbox={this.props.bitbox}
          vin={this.state.vin}
        />
      );

      transactionVinTableSmall = (
        <TransactionVinTableSmall
          parsed={parsed}
          bitbox={this.props.bitbox}
          vin={this.state.vin}
        />
      );
    }

    let transactionVoutTableLarge;
    let transactionVoutTableSmall;
    if (this.state.vout.length > 0) {
      transactionVoutTableLarge = (
        <TransactionVoutTableLarge
          parsed={parsed}
          bitbox={this.props.bitbox}
          vout={this.state.vout}
          handleRedirect={this.handleRedirect.bind(this)}
          txid={this.state.txid}
        />
      );

      transactionVoutTableSmall = (
        <TransactionVoutTableSmall
          parsed={parsed}
          bitbox={this.props.bitbox}
          vout={this.state.vout}
          handleRedirect={this.handleRedirect.bind(this)}
          txid={this.state.txid}
        />
      );
    }

    return (
      <div className="Transaction container">
        <h2 className="l-box">
          <i className="fas fa-exchange-alt" /> Transaction {this.state.id}
        </h2>
        <div className="pure-g">
          <div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-2">
            <p>
              <i className="fas fa-cube" /> Included in block{' '}
              <Link to={Utils.blockUrl(this.state.blockhash)}>
                {formattedBlockHeight}
              </Link>
            </p>
            <p>
              <i className="far fa-check-square" /> Confirmations:{' '}
              {formattedConfirmations}
            </p>
          </div>
          <div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-2">
            <p>
              <i className="far fa-file" /> Size: {formattedSize} kb
            </p>
            <p>
              <i className="far fa-calendar-alt" /> {date}
            </p>
          </div>
        </div>
        <div className="pure-g">
          {transactionVinTableLarge}
          {transactionVoutTableLarge}
          {transactionVinTableSmall}
          {transactionVoutTableSmall}
        </div>
      </div>
    );
  }
}

export default withRouter(Transaction);
