// react imports
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
  NavLink,
} from 'react-router-dom';
import Axios from 'axios';

let BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;
let BITBOX = new BITBOXCli({
  protocol: 'https',
  host: '138.68.54.100',
  port: '8332',
  username: 'bitcoin',
  password: 'xhFjluMJMyOXcYvF',
  corsproxy: 'remote',
});

BITBOX.fallbackURL = 'https://rest.bitcoin.com/v2/';

BITBOX.Blockchain.getBlockHash = async function(height) {
  const {
    data: { hash },
  } = await Axios.get(`${BITBOX.fallbackURL}block/detailsByHeight/${height}`);
  return hash;
};

BITBOX.Blockchain.getBlockCount = async function() {
  const { data: count } = await Axios.get(
    `${BITBOX.fallbackURL}blockchain/getBlockCount`,
  );
  return count;
};

// custom components
import Menu from './components/Menu';
import Homepage from './components/Homepage';
import Block from './components/Block';
import Address from './components/Address';
import Transaction from './components/Transaction';

// css
import './styles/app.scss';

class App extends Component {
  handlePathMatch(path) {
    const validPaths = [
      '/',
      '/blocks',
      '/transactions',
      '/logs',
      '/configuration/accounts-and-keys',
    ];

    if (validPaths.includes(path)) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    const pathMatch = (match, location) => {
      if (!match) {
        return false;
      }
      return this.handlePathMatch(match.path);
    };

    const BlockPage = props => {
      return <Block bitbox={BITBOX} />;
    };

    const AddressPage = props => {
      return <Address bitbox={BITBOX} />;
    };

    const TransactionPage = props => {
      return <Transaction bitbox={BITBOX} />;
    };

    const HomePage = props => {
      const error = props.location.state && props.location.state.error;
      return <Homepage bitbox={BITBOX} error={error} />;
    };

    const MenuPage = props => {
      return <Menu bitbox={BITBOX} match={props.match} />;
    };

    return (
      <Router>
        <div>
          <MenuPage />
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/b/:id" component={BlockPage} />
            <Route path="/a/:id" component={AddressPage} />
            <Route path="/t/:id" component={TransactionPage} />
            <Redirect from="/block/:id" to="/b/:id" />
            <Redirect from="/address/:id" to="/a/:id" />
            <Redirect from="/transaction/:id" to="/t/:id" />
            <Redirect from="*" to="/" />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
