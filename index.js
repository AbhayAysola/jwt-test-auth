const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const jwtAuth = require("express-jwt");
const { v4: uuidv4 } = require("uuid");

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).send("Server Running");
});

app.post("/login", (req, res) => {
  // TODO: Validate login credentials
  res.status(200).send(jwt.sign(req.body, "user_secret"));
});

app.post(
  "/generate-api-key",
  jwtAuth({ secret: "user_secret", algorithms: ["HS256"] }),
  (req, res) => {
    res.status(200).send({
      api_key: jwt.sign(
        {
          payload_data: "data",
          scopes: ["read", "write", "other_scopes"],
          jti: uuidv4(), // uuid for blacklisting
        },
        "project_secret",
        { expiresIn: 10 * 60 }
      ),
    });
  }
);

// Example API endpoint
app.get(
  "/accounts",
  jwtAuth({ secret: "project_secret", algorithms: ["HS256"] }), // Decodes and validates the jwt, TODO: add check for blacklisted jwt
  (req, res) => {
    // req.user is the decoded jwt
    if (req.user.scopes.includes("read")) {
      res.status(200).send(["list of accounts"]);
    }
  }
);

app.delete(
  "/revoke-api-key",
  jwtAuth({ secret: "project_secret", algorithms: ["HS256"] }),
  (req, res) => {
    // TIODO: Save the id of jwt to blacklist along with expiry date and remove from blackist after expiry
    console.log(req.user.jti);
    res.status(200).send("api-key revoked");
  }
);

app.listen(8000, (e) => {
  console.log("Server is running on http://localhost:8000");
});
