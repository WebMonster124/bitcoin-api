import React, { Component } from 'react';
import moment from 'moment';
import {
  Link,
  Redirect,
  withRouter
} from 'react-router-dom';

import Slider from 'react-slick';
import ReactPaginate from 'react-paginate';
import {FormattedNumber} from 'react-intl';

import "../styles/homepage.scss";

class SmallTransactionTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      transactionProps:props.transactions
    }
  }
  handleRedirect(txid) {
    this.props.handleRedirect(txid);
  }
  componentDidUpdate(previousProps, previousState) {
    
    if (previousProps.data !== this.props.data) { 
        this.setState({transactionProps:this.props.transactions})
    }
}
  render() {
    let transactions = [];
    const transactionProps = this.state.transactionProps;
    if (transactionProps.length > 0)
      transactionProps.forEach((transaction, index) => {

        transactions.push(<div onClick={this.handleRedirect.bind(this, transaction.hash)} key={index}>
          <div className="l-box pure-u-1-8">
            <p>TXID</p>
            <p><i className="fas fa-arrow-down" /></p>
            <p><i className="fas fa-arrow-up" /></p>
          </div>
          <div className="l-box pure-u-7-8 vout">
            <p>{transaction.hash}</p>
            <p><FormattedNumber value={transaction.inputs.length} /></p>
            <p><FormattedNumber value={transaction.outputs?transaction.outputs.length:transaction.out.length} /></p>
            <p><FormattedNumber maximumFractionDigits={8} value={transaction.is_coinbase === true ? transaction.outputs_value : transaction.inputs_value} /></p>
          </div>
        </div>);
      })
    return (
      <div className='pure-g SmallTransactionTable'>
        {transactions}
      </div>
    );
  }
}

export default withRouter(SmallTransactionTable);
