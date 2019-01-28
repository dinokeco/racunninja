const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const morgan = require("morgan");
const bodyparser = require("body-parser");
const methodOverride = require("method-override");
const reload = require("reload");

const jwt_secret = "WU5CjF8fHxG40S2t7oyk";

var jwt = require("jsonwebtoken");
var MongoId = require("mongodb").ObjectID;
var db;

MongoClient.connect(
    "mongodb://hmuhibic:racunninja1@ds145750.mlab.com:45750/mean-database-2017",
    (err, database) => {
        if (err) return console.log(err);
        db = database;
        app.listen(5000, () => console.log("App listening on port 5000!"));
    }
);

app.use("/", express.static("public"));
app.use(morgan("dev"));
app.use(bodyparser.urlencoded({ extended: "true" }));
app.use(bodyparser.json());
app.use(bodyparser.json({ type: "application/vnd.api+json" }));
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(methodOverride());

app.use("/rest/v1/", function(request, response, next) {
    jwt.verify(request.get("JWT"), jwt_secret, function(error, decoded) {
        if (error) {
            response.status(401).send("Unauthorized access");
        } else {
            db.collection("users").findOne(
                { _id: new MongoId(decoded._id) },
                function(error, user) {
                    if (error) {
                        throw error;
                    } else {
                        if (user) {
                            next();
                        } else {
                            response.status(401).send("Credentials are wrong.");
                        }
                    }
                }
            );
        }
    });
});

app.use((req, res, next) => {
    const method = req.method;
    const endpoint = req.originalUrl;

    res.on("finish", () => {
        const status = res.statusCode;
        db.collection("logs").insert(
            {
                date: new Date(),
                method,
                endpoint,
                status
            },
            function(err, response) {
                if (err) console.log(err);
            }
        );
    });
    next();
});

//TODO: Implement EPBIH parsing and import of data

// app.get("/epbih", (req, res) => {
//     const puppeteer = require("puppeteer");

//     (async () => {
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.goto("https://www.epbih.ba/profil/login");
//         await page.waitForSelector('input[name="username"]');
//         await page.type('input[name="username"]', "smuhibic");
//         await page.type('input[name="password"]', "pGdE6e2aQZcdE8Y");
//         await page.click('button[type="submit"]');

//         await page._frameManager._mainFrame.waitForNavigation();

//         const content = await page.content();

//         res.send(content);
//         // Add a wait for some selector on the home page to load to ensure the next step works correctly
//         await browser.close();
//     })();
// });

app.post("/rest/v1/telemach/overview", (req, res) => {
    const puppeteer = require("puppeteer");
    const $ = require("cheerio");

    //TODO: zamijeniti default podatke sa paramsima

    (async () => {
        var tempOverviewArray = [];
        var finalOverviewArray = [];

        var tempPaymentsArray = [];
        var finalPaymentsArray = [];

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://mojtelemach.ba/prijavi-se");
        await page.waitForSelector('input[name="username"]');
        await page.type('input[name="username"]', String(req.body.username));
        await page.type('input[name="password"]', String(req.body.password));
        await page.click('button[data-style="slide-down"]');

        await page.waitForSelector('h1[class="dashboard-service-headline"]');
        await page.goto("https://mojtelemach.ba/racuni/pregled-racuna");
        // Add a wait for some selector on the home page to load to ensure the next step works correctly
        var content = await page.content();

        $(".r-table-cell", content).each(function() {
            tempOverviewArray.push(
                $(this)
                    .text()
                    .replace(/\n/g, "")
                    .replace(/\t/g, "")
                    .replace("Datum izdavanja računa:", "")
                    .replace("Iznos:", "")
            );
        });

        for (let index = 4; index < tempOverviewArray.length; index += 4) {
            finalOverviewArray.push({
                date: tempOverviewArray[index - 4],
                debt: tempOverviewArray[index - 3],
                paid: tempOverviewArray[index - 2]
            });
        }

        await page.goto("https://mojtelemach.ba/racuni/moje-uplate");
        await page.waitForXPath('//*[@id="page-wrap"]/div/section/div[1]/h2');
        // Add a wait for some selector on the home page to load to ensure the next step works correctly
        content = await page.content();

        $(".r-table-cell", content).each(function() {
            tempPaymentsArray.push(
                $(this)
                    .text()
                    .replace(/\n/g, "")
                    .replace(/\t/g, "")
                    .replace("Mjesec:", "")
                    .replace("Iznos:", "")
            );
        });

        for (let index = 2; index < tempPaymentsArray.length; index += 2) {
            finalPaymentsArray.push({
                date: tempPaymentsArray[index - 2],
                paid: tempPaymentsArray[index - 1]
            });
        }

        await browser.close();
        db.collection("bills").insert(
            {
                user_id: req.body.user_id,
                provider_id: req.body.provider_id,
                bills: {
                    overview: finalOverviewArray,
                    payments: finalPaymentsArray
                }
            },
            function(err, response) {
                if (err) console.log(err);
                console.log(response);
            }
        );

        res.send("OK");
    })();
});

app.post("/login", function(request, response) {
    var user = request.body;

    db.collection("users").findOne(
        { username: user.username, password: user.password },
        function(error, user) {
            if (error) {
                throw error;
            } else {
                if (user) {
                    var token = jwt.sign(user, jwt_secret, {
                        expiresIn: 20000
                    });

                    console.log(user);

                    response.send({
                        success: true,
                        message: "Authenticated",
                        token: token,
                        user_id: user._id
                    });
                } else {
                    response.status(401).send("Credentials are wrong.");
                }
            }
        }
    );
});

app.get("/rest/v1/bills", function(request, response) {
    db.collection("bills")
        .find()
        .toArray((err, bills) => {
            if (err) return console.log(err);
            response.setHeader("Content-Type", "application/json");
            response.send(bills);
        });
});

app.post("/rest/v1/provider/add/:id", function(request, response) {
    provider = request.body;
    db.collection("users").findOneAndUpdate(
        {
            _id: new MongoId(request.params.id)
        },
        {
            $addToSet: {
                providers: provider
            }
        },
        (err, result) => {
            if (err) return console.log(err);

            db.collection("users")
                .find()
                .toArray((err, user) => {
                    if (err) return console.log(err);
                    response.setHeader("Content-Type", "application/json");
                    response.send(user);
                });
        }
    );
});

// won't be used at this time
app.put("/rest/v1/provider/edit", function(request, response) {
    provider = request.body;
    db.collection("providers").findOneAndUpdate(
        { _id: new MongoId(provider._id) },
        {
            $set: {
                name: provider.name,
                reference_number: provider.reference_number
            }
        },
        (err, result) => {
            if (err) return res.send(err);
            response.send("OK");
        }
    );
});

app.delete("/rest/v1/provider/delete/:id", function(request, response) {
    db.collection("providers").findOneAndDelete(
        { _id: new MongoId(request.params.id) },
        (err, result) => {
            if (err) return res.send(500, err);
            response.send("OK");
        }
    );
});

app.get("/rest/v1/providers", function(request, response) {
    db.collection("providers")
        .find({})
        .toArray((err, providers) => {
            if (err) return console.log(err);
            response.setHeader("Content-Type", "application/json");
            response.send(providers);
        });
});

app.get("/rest/v1/users/:id", function(request, response) {
    db.collection("users")
        .find({ _id: new MongoId(request.params.id) })
        .toArray((err, user) => {
            if (err) return console.log(err);
            response.setHeader("Content-Type", "application/json");
            response.send(user);
        });
});

app.post("/rest/v1/bill", function(request, response) {
    db.collection("bills").save(
        {
            bill_number: request.body.bill_number,
            provider_id: request.body.provider_id,
            amount: request.body.amount,
            date: new Date(request.body.date)
        },
        (err, result) => {
            if (err) return console.log(err);
            response.send("OK");
        }
    );
});

app.get("/rest/v1/report", function(request, response) {
    db.collection("bills").aggregate(
        [
            { $match: { date: { $exists: true } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ],
        function(err, documents) {
            if (err) return console.log(err);
            response.send(documents);
        }
    );
});

app.post("/rest/v1/statistics/", function(request, response) {
    var totalSpent = 0;
    var counter = 0;
    db.collection("bills")
        .find({ provider_id: request.body.provider_id })
        .toArray(function(err, response) {
            if (err) console.log(err);
            response[0]["bills"].overview.forEach(function(item) {
                totalSpent += parseFloat(item.debt.replace(" KM", ""));
                counter += 1;
            });
            avgSpent = totalSpent / counter;
            db.collection("statistics")
                .find({})
                .toArray(function(err, response) {
                    if (err) console.log(err);
                    if (response.length === 0) {
                        db.collection("statistics").insert(
                            {
                                _id: request.body.provider_id,
                                user_id: request.body.user_id,
                                provider_id: request.body.provider_id,
                                statistics: {
                                    avg_spent: avgSpent.toFixed(2),
                                    total_spent: totalSpent.toFixed(2)
                                }
                            },
                            function(err, response) {
                                if (err) console.log(err);
                            }
                        );
                    } else {
                        db.collection("statistics").save(
                            {
                                _id: request.body.provider_id,
                                user_id: request.body.user_id,
                                provider_id: request.body.provider_id,
                                statistics: {
                                    avg_spent: avgSpent.toFixed(2),
                                    total_spent: totalSpent.toFixed(2)
                                }
                            },
                            function(err, response) {
                                if (err) console.log(err);
                            }
                        );
                    }
                });
        });
    response.send("OK");
});

app.get("/rest/v1/statistics/:provider_id", function(request, response) {
    db.collection("statistics")
        .find({ provider_id: request.params.provider_id })
        .toArray(function(err, statistics) {
            if (err) console.log(err);
            response.send(statistics);
        });
});

reload(app);
