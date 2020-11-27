const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP }  = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const helmet = require('helmet');
const compression = require('compression');
const app = express();
const cors = require('cors')

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + '-' + file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === 'image/png' ||
//     file.mimetype === 'image/jpg' ||
//     file.mimetype === 'image/jpeg'
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
// );
// app.use('/images', express.static(path.join(__dirname, 'images')));

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'OPTIONS, GET, POST, PUT, PATCH, DELETE'
//   );
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   // res.setHeader('Access-Control-Allow-Credentials', true);
//   if(res.method === 'OPTIONS'){
//     return res.sendStatus(200);
//   }
//   next();
// });
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
)
app.use( cors() );
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream:accessLogStream }))

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(err){
    if(!err.originalError){
      return err;
    }
    const message = err.message || 'An error occurred';
    const code = err.originalError.code || 500;
    const data = err.originalError.data;
    return{ message:message, status:code, data:data }
  }
}))

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb+srv://dev:WxyDj338mfzcYz7n@cluster0.1ew7o.mongodb.net/messages?retryWrites=true&w=majority'
  )
  .then(result => {
    app.listen(process.env.PORT || 8080);
    // const server = app.listen(8080);
    // const io = require('./socket').init(server);
    // io.on('connection', socket => {
    //   console.log('Client connected');
    // });
  })
  .catch(err => console.log(err));
