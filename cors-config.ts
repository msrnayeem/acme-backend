import cors from 'cors';

const corsOptions = {
  origin: ['http://localhost:3000', 'https://acme.logicmatrix.tech'], // Add your frontend domains
  credentials: true, // Important: allows cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));