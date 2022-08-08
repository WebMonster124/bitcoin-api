import React, { Component } from 'react';
import moment from 'moment';
import { Link, Redirect, withRouter } from 'react-router-dom';

import ReactPaginate from 'react-paginate';
import SmallTransactionTable from './SmallTransactionTable';
import { FormattedNumber } from 'react-intl';

import '../styles/homepage.scss';
import Utils from '../utils';
import Shortener from '../utils/shortener';
import Axios from 'axios';

class Block extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tx: [],
      id: null,
      poolInfo: {},
      perPage: 5,
      redirect: false,
      txid: null,
      txs: [],
    };
  }

  componentDidMount() {
    let id = this.props.match.params.id;
    
    if (Shortener.isShortened(id)) {
      debugger
      Shortener.redirectFromShortened(this.props.history, 'block', id);
    } else {
      this.determineEndpoint(id);
    }
  }

  componentWillReceiveProps(props) {
    let id = props.match.params.id;

    this.determineEndpoint(id);
  }

  handleRedirect(txid) {
    this.setState({
      redirect: true,
      txid: txid,
    });
  }

  determineEndpoint(id) {
    document.title = `Block ${id} - CASH EXPLORER™`;
    this.setState({
      id,
      offset: 0,
    });

    if (id.length !== 64) {
      Axios.get('https://chain.api.btc.com/v3/block/'+id).then(
        result => {
          this.fetchBlockData(result.data.data.hash);
          this.setState({
            confirmations: result.data.data.confirmations,
            difficulty: result.data.data.difficulty,
            hash: result.data.data.hash,
            height: result.data.data.height,
            nextblockhash: result.data.data.next_block_hash,
            poolInfo: result.data.data.extras,
            previousblockhash: result.data.data.prev_block_hash,
            reward: result.data.data.reward_fees,
            size: result.data.data.size / 1000,
            time: result.data.data.timestamp,
          });
        },
        err => {
          console.log(err);
          this.props.history.push('/', {
            error: 'Could not retrieve block details.',
          });
        },
      );
    } else {
      this.fetchBlockData(id);
    }
  }

  fetchBlockData(id) {
    Axios.get('https://chain.api.btc.com/v3/block/'+id+'/tx?pagesize='+this.state.perPage).then(
      result => {
        this.fetchTransactionData(result.data.data.list);
        this.setState({
          transactions: result.data.data.list,
          pageCount: result.data.data.page_total,
        })
        if (this.props.match.params.id.length === 64)
          location.pathname = Utils.blockUrl(result.height);

        
      },
      err => {
        console.log(err);
        this.props.history.push('/', {
          error: 'Could not retrieve block details.',
        });
      },
    );
  }

  fetchTransactionData(transactions) {
    let txs = [];
    let upperBound = this.state.perPage;
    if (transactions.length < upperBound) {
      upperBound = transactions.length;
    }

    for (let i = this.state.offset; i < this.state.offset + upperBound; i++) {
      txs.push(transactions[i]);
    }
    this.setState({
            txs: transactions,
    });
    // this.props.bitbox.Transaction.details(JSON.stringify(txs)).then(
    //   result => {
    //     this.setState({
    //       txs: result,
    //     });
    //   },
    //   err => {
    //     console.log(err);
    //     this.props.history.push('/', {
    //       error: 'Could not retrieve transaction details.',
    //     });
    //   },
    // );
  }

  handlePageClick(data) {
    this.setState({
      txs: [],
    });
    let selected = data.selected;
    let transactions = this.state.transactions;
    let txs = [];
    for (let i = selected; i < selected + this.state.perPage; i++) {
      txs.push(this.state.transactions[i]);
    }
    this.props.bitbox.Transaction.details(JSON.stringify(txs)).then(
      result => {
        this.setState({
          txs: result,
        });
      },
      err => {
        console.log(err);
        this.props.history.push('/', {
          error: 'Could not retrieve transaction details.',
        });
      },
    );
  }

  render() {
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
    if (this.state.transactions) {
      transactionCount = (
        <FormattedNumber value={this.state.transactions.length} />
      );

      this.state.transactions.forEach((tx, ind) => {
        transactions.push(
          <tr key={ind} onClick={this.handleRedirect.bind(this, tx.hash)}>
            <td>{tx.hash}</td>
            <td>
              <FormattedNumber value={tx.inputs_count} />
            </td>
            <td>
              <FormattedNumber value={tx.outputs_count} />
            </td>
            <td>
              <FormattedNumber maximumFractionDigits={8} value={tx.is_coinbase ? tx.outputs_value : tx.intputs_value} />
            </td>
          </tr>,
        );
      });
    }

    let tableSmall;
    if (this.state.txs && this.state.txs.length > 0) {
      tableSmall = (
        <SmallTransactionTable
          transactions={this.state.txs}
          handleRedirect={this.handleRedirect.bind(this)}
        />
      );
    }

    let tableLarge;
    if (this.state.txs && this.state.txs.length > 0) {
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

    let formattedBlockHeight;
    if (this.state.height) {
      formattedBlockHeight = <FormattedNumber value={this.state.height} />;
    }

    let formattedConfirmations;
    if (this.state.confirmations) {
      formattedConfirmations = (
        <FormattedNumber value={this.state.confirmations} />
      );
    }

    let formattedDifficulty;
    if (this.state.difficulty) {
      formattedDifficulty = <FormattedNumber value={this.state.difficulty} />;
    }
    return (
      <div className="Block container">
        <h2 className="l-box">
          <i className="fas fa-cube" /> Block {formattedBlockHeight}
        </h2>
        <div className="pure-g">
          <div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-2">
            <p>
              <i className="fas fa-code" /> Hash: {this.state.hash}
            </p>
            <p>
              <i className="far fa-calendar-alt" /> Time:{' '}
              {moment.unix(this.state.time).format('MMMM Do YYYY, h:mm:ss a')}
            </p>
            <p>
              <i className="far fa-check-square" /> Confirmations:{' '}
              {formattedConfirmations}
            </p>
            <p>
              <i className="fas fa-link" /> Difficulty: {formattedDifficulty}
            </p>
          </div>
          <div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-2">
            <p>
              <i className="far fa-file" /> Size: {this.state.size} kb
            </p>
            <p>
              <img
                style={{ width: 16 }}
                alt="Cash Explorer Logo"
                title=""
                src=" data:image/png;base64,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"
              />{' '}
              Reward: {this.state.reward}
            </p>
            <p>
              <i className="fas fa-arrow-right" /> Next:{' '}
              <Link to={Utils.blockUrl(this.state.nextblockhash)}>
                {this.state.nextblockhash}
              </Link>
            </p>
            <p>
              <i className="fas fa-arrow-left" /> Previous:{' '}
              <Link to={Utils.blockUrl(this.state.previousblockhash)}>
                {this.state.previousblockhash}
              </Link>
            </p>
            <p>
              <i className="fas fa-wrench" /> Miner:{' '}
              <a href={this.state.poolInfo.pool_link}>
                {this.state.poolInfo.pool_name}
              </a>
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
      </div>
    );
  }
}

export default withRouter(Block);
