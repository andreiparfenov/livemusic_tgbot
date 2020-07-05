const axios = require('axios');
const BASE_URL = 'https://kudago.com/public-api/v1.4';

module.exports = {
  findConcertsByName: (bandName) => axios({
    "method": "GET",
    "url": encodeURI(`${BASE_URL}/search/?q=${bandName}&lang=&expand=&location=msk&ctype=event&is_free=&lat=&lon=&radius=`)
  })
}