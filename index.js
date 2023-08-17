var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const mysql = require("mysql");

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "project_name",
    port: 3306,
});

app.listen(3001, function () {
    console.log("port 3001");
});

app.get("/", (req, res) => {
    console.log("Hello");
    res.send("Hello");
});


app.post("/insert_message", (req, res) => {
    db.query(
        "INSERT INTO data (name, message) VALUES (?, ?)",
        [req.body.name, req.body.message],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({ status: false, error: "Error inserting message" });
            } else {
                const insertedId = result.insertId; // Get the inserted ID

                console.log("Inserted ID:", insertedId);

                res.json({ status: true, insertedId });
            }
        }
    );
});

// app.post("/getdata", jsonParser, function (req, res, next) {
//     const ignoredIds = req.body.ignoredIds || []; // Array of IDs to be ignored

//     db.query(`SELECT * FROM data WHERE id_data NOT IN (?) ORDER BY RAND() LIMIT 9`, [ignoredIds], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send("An error occurred.");
//         }

//         res.send(result);
//     });
// });

app.post("/getdata", jsonParser, function (req, res, next) {
    const randomQuery = `SELECT * FROM data WHERE id_data NOT IN (?) ORDER BY RAND() LIMIT 9`;

    // Assuming you pass an array of 10 IDs in the request body
    const ids = req.body.ids;

    const idQuery = `SELECT * FROM data WHERE id_data IN (?)`;

    db.query(randomQuery, [ids], (randomErr, randomResult) => {
        if (randomErr) {
            console.error(randomErr);
            res.status(500).send("Error fetching random data.");
            return;
        }

        db.query(idQuery, [ids], (idErr, idResult) => {
            if (idErr) {
                console.error(idErr);
                res.status(500).send("Error fetching data with IDs.");
                return;
            }

            // Combine the arrays from both results into a single array
            const combinedResult = randomResult.concat(idResult);

            res.send(combinedResult);
        });
    });
});

