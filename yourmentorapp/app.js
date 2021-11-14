require('dotenv').config({ path: '../private/config.env'});
require('./dbcreate.js');
const SendEmail = require('./email.js');

SendEmail('rv9891211164@gmail.com','Your Mentor first Test mail 🙂','text','Hi!, good night 🥱😴 and sweet dreams from Your Mentor.');

