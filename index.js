//DB imports
const pgPool = require("./db/pgWrapper");
const tokenDB = require("./db/tokenDB")(pgPool);
const userDB = require("./db/userDB")(pgPool);

//OAuth imports
const oAuthService = require("./auth/tokenService")(userDB, tokenDB);
const oAuth2Server = require("node-oauth2-server");

//Express imports
const express = require("express");
const app = express();

app.oauth = oAuth2Server({
  model: oAuthService,
  grants: ["password"],
  debug: true,
});

const testAPIService = require("./test/testAPIService");
const testAPIRoutes = require("./test/testAPIRoutes")(
  express.Router(),
  app,
  testAPIService
);

//Auth and routes

const authenticator = require("./auth/authenticator")(userDB);
const routes = require("./auth/routes")(express.Router(), app, authenticator);

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(app.oauth.errorHandler());
app.use("/auth", routes);
app.use("/test", testAPIRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Listening port ${port}`);
});
