module.exports = (app) => {
    require("dotenv").config();

const express = require('express');
const bp = require('body-parser');
const cors = require("cors");
const corsOptions = { origin: '*'}
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const bisectionFile = require('./bisections.json');
const onepointFile = require('./onepoints.json');
const linearFile = require('./linearregressions.json');

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

const uri = `mongodb+srv://tonsak2:1234@cluster0.oig7p.mongodb.net/Numerical`;

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors(corsOptions))
app.use(express.json());

// let connect = mongoose.createConnection(uri)
// connect.on('open', () => { console.log('connected'); })

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));


app.listen(port, () => console.log(`at port ${port}`));

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log(req.headers);
    console.log(authHeader);
  
    if (!authHeader) {
      return res.status(401).send('Missing authorization header');
    }
  
    const token = authHeader
  
    try {
      const decoded = jwt.verify(token, 'tonsak5343');
      if (decoded.apiKey !== '5343') {
        throw new Error('Invalid API key');
      }
      next();
    } catch (error) {
      return res.status(401).send('Unauthorized');
    }
  }
  
  function generateToken(req, res) {
    const payload = {
      apiKey: '5343'
    };
  
    const token = jwt.sign(payload, 'tonsak5343');
    console.log(token);
    res.json({
      token: token
    });
  }

app.post('/token',generateToken);

app.get('/Exbisection', async (req, res) => {
    let fx = req.query.select;
    console.log(fx);
    const BisectionSchema = new mongoose.Schema({
          Equation: {
            type: String,
            required: true,
          },
          XL: {
            type: Number,
            required: true,
          },
          XR: {
            type: Number,
            required: true,
          },
    });
    Bisection = mongoose.models.bisections || mongoose.model('bisections', BisectionSchema);
    console.log(`Using collection: ${Bisection.collection.name}`);
    try {
        let bisecExample = await Bisection.find({ Equation : fx });
        console.log(bisecExample[0]);
        let data = [{
            Equation: bisecExample[0].Equation,
            XL: bisecExample[0].XL,
            XR: bisecExample[0].XR
        }]
        res.send(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
})

app.post('/ExOnepoint', async (req, res) => {
  let fx = req.body.selectedValue;
  console.log(fx);
  const OnepointSchema = new mongoose.Schema({
        Equation: {
          type: String,
          required: true,
        },
        X: {
          type: Number,
          required: true,
        },
  });
  Onepoint = mongoose.models.onepoints || mongoose.model('onepoints', OnepointSchema);
  console.log(`Using collection: ${Onepoint.collection.name}`);
  // let insetOnepoint = await Onepoint.insert(
  //   {
  //     "Equation": fx,
  //     "X": 0
  //   }
  // )
  try {
      let onepointExample = await Onepoint.find({ Equation : fx });
      console.log(onepointExample[0]);
      let data = [{
          Equation: onepointExample[0].Equation,
          X: onepointExample[0].X,
      }]
      res.send(data);
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
})

app.post('/Exlinear',authenticate, async (req,res) => {
    let option = req.body.selectedValue;
    let X_in,N_in
    if(option == 'option1') {
        X_in=65;
        N_in=9;
    } else if (option == 'option2') {
        X_in=25;
        N_in=6;
    }
    const dataSchema = new mongoose.Schema({
        Nsize: {
          type: Number,
          required: true
        },
        X: {
          type: Number,
          required: true
        },
        Matrix: {
          type: [[Number]],
          required: true
        }
      });
      
      Linear = mongoose.models.linearregressions || mongoose.model('linearregressions', dataSchema);
      console.log(`Using collection: ${Linear.collection.name}`);
      try {
          let linearExample = await Linear.find({ X: X_in, Nsize: N_in });
          console.log(linearExample[0]);
          let data = [{
              NSize: linearExample[0].Nsize,
              Xval: linearExample[0].X,
              Matrix: linearExample[0].Matrix
          }]
          res.send(data);
      } catch (err) {
          console.error(err);
          res.status(500).send('Internal server error');
      }
})

app.get('/hello', (req, res) => (
    res.send("Hello world")
))
}