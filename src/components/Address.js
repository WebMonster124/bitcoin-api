import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import ReactTooltip from 'react-tooltip';
import { FormattedNumber } from 'react-intl';
import QRCode from 'qrcode.react';
import copy from 'copy-to-clipboard';

import SmallTransactionTable from './SmallTransactionTable';

import '../styles/homepage.scss';
import Utils from '../utils';
import Shortener from '../utils/shortener';
import axios from 'axios';

const baseAddressUrl =  "https://chain.api.btc.com/v3/address/";
function getAddressesForState(bitbox, id) {
  if (Shortener.isShortened(id)) {
    return {
      isValidAddress: true,
      legacyAddress: 'x',
      cashAddress: 'bitcoincash:x',
      standardAddress: 'x',
    };
  }

  let isValidAddress = true;
  let legacyAddress, cashAddress, standardAddress;
  try {
    legacyAddress = bitbox.Address.toLegacyAddress(id);
    cashAddress = bitbox.Address.toCashAddress(id);
    standardAddress = bitbox.Address.toCashAddress(id, false);
  } catch (e) {
    console.log('getAddressState', e);
    isValidAddress = false;
  }

  return { isValidAddress, legacyAddress, cashAddress, standardAddress };
}

class Address extends Component {
  constructor(props) {
    super(props);
    let id = this.props.match.params.id;
    document.title = `Address ${id} - CASH EXPLORER`;

    this.state = Object.assign(
      {
        id,
        perPage: 10,
        offset: 0,
        allTransactions: [],
        redirect: false,
        txid: null,
        subsetTransactions: [],
      },
      getAddressesForState(this.props.bitbox, id),
    );

    this.setAddressRef = el => (this.addressRef = el);
    this.handleCopyAddress = this.handleCopyAddress.bind(this);
  }

  componentDidMount() {
    let id = this.state.id;
    
    if (Shortener.isShortened(id)) {
      Shortener.redirectFromShortened(this.props.history, 'address', id);
    } else {
      this.fetchDetails(id);
    }
  }

  componentWillReceiveProps(props) {
    let id = props.match.params.id;
    document.title = `Address ${id} - CASH EXPLORER`;

    this.refreshState(id);
    this.fetchDetails(id);
  }

  refreshState(id) {
    this.setState(
      Object.assign(
        {
          id,
          balance: '',
          totalSent: '',
          transactions: [],
          subsetTransactions: [],
          pageCount: 0,
        },
        getAddressesForState(this.props.bitbox, id),
      ),
    );
  }

  handleRedirect(txid) {
    this.setState({
      redirect: true,
      txid: txid,
    });
  }

  fetchDetails(id) {
    // this.props.bitbox.Address.details(id).then(
    //   result => {
    //     this.fetchTransactionData(result.transactions);

    //     this.setState({
    //       balance: result.balance || '0',
    //       totalReceived: result.totalReceived,
    //       totalSent: result.total,
    //       transactions: result.transactions,
    //       allTransactions: result.transactions,
    //       pageCount: Math.floor(
    //         result.transactions.length / this.state.perPage,
    //       ),
    //     });
    //   },
    //   err => {
    //     console.log(err);
    //     this.props.history.push('/', {
    //       error: 'Could not retrieve address details.',
    //     });
    //   },
    // );
    this.setState({
      address:id
    })
    axios.get(`${baseAddressUrl}`+id).then((response)=>{
      this.setState({
        balance:response.data.data.balance,
        totalReceived:response.data.data.received,
        totalSent:response.data.data.sent,
      })
      
    axios.get(`${baseAddressUrl}`+id+"/tx?pagesize="+this.state.perPage).then((response)=>{
      
      this.fetchTransactionData(response.data.data.total_count,id)
        this.setState({
          allTransactionslength:response.data.data.total_count,
          pageCount:response.data.data.page_total
        })
      })
    })
  }

  fetchTransactionData(allTransactionsLength,id) {
    let txs = [];
    let upperBound = this.state.perPage;
    if (allTransactionsLength < upperBound) {
      upperBound = allTransactionsLength;
    }
    const pagesize = this.state.perPage;
    const page = this.state.offset;
   
    if (allTransactionsLength > 0) {
      axios.get(`${baseAddressUrl}`+id+"/tx?page="+page+"&pagesize="+pagesize).then((response)=>{
        
        this.setState({
          subsetTransactions:response.data.data.list
        })
      })
    }
    // if (allTransactionsLength > 0) {
    //   for (let i = this.state.offset; i < this.state.offset + upperBound; i++) {
    //     txs.push(transactions[i]);
    //   }
    // }

    // this.props.bitbox.Transaction.details(JSON.stringify(txs)).then(
    //   result => {
    //     this.setState({
    //       subsetTransactions: result,
    //     });
    //   },
    //   err => {
    //     console.log(err);
    //     this.props.history.push('/', {
    //       error: 'Could not retrieve address details.',
    //     });
    //   },
    // );
   
    
  }

  handlePageClick(data) {
    this.setState({
      subsetTransactions: [],
    });
    const id = this.state.address;
    let selected = data.selected;
    const pagesize = this.state.perPage;
    
    if (this.state.allTransactionslength > 0) {
      axios.get(`${baseAddressUrl}`+id+"/tx?page="+selected+"&pagesize="+pagesize).then((response)=>{
        
        this.setState({
          subsetTransactions:response.data.data.list
        })
      })
    }
    // let txs = [];
    // if (this.state.allTransactions.length > 0) {
    //   for (let i = selected; i < selected + this.state.perPage; i++) {
    //     txs.push(this.state.allTransactions[i]);
    //   }
    // }
    // this.props.bitbox.Transaction.details(JSON.stringify(txs)).then(
    //   result => {
    //     this.setState({
    //       subsetTransactions: result,
    //     });
    //   },
    //   err => {
    //     console.log(err);
    //     this.props.history.push('/', {
    //       error: 'Could not retrieve address details.',
    //     });
    //   },
    // );
  }

  handleCopyAddress() {
    const result = copy(this.state.standardAddress);
    if (result) {
      ReactTooltip.show(this.addressRef);
      setTimeout(_ => {
        ReactTooltip.hide(this.addressRef);
      }, 2000);
    }
  }

  render() {
    if (!this.state.isValidAddress) {
      return (
        <Redirect
          to={{
            pathname: '/',
            state: { error: 'Invalid address.' },
          }}
        />
      );
    }

    if (this.state.redirect) {
      return (
        <Redirect
          to={{
            pathname: Utils.transactionUrl(this.state.txid),
          }}
        />
      );
    }

    let transactions = [];
    let transactionCount;
    if (this.state.cashAddress) {
      transactionCount = (
        <FormattedNumber value={this.state.allTransactionslength} />
      );

      this.state.subsetTransactions.forEach((tx, ind) => {
        // if(tx.vin[0].cashAddress === this.state.cashAddress) {
        //   val = <td className='plus'><FormattedNumber value={tx.valueOut}/></td>;
        // } else {
        //   val = <td className='minus'><FormattedNumber value={tx.valueOut}/></td>;
        // }
        transactions.push(
          <tr
            key={ind}
            className=""
            onClick={this.handleRedirect.bind(this, tx.hash)}
          >
            <td>{tx.hash}</td>
            <td>
              <FormattedNumber value={tx.inputs.length} />
            </td>
            <td>
              <FormattedNumber value={tx.outputs.length} />
            </td>
            <td>
              <FormattedNumber
                maximumFractionDigits={8}
                value={tx.is_coinbase === true ? tx.outputs_value : tx.inputs_value}
              />
            </td>
          </tr>,
        );
      });
    }

    let tableSmall;
    if (this.state.subsetTransactions.length > 0) {
      tableSmall = (
        <SmallTransactionTable
          transactions={this.state.subsetTransactions}
          handleRedirect={this.handleRedirect.bind(this)}
        />
      );
    }

    let tableLarge;
    if (this.state.allTransactions.length > 0) {
      tableLarge = (
        <table className="pure-table large">
          <thead>
            <tr>
              <th>Transaction Identifier</th>
              <th># Inputs</th>
              <th># Outputs</th>
              <th>Cash Value</th>
            </tr>
          </thead>

          <tbody className="navTable">{transactions}</tbody>
        </table>
      );
    }

    let formattedBalance;
    if (this.state.balance) {
      formattedBalance = (
        <FormattedNumber maximumFractionDigits={8} value={this.state.balance} />
      );
    }

    let formattedReceived;
    if (this.state.totalReceived) {
      formattedReceived = (
        <FormattedNumber
          maximumFractionDigits={8}
          value={this.state.totalReceived}
        />
      );
    }

    return (
      <div className="Address container">
        <div className="pure-g">
          <div className="l-box pure-u-1 pure-u-md-1-6 pure-u-lg-1-6">
            <QRCode value={this.state.id} />
          </div>
          <div className="pure-u-1 pure-u-md-7-12 pure-u-lg-7-12">
            <h3>Cash Address</h3>
            <p>
              <strong>Standard:</strong>&nbsp;
              <span
                className="standard-address"
                onClick={this.handleCopyAddress}
              >
                {this.state.standardAddress}&nbsp;
                <i className="far fa-copy" />
              </span>
              <span
                ref={this.setAddressRef}
                data-tip="Copied!"
                data-place="right"
                data-class="tooltip-copy-clipboard"
              />
            </p>
            <p>Technical: {this.state.cashAddress}</p>
            <p>
              <i>Retired: {this.state.legacyAddress}</i>
            </p>
          </div>
          <div className="pure-u-1 pure-u-md-1-4 pure-u-lg-1-4">
            <p>
              <strong>Cash Balance:</strong> {formattedBalance}
            </p>
            <p>
              <strong>Total Cash Received:</strong> {formattedReceived}
            </p>
          </div>
        </div>
        <h2 className="l-box">
          <i className="fas fa-exchange-alt" /> Transactions {transactionCount}
        </h2>
        {tableSmall}
        {tableLarge}

        <ReactPaginate
          previousLabel={'Previous'}
          nextLabel={'Next'}
          breakLabel={<a href="">...</a>}
          breakClassName={'break-me'}
          pageCount={this.state.pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={this.handlePageClick.bind(this)}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          activeClassName={'active'}
        />
        <ReactTooltip />
      </div>
    );
  }
}

export default withRouter(Address);
