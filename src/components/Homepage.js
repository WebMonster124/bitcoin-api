import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';

import '../styles/homepage.scss';
import Footer from './Footer';
import SearchBox from './SearchBox';

class Homepage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blocks: [],
      redirect: false,
      blockIndex: null,
      hash: null,
      searchTerm: '',
      error: props.error || null,
    };

    this.hideErrorMessage = this.hideErrorMessage.bind(this);
  }

  componentDidMount() {
    document.title =
      '\u20bf.cash - Addresses b.cash/a/...   Transactions b.cash/t/...   Blocks b.cash/b/...';

    // this.props.bitbox.Blockchain.getBlockCount()
    // .then((result) => {
    //   for(let i = result; i >= (result - 10); i--) {
    //     this.props.bitbox.Blockchain.getBlockHash(i)
    //     .then((result) => {
    //       this.props.bitbox.Block.details(result)
    //       .then((result) => {
    //         if(i === result) {
    //           this.props.bitbox.Transaction.details(block.hash)
    //           .then((result) => {
    //             console.log(result)
    //           }, (err) => { console.log(err);
    //           });
    //         }
    //
    //         let blocks = this.state.blocks;
    //         blocks.push(result);
    //         this.setState({
    //           blocks: blocks
    //         });
    //       }, (err) => { console.log(err);
    //       });
    //     }, (err) => { console.log(err);
    //     });
    //   }
    // }, (err) => { console.log(err);
    // });
  }

  hideErrorMessage() {
    this.setState({ error: null });
  }

  render() {
    const { searchTerm, error } = this.state;

    // <div className="content features">
    //   <div className="pure-g">
    //     <div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-2">
    //       <p className="header-icon"><i className="fa fa-cubes" /></p>
    //       <h2 className="content-head">
    //         Latest Blocks
    //       </h2>
    //       <ul>
    //         {blocks}
    //       </ul>
    //     </div>
    //     <div className="l-box pure-u-1 pure-u-md-1-2 pure-u-lg-1-2">
    //       <p className="header-icon"><i className="fa fa-exchange-alt" /></p>
    //       <h2 className="content-head">
    //         Latest Transactions
    //       </h2>
    //     </div>
    //   </div>
    // </div>

    let blocks = [];
    if (this.state.blocks) {
      this.state.blocks.forEach((block, index) => {
        blocks.push(
          <li key={index}>
            <NavLink
              activeClassName="pure-menu-selected"
              className="pure-menu-link"
              to={Utils.blockUrl(block.hash)}
            >
              <i className="fas fa-cube" /> Block: {block.height}
            </NavLink>
          </li>,
        );
      });
    }
    return (
      <div className="Homepage">
        <div className="splash-container">
          <div className="splash">
            <h1 className="splash-head">
              <b>CASH EXPLORER</b>
            </h1>
            <p className="splash-subhead" />
            <SearchBox
              bitbox={this.props.bitbox}
              onError={err => this.setState({ error: err })}
            />
            {error !== null && (
              <div className="error-message">
                <p className="error-text">
                  {error}
                  <br />
                  Please try another search...
                </p>
                <span className="error-close" onClick={this.hideErrorMessage} />
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default withRouter(Homepage);
