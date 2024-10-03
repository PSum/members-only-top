const { Pool } = require("pg");

// Check that all necessary environment variables are defined
if (
  !process.env.USER ||
  !process.env.PASSWORD ||
  !process.env.HOST ||
  !process.env.PORT ||
  !process.env.DATABASE ||
  !process.env.DBPORT
) {
  throw new Error(
    "Missing one or more required environment variables (USER, PASSWORD, HOST, PORT, DATABASE)."
  );
}

// All of the following properties are read from environment variables
module.exports = new Pool({
  connectionString: `postgresql://${encodeURIComponent(
    process.env.USER
  )}:${encodeURIComponent(process.env.PASSWORD)}@${process.env.HOST}:${
    process.env.DBPORT
  }/${process.env.DATABASE}`,
});