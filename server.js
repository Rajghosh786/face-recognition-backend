require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser'); // latest version of exressJS now comes with Body-Parser!
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const axios = require('axios');


const db = knex({
  // Enter your own database information here based on what you created
  client: 'pg',
  connection: {
    // host : 'dpg-crrvs00gph6c738mr1n0-a',
    // user : 'face_recognition_database_7i7g_user',
    // password : '660wB0Iy460GdHLZmwEtN7gZp6o7jQBF',
    // database : 'face_recognition_database_7i7g'
    // host : process.env.HOST,
    // user : process.env.USERNAME,
    // password : process.env.PASSWORD,
    // database : process.env.DATABASE,
    host : 'dpg-csfssh5ds78s7391ag3g-a',
    user : 'face_recognition_database_28_10_2024_lrtt_user',
    password : 'VlVi5Tlt2d14CJstjWQzTB4rJdwU1Wtt',
    database : 'face_recognition_database_28_10_2024_lrtt'
  }
});

const app = express();

app.use(cors())
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!

// Test only - when you have a database variable you want to use
// app.get('/', (req, res)=> {
//   res.send(database.users);
// }) 

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
            // loginEmail[0] --> this used to return the email
            // TO
            // loginEmail[0].email --> this now returns the email
            email: loginEmail[0].email,
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({id})
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not found')
      }
    })
    .catch(err => res.status(400).json('error getting user'))
})

app.post('/clarifai', async (req, res) => {
  const { imageUrl } = req.body;
  const PAT = process.env.PAT;
  const USER_ID = process.env.USER_ID;
  const APP_ID = process.env.APP_ID;

  const requestOptions = {
    method: 'POST',
    url: `https://api.clarifai.com/v2/models/face-detection/outputs`,
    headers: {
      Accept: 'application/json',
      Authorization: `Key ${PAT}`,
    },
    data: {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      inputs: [
        {
          data: {
            image: {
              url: imageUrl,
            },
          },
        },
      ],
    },
  };

  try {
    const response = await axios(requestOptions);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Clarifai API:', error);
    res.status(500).json('Error processing request');
  }
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
    // entries[0] --> this used to return the entries
    // TO
    // entries[0].entries --> this now returns the entries
    res.json(entries[0].entries);
  })
  .catch(err => res.status(400).json('unable to get entries'))
})


// setInterval(function reloadWebsite() {
//     axios.get('https://face-recognition-backend-5lyf.onrender.com')
//       .then(response => {
//         console.log(response);
//         console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
//       })
//       .catch(error => {
//         console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
//       });
//   }, 30000);



app.listen(process.env.PORT || 3000, ()=> {
  console.log(`Server is running on port ${process.env.PORT}`);
})
