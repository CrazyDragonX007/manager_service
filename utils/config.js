const env = require("dotenv");
env.config();

module.exports = {
    db_string: process.env.DATABASE_CONNECTION_STRING,
    port: process.env.PORT,
    jwt_secret: process.env.JWT_SECRET,
    mail_username: process.env.MAIL_USERNAME,
    mail_password: process.env.MAIL_PASSWORD
}