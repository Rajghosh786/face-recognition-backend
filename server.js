require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser'); // latest version of exressJS now comes with Body-Parser!
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const axios = require('axios');


// const db = knex({
//   // Enter your own database information here based on what you created
//   client: 'pg',
//   connection: {
//     host : '127.0.0.1',
//     user : 'postgres',
//     password : 'test',
//     database : 'smart-brain'
//   }
// });

const app = express();

app.use(cors())
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!

// Test only - when you have a database variable you want to use
// app.get('/', (req, res)=> {
//   res.send(database.users);
// }) 

// app.post('/signin', (req, res) => {
//   db.select('email', 'hash').from('login')
//     .where('email', '=', req.body.email)
//     .then(data => {
//       const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
//       if (isValid) {
//         return db.select('*').from('users')
//           .where('email', '=', req.body.email)
//           .then(user => {
//             res.json(user[0])
//           })
//           .catch(err => res.status(400).json('unable to get user'))
//       } else {
//         res.status(400).json('wrong credentials')
//       }
//     })
//     .catch(err => res.status(400).json('wrong credentials'))
// })

// app.post('/register', (req, res) => {
//   const { email, name, password } = req.body;
//   const hash = bcrypt.hashSync(password);
//     db.transaction(trx => {
//       trx.insert({
//         hash: hash,
//         email: email
//       })
//       .into('login')
//       .returning('email')
//       .then(loginEmail => {
//         return trx('users')
//           .returning('*')
//           .insert({
//             // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
//             // loginEmail[0] --> this used to return the email
//             // TO
//             // loginEmail[0].email --> this now returns the email
//             email: loginEmail[0].email,
//             name: name,
//             joined: new Date()
//           })
//           .then(user => {
//             res.json(user[0]);
//           })
//       })
//       .then(trx.commit)
//       .catch(trx.rollback)
//     })
//     .catch(err => res.status(400).json('unable to register'))
// })

// app.get('/profile/:id', (req, res) => {
//   const { id } = req.params;
//   db.select('*').from('users').where({id})
//     .then(user => {
//       if (user.length) {
//         res.json(user[0])
//       } else {
//         res.status(400).json('Not found')
//       }
//     })
//     .catch(err => res.status(400).json('error getting user'))
// })

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

// app.put('/image', (req, res) => {
//   const { id } = req.body;
//   db('users').where('id', '=', id)
//   .increment('entries', 1)
//   .returning('entries')
//   .then(entries => {
//     // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
//     // entries[0] --> this used to return the entries
//     // TO
//     // entries[0].entries --> this now returns the entries
//     res.json(entries[0].entries);
//   })
//   .catch(err => res.status(400).json('unable to get entries'))
// })


app.listen(process.env.PORT || 3000, ()=> {
  console.log(`Server is running on port ${process.env.PORT}`);
})







// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const knex = require('knex');
// const axios = require('axios');

// const db = knex({
//   client: 'pg',
//   connection: {
//     host: '127.0.0.1',
//     user: 'postgres',
//     password: 'test',
//     database: 'smart-brain',
//   },
// });

// const app = express();

// app.use(cors());
// app.use(express.json());

// // New endpoint for Clarifai API


// // Your existing /image endpoint here...

// app.listen(3001, () => {
//   console.log('app is running on port 3001');
// });














