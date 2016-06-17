module.exports = {
  'mysql': {
    'host': process.env.MYSQL_HOST || 'localhost',
    'port': process.env.MYSQL_PORT || 3306,
    'database': process.env.MYSQL_DATABASE || 'db_name',
    'username': process.env.MYSQL_USERNAME || 'root',
    'password': process.env.MYSQL_PASSWORD || 'root'
  },
  'mail': {
    'transports': [
      {
        'type': process.env.MAIL_DRIVER || 'SMTP',
        'host': process.env.MAIL_HOST || 'smtp.gmail.com',
        'secure': process.env.MAIL_SECURE || true,
        'port': process.env.MAIL_PORT || 465,
        'auth': {
          'user': process.env.MAIL_USERNAME || '',
          'pass': process.env.MAIL_PASSWORD || ''
        }
      }
    ]
  }
};
