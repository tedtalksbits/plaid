// check for neccessary environment variables

export function checkEnvVariables() {
  if (!process.env.COOKIE_SECRET) {
    throw new Error('COOKIE_SECRET environment variable not set');
  }

  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV environment variable not set');
  }

  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST environment variable not set');
  }

  if (!process.env.DB_USER) {
    throw new Error('DB_USER environment variable not set');
  }

  if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD environment variable not set');
  }

  if (!process.env.DB_NAME) {
    throw new Error('DB_NAME environment variable not set');
  }
  console.log('All environment variables set');
}

const dev = {
  client: {
    url: ['http://localhost:5173'],
  },
};

const prod = {
  client: {
    url: 'https://www.example.com',
  },
};

const config = process.env.NODE_ENV === 'development' ? dev : prod;

export default config;
