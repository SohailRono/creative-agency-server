const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.on0vi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('serviceimg'));
app.use(express.static('reviewimg'));
app.use(fileUpload());
const port = 5000;

app.get('/', (req, res) => {
  res.send('hellow port 5000 listening');
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("agencyDB").collection("services");
  const ordersCollection = client.db("agencyDB").collection("orders");
  const adminsCollection = client.db("agencyDB").collection("admins");
  const reviewsCollection = client.db("agencyDB").collection("reviews");

  app.post('/addServices', (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const cssclass = req.body.cssclass;
    const file = req.files.file;
    file.mv(`${__dirname}/serviceimg/${file.name}`, err => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: 'Failed to upload image' });
      }

      servicesCollection.insertOne({ title, description, img: file.name, cssclass })
        .then(result => {
          res.send(result.insertedCount > 0);
        })
      //  return res.send({name: file.name, path: `/${file.name}`});
    })
  })

  app.get('/getServices', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.get('/getServiceById/:id', (req, res) => {
    servicesCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  });

  app.post('/getAdminUser', (req, res) => {
    const email = req.body.email;
    adminsCollection.find({ email: email })
      .toArray((err, documents) => {
        res.send(documents.length > 0);
      })
  });

  app.post('/addOrder', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const service = req.body.service;
    const description = req.body.description;
    const price = req.body.price;
    const status = req.body.status;
    const file = req.files.file;
    file.mv(`${__dirname}/serviceimg/${file.name}`, err => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: 'Failed to upload image' });
      }

      ordersCollection.insertOne({ name, email, service, description, price, status, img: file.name })
        .then(result => {
          res.send(result.insertedCount > 0);
        })
      //  return res.send({name: file.name, path: `/${file.name}`});
    })
  });

  app.post('/getOrdersByEmail', (req, res) => {
    const email = req.body.email;
    ordersCollection.find({ email: email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.get('/getOrders', (req, res) => {
    ordersCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.post('/addAdmin', (req, res) => {
    const email = req.body.email;
    adminsCollection.insertOne({ email })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  });

  app.get('/getReviews', (req, res) => {
    reviewsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.post('/addReview', (req, res) => {
    const name = req.body.name;
    const designation = req.body.designation;
    const description = req.body.description;
    const file = req.files.file;
    file.mv(`${__dirname}/reviewimg/${file.name}`, err => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: 'Failed to upload image' });
      }

      reviewsCollection.insertOne({ name, designation, description, img: file.name })
        .then(result => {
          res.send(result.insertedCount > 0);
        })
      //  return res.send({name: file.name, path: `/${file.name}`});
    })
  })

});

app.listen(process.env.PORT || port);