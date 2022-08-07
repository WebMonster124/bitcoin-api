const Utils = {
  addressUrl(id) {
    return `/a/${id}`;
  },
  blockUrl(id) {
    return `/b/${id}`;
  },
  transactionUrl(id) {
    return `/t/${id}`;
  }
};

export default Utils;