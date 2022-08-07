import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { withRouter } from 'react-router-dom';
import QrReader from 'react-qr-reader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Utils from '../utils';
import Axios from 'axios';

const ADDRESS_LENGTHS = [34, 42, 54];
const HASH_LENGTH = 64;

function SearchBox({
  bitbox,
  history,
  placeholder = 'Search BCH addresses, transactions, and more in a short URL!',
  onError = () => null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [scanningQrCode, setScanningQrCode] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [blockCount, setBlockCount] = useState(0);
  const [isValidInput, setIsValidInput] = useState(false);
  const qrScanner = useRef();

  useEffect(() => {
    // bitbox.Blockchain.getBlockCount()
    //   .then(setBlockCount)
    //   .catch(() => console.error('Could not get block count'));
    Axios.get("https://chain.api.btc.com/v3/block/latest")
    .then(block=>{
      setBlockCount(block.data.data.height)
    })
    .catch(()=>console.error('Could not get block count'))
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const numberSearch = Number(searchTerm);
      const isNumber = !searchTerm.includes('.') && !Number.isNaN(numberSearch);
      if (isNumber && numberSearch >= 0 && numberSearch <= blockCount) {
        return setIsValidInput(true);
      } else if (!isNumber) {
        if (
          ADDRESS_LENGTHS.includes(searchTerm.length) &&
          isValidAddress(searchTerm)
        )
          return setIsValidInput(true);
        else if (searchTerm.length === HASH_LENGTH)
          return setIsValidInput(true);
      }
    }

    setIsValidInput(false);
  }, [searchTerm]);

  const handleSubmit = (event, search) => {
    event && event.preventDefault();

    search = search || searchTerm;
    if (!search) return;

    if (ADDRESS_LENGTHS.includes(search.length)) {
      if (!isValidAddress(search)) {
        onError('Invalid address.');
        return;
      }

      history.push(Utils.addressUrl(search));
    } else if (search.length === HASH_LENGTH) {
      Axios.get("https://chain.api.btc.com/v3/tx/"+search).then(
        () => history.push(Utils.transactionUrl(search)),
        () => {
          bitbox.Blockchain.getBlockHash(search)
            .then(() => history.push(Utils.blockUrl(search)))
            .catch(() => onError('Could not retrieve transaction or block.'));
        },
      );
    } else {
      Axios.get('https://chain.api.btc.com/v3/block/'+search).then(
        () => history.push(Utils.blockUrl(search)),
        () => onError('Could not retrieve block.'),
      );
    }
  };

  const handleQrScan = code => {
    if (code) {
      setSearchTerm(code);
      handleSubmit(null, code);
      setScanningQrCode(false);
      setCameraReady(false);
    }
  };

  const handleQrError = () => {
    setScanningQrCode(false);
    setCameraReady(false);
    qrScanner.current.openImageDialog();
  };

  const isValidAddress = address => {
    let isValid = true;

    try {
      bitbox.Address.toLegacyAddress(address);
      bitbox.Address.toCashAddress(address);
      bitbox.Address.toCashAddress(address, false);
    } catch (err) {
      isValid = false;
    }

    return isValid;
  };

  return (
    <span className="input-icon-wrap">
      <form onSubmit={handleSubmit}>
        <input
          id="form-name"
          value={searchTerm}
          onChange={ev => setSearchTerm(ev.currentTarget.value)}
          placeholder={placeholder}
          type="text"
          className="pure-input-rounded input-with-icon"
        />
      </form>
      {isValidInput ? (
        <span className="input-icon" onClick={handleSubmit}>
          <FontAwesomeIcon icon="search" />
        </span>
      ) : (
        <span
          className="input-icon"
          style={{ padding: '11px 11px 0px 11px' }}
          onClick={() => {
            setScanningQrCode(true);
          }}
        >
          <img style={{ height: '1.5rem' }} src="/qr-search.png" />
        </span>
      )}
      {scanningQrCode &&
        createPortal(
          <div
            style={{
              backgroundColor: '#18693b',
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              display: cameraReady ? 'flex' : 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <QrReader
              style={{
                flex: 1,
                width: '100%',
                backgroundColor: '#18693b',
              }}
              className="qr-scanner"
              onScan={handleQrScan}
              onError={handleQrError}
              onLoad={() => setCameraReady(true)}
            />
            <div
              style={{
                paddingTop: 15,
                paddingBottom: 15,
                fontSize: '1rem',
                textAlign: 'center',
                width: '100%',
              }}
              onClick={() => {
                setScanningQrCode(false);
                setCameraError(false);
              }}
            >
              Cancel
            </div>
          </div>,
          document.getElementById('qr-reader'),
        )}
      <QrReader
        ref={scanner => (qrScanner.current = scanner)}
        legacyMode
        onScan={handleQrScan}
        onError={handleQrError}
      />
    </span>
  );
}

export default withRouter(SearchBox);
