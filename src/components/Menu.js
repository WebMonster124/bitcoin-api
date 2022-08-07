import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import copy from 'copy-to-clipboard';
import _ from 'lodash';

import '../styles/homepage.scss';
import Utils from '../utils';
import Shortener from '../utils/shortener';
import SearchBox from './SearchBox';

class Menu extends Component {
  constructor(props) {
    super(props);

    const pathname = props.location && props.location.pathname;

    this.state = {
      copied: false,
      shortenedUrl: '',
      showSearch: pathname !== '/',
      showShortened: ['/a', '/t', '/b'].some(endpoint =>
        pathname.startsWith(endpoint),
      ),
    };
    this.updateShortenedUrl = _.debounce(this.updateShortenedUrl, 1000, {
      trailing: true,
      leading: false,
    });
  }

  componentDidMount() {
    const pathname = this.props.location && this.props.location.pathname;
    this.updateShortenedUrl(this.props);

    if (pathname === '/') {
      this.setState({
        showSearch: false,
      });
    }
  }

  componentWillReceiveProps(props) {
    const pathname = props.location && props.location.pathname;

    if (pathname === '/') {
      this.setState({
        showSearch: false,
        showShortened: false,
        shortenedUrl: '',
      });
    } else {
      this.updateShortenedUrl(props);
      this.setState({
        showSearch: true,
        showShortened: ['/a', '/t', '/b'].some(endpoint =>
          pathname.startsWith(endpoint),
        ),
        shortenedUrl: '',
      });
    }
  }

  handleCopyShortened() {
    const result = copy(this.state.shortenedUrl);
    if (result) {
      ReactTooltip.show(this.shortenedRef);
      setTimeout(_ => {
        ReactTooltip.hide(this.shortenedRef);
      }, 2000);
    }
  }

  async updateShortenedUrl(props) {
   
    const path = props.location.pathname.substring(1);
    const [category, id] = path.split('/');

    const longCategory = {
      a: 'a',
      t: 't',
      b: 'b',
    }[category];

    if (longCategory && id) {
      const { code } = await Shortener.shorten(`${longCategory}:${id}`);
      this.setState({
        shortenedUrl: Shortener.makeShortenedUrl(category, code),
      });
    }
  }

  render() {
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

    let shortenedUrlComponent;
    if (this.state.showShortened) {
      shortenedUrlComponent = (
        <div className="shortened-url-wrapper">
          <span
            className="shortened-url"
            onClick={this.handleCopyShortened.bind(this)}
          >
            <span>{this.state.shortenedUrl}</span>
            <span className="icon">
              <i className="fas fa-copy fa-xs" />
            </span>
            <span
              ref={el => (this.shortenedRef = el)}
              data-tip="Copied!"
              data-place="right"
              data-class="tooltip-copy-clipboard"
            />
          </span>
        </div>
      );
    }

    return (
      <div className="header">
        <div className="home-menu main-menu pure-menu pure-menu-horizontal pure-menu-fixed">
          <div className="pure-g">
            <div className="l-box pure-u-1 pure-u-md-2-3 pure-u-lg-2-3">
              <div className="pure-menu-heading header-logo">
                <div className="menu-items-wrapper">
                  <NavLink to="/">
                    <img
                      alt="Cash Explorer Logo"
                      title=""
                      src=" data:image/png;base64,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"
                    />
                  </NavLink>
                  <NavLink to="/">CASH EXPLORER</NavLink>

                  <a
                    href="https://www.cashprice.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pure-hidden-xs pure-hidden-sm"
                  >
                    <img
                      alt="Cash Price Logo"
                      title=""
                      src=" data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALsAAACGCAYAAACFdPsZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYYAAB2GAV2iE4EAAAyASURBVHhe7d0JcFRFGgfw/2QymSSTO+QOISEhgYQjAjEBQgI5NIlR5BIVRWRLFFBxddfa9VqrpFSsPTy2LJVFii3KPdjorrAipwYIJCAIq6jIBBJICJBAGCDXTI59b+pzl6IohZCZ6ff6+1Ep+uspqsLMf3r69Xvz2rCuD31gTAJe9DdjusdhZ9LgsDNpcNiZNDjsTBocdiYNDjuTBoedSYPDzqTBYWfS4LAzaXDYmTQ47EwaHHYmDQ47kwaHnUmDw86kwWFn0uCwM2lw2Jk0OOxMGhx2Jg0OO5MGh51Jg8POpMFhZ9LgsDNpcNiZNDjsTBqGab9fwHfxZVIwRC+axGFnUuBpDJMGh51Jg8POpMFhZ9LgsDNpcNiZNDjsTBocdiYNDjuTBoedSYPDzqTBYWfS4LAzaQh51eOtY80Ym+xDFdOats5evLmujSpxCBn2e/L9UDBnC1VMa5prSvHM6gtUiUPIaYyfj4FaTIsisjfAKGCyhAx7RDAfSmhdeJB4r6Fwv5E6IoQHcti1LirYSC1xCJeqwRFGhGZtoIppVVI0h/0nDYv1phbTMhFfR+HCPibRRC2mZcOLN2KQYPN2oX6b2HAj0pQnienDuBSxBi6hwp6XwSeS9GTCcB+YBJq6CxP20AAvjE3mKYyexOV+iuw0cQYwYc6gPlDoj9yZm6nSh6aqMrR1WuBtiECAOUr5CYfFHAKTtxnd3XZ0Oi6hzd6Ki12n0eU4A5PJhoT89fSv9eFkVSmW/+Mi2rs8HzMhwj483htPPVNJlXa17i3D2QsWhPtlYlzirUiPHUePXLvTtkZUH/0Eda3VsPg2IXqi9pdhN31QhLU7O6jyHI+HPdDPgKemBzg/8rSqYcdtMOEmlI16CDEhCdR74xw9dqw/uAr1rZuRUlhBvdr05vIp+KreQZVneDTs6tnSh0ssuKl8E/Voy/HKckT4F2P62EXwNrr2eKO6djOq61YooV9LPdpyencp3vj4EpptvdTjfh4Lu8EA3DfVH3mztDdPb6kpRbc9E/fnvACzyZd63WPzob/hSMsaTc7t6ytL8Na6S7C1e2Z8NQZkJbxIbbdRR3T1Mt782dq7jNe6bToKhi1Dcca9ymju/rOEyZEjMTJ2Giq3XwDODYJv7BF6RHwhiVakmNLxzYludNjdH3i3h93fbMD8IgsmzdDeiN5Q+XMsyn8PEYEx1OMZJqMPspLKcKrViEZrOwIGW+kR8YUmWTHCLx3HTvW4fYR3a9gTo4x4uNSC9Fu0dZb03N4yGJqWYt7E5+FlEOc8nDrK+3tn4MD+RgQnfk+94gtKsGJ0QDq6uvtwvLmHel3PLWFXR/M7J/hhxkQ/RE3Q1lKaOj+PtTyA2zMfpB6xDAqMRmzIJFRXH1WmCYepV3x+cVaMyapDkjEdDS09uNjh+lHepQeoAX4GTM4wIzfdB5E52lsvPrenDDGWecr8fA71iOuU7QQqDizBkPx11KMdtn1l+LrOgS0Hu5zBd5UBD7u6bp4a543MoSYMjzchZPwn9Ii2qC+AH8oxY9wi6hHf0eZvseXwLxCbq83nXHV4863YV+vAdw0ONJ0b2GXKfofdS5m6Zqf6wNfHAIuvQfk49UJUqBdSCvRx1WLD50/ikSm/o0o7dlk3wdr6BsKytBv4H5ysKkHj2V60XOiFra0XXY4+5U3Q7az7o99hN5sM+OMbO6nSF+vWmVha8HcYBDoYvR6rq15C+KQXqNKXd/8wBV8c6d+ZWG2+mi7UXF2GOzNf1mzQVfMmPgfrtllUsR9w2K/g1ZODxPBUqrTJYDCgLP155wE2+z8O+2XqK8sxN+dXVGlbavRotLWlUMVUHPbLJARNc/kFXe40J+tZnN5VShXjsBN1VC/P/BlV+hAWEAm7I40qxmEnIeZc51xXb24f/SjOf8FzdxWHXaFeElA++iGq9CU+NBkttiCq5MZhV9guhiHYP4wq/YkPzqWW3DjsirjQCdTSp+L0e5zfj5Udh10xKfl2aumT+ql19qKZKnlJH3b1e6QD+SVpUZkNg6klL+nDbneEUkvfooPTqSUv6cPub4qmlr4lR46hlrykD3uIfxy19G1oRAa15CV92EP95RjZA8yBaK6Re0VG+rAH+up3ff1Kdjs1JCV92NWbjMqiF3LvQih92Lt7PHv/QXeSfcNN6cPe5Winlv4ZvTx3n0URSB/28x3N1NK3vr4++Jl5GiO11rZGaulbQ2utZm9rMlCkD/ulzpPU0rfa5kPUkpf0YXdAjmlMXctBaslL+rAHB3RIsSJj69TOnX5dRfqwR2R/gj3HPqNKn9SDU1+fFqrkJX3YVV816Huj4f3HdyBusvY3IrtRHHZFt0E79zbvjz11H1FLbv0Oe5/y58T2EpypLnXe8VbLhuSvd27QpUc9vd0w6ODNfHZPKRp3lsB+A4dXA3LLam8jEO68i68RydFG5y2rtXY336Nb5+PxwlVU6ce6g6tgGLOAKm04tasU35/sxhHl5+TZHjRf6EXHAGwa7LLNCGLDjRifYnJu562FjQjULyTnJb+OIWHDqEcfXt82Qxl4xJ/GqLODQ8cd2HPYjm8butHrgisbXBb2H6inqPMyfDB1lBnh2WKH/ti2hXis4F2qtE/dRrIr426qxLWzohgb93fiVKtrr91x+Z5K3T1AbVOPczeFoLY0xA8/So8IqCUKXn0piAqKpw7tUufqG755HqFJ4u6zVPd5Cf70QRy2HuzCpU6XjrlObtstr9Peh/1K4G31KUjACOcGUqLxizuCfXtbkZ00W/O3wvvz7mWIyxP3U0odzVdsasdpF4/ml3P70uP2r+14b2O7cxVHRCmFFViz+xWqtOnwqQPKMFZNlXgqVhZg9dZ25wDoTh5ZZ7cqR9lv/7vNuZ+9iHq9d2J/vTa30OlydGLjt7/BIEGPj9a8PRWf7uuiyr08dlKp8WwPVm5qc66fiib85g2orluOMxebqEc73tmxBEOnfkyVWD5cWYhK5ZPdUzx6BvXY6R6s3dlBlVgS8tfjg71L0N51iXrEt2L7r5Fc8D5VYqn6sBgb9nVS5RkeDbtqn9WBLX8pokos6vr0ezsXKHNLMd+Ql1N3yIvJe5UqsdRVluCv2z3/HHo87Kp/1XQ6TwWLyOJ7CbtqxT4/0NrWjPP2L6kST0VVh9sPRq/GbUuPP0Zdi1fXWcdPqKMez1PP6DV9V4C7x7+J9Njx1CsmPx8LshPvwpd7gnC23ojABHGWdXd9VIwtBzxzQHolIUZ2lTqdqd0mxuiu7q80JHAxHit4B6GWCOoVm3pe4O7sJ1Ge8Q6sW+ZSr+dt9NDKy9UIE/Y+5VNu2388/8TUbpmPedlrkJt6G/Voi3r77SeK1uBCzWvO7XM8qeafxTh5TvnYFoQwYVcdOGZHs4deIPVCMNvu5VhatAqBvsHUq133Zv8SmTHP4sQOz71pa74X6+uOQoVdvVb5UL37n6CmqlIMCXoEcyc8TT36kJkwCTPHvAvrtunU4z7qCcNvTnDYf9R3Dd3Uco/GHWXIGfIi8tL0udVMZFAcFuauVqZn7r360drUjR5xZjBOwoVdvZTAXRqUj/iCtNcwKv5m6tEnf59ALJ6qBH7rfdTjeu58Ha+VcGG3tffhpDKtcLXGHaUoTH0VwyLluEm/yeiDJVPeVwJ/D/W4lno5iGiEC7uq2ebaJ0qdT+YkPodhUSOpRw7eRhMWTl6BWjfM4c/YxLuJqpBhP9/murNt6qpLQtCDGDN4IvXIRT0BNTfrbecuga7SurcUbW74Msb1EjLsdofrnqg+RzaKM2ZTJadBgdHITX4WLS7adqZLrEWY/3H5d1D7I36QEVEhA/8+HJ0wEi/PeosqVvHFGqzavpKqgWNXjk2/qhMv8UKG3RViQiLx2XOrEewfSD1M9fjqZVhb8ylV+ibkNMYVfjv3aQ76Vbw0eymigwdRpW9ShH16VjEKMnKoYpdTB4Bldz1Blb7pPuwWsx9emL6YKnY1t900BZOHi30Z80DQfdgXF92L6BBtXKbrSS/OeBReBn3HQdf/u7CAYDxcNIcq9mPS41Nwx9ipVOmTrsO+sGCOMo3xp4r9lCfK5lNLn3QbdnWuPm/ynVSxa5EWk4TiUfo9s6zbsKsrMKGWIKrYtVowZRa19Ee3Yb8/dxq12PXISxuPwWExVOmLLsOeGpOI0QlpVLHr4eXlhZnZt1ClL7oM+7SxhdRi/XHHOH0+f7oMe8mYydRi/TEidiiSIrR/j/or6S7s6nUe6poxuzH5I7KopRfAfwGfW3nhW3tmnAAAAABJRU5ErkJggg=="
                    />
                  </a>
                  <a
                    href="https://www.cashprice.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CASH PRICE
                  </a>

                  <a
                    href="https://www.papercash.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pure-hidden-xs pure-hidden-sm"
                  >
                    <img
                      alt="Paper Cash Logo"
                      title=""
                      src=" data:image/png;base64,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"
                    />
                  </a>
                  <a
                    href="https://www.papercash.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    PAPER CASH
                  </a>
                </div>
              </div>
            </div>
            <div className="l-box pure-u-1 pure-u-md-1-3 pure-u-lg-1-3">
              {this.state.showSearch && (
                <SearchBox
                  bitbox={this.props.bitbox}
                  placeholder="Search BCH addresses, transactions, and more!"
                />
              )}
              {shortenedUrlComponent}
            </div>
          </div>
        </div>

        <ReactTooltip />
      </div>
    );
  }
}

export default withRouter(Menu);
