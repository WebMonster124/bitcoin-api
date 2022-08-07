import Axios from "axios";

const jsonstoreEndpoint =
'https://api.shrtco.de/v2/shorten?url='
const LENGTH = 6;
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = UPPERCASE.toLocaleLowerCase();
const DIGITS = '0123456789';
const DOMAIN = window.location.hostname

const shorten = function() {
  const memo = {};

  async function __shorten(text, length, possibleValues, ignoreLength) {
    const [category, extendedText] = text.split(':');
    let shortenedText = "";
    const invalidValues = ["false", "undefined", "null"];


    if(!text || invalidValues.includes(category) || invalidValues.includes(extendedText)){ 
      throw new Error("Argument 'text' is not valid");
    }

    if(extendedText.length === length && !ignoreLength){ 
      throw new Error("You are possibly shortening an already shortened ID, if this is intended pass true on the ignoreLength (4th) parameter");
    }

    if(!possibleValues) {
      possibleValues = `${UPPERCASE}${DIGITS}`;
    }
    
    for(let i = 0; i < length; i++)
      shortenedText += possibleValues.charAt(Math.floor(Math.random() * possibleValues.length));

    const { data: { result: full_short_link } } = await Axios.get(`${jsonstoreEndpoint}+${DOMAIN}/${category}:${extendedText}`);
    
    if(full_short_link) {
      return full_short_link;
    } else {
      const registeredShortened = await extend(shortenedText);
      if(registeredShortened) {
        return registeredShortened;
      } else { 
        const payload = {
          category,
          shortened: shortenedText,
          extended: extendedText,
        };
        
        // await Axios.post(`${jsonstoreEndpoint}/${category}:${extendedText}`, payload);
        // await Axios.post(`${jsonstoreEndpoint}/${category}:${shortenedText}`, payload);
        return payload;
      }
    }
  }

  return function() {
    const key = JSON.stringify(arguments);

    if(!memo[key]) {
      memo[key] = __shorten(...arguments);
      memo[key].then(() => {
        setTimeout(() => {
          delete memo[key];
        }, 1000)
      });
    }

    return memo[key];
  }
}();

async function extend(shortened) {
  const [category, extendedText] = shortened.split(':');
  if(!shortened || !category || !extendedText)
    return;
    
  // const { data: { result } } = await Axios.get(`${jsonstoreEndpoint}/${category}:${extendedText.toUpperCase()}`);
  const { data: { result } } = await Axios.get('https://api.shrtco.de/v2/info?code='+extendedText);
  
  return result;
}

function isShortened(id) {

  const result = id.length === LENGTH && isNaN(Number(id))
  debugger
  return id.length === LENGTH && isNaN(Number(id));
}

function makeShortenedUrl(category, shortened) {
  
  return `${DOMAIN || location.host}/${category}/${shortened}`;
}
async function redirectFromShortened(history, category, id) {
  const { url } = await extend(`${category}:${id}`);
  const [domain,backspace,subdomain,uri] = url.split('/')
  const [uri1, uri2] = uri.split(":")
  
  const shortCategory = {
    address: 'a',
    block: 'b',
    transaction: 't'
  }[category];

  history.replace(`/${shortCategory}/${uri2}`);
}

const Shortener = {
  LENGTH,
  UPPERCASE,
  LOWERCASE,
  DIGITS,
  
  shorten,
  extend,
  isShortened,
  redirectFromShortened,
  makeShortenedUrl,
}

export default Shortener;