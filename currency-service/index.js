const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

let ratesCache = {};

app.get('/all-rates', (req, res) => {
    res.json({
        info: "This data is currently stored in the server's RAM (Memory)",
        timestamp: new Date().toISOString(),
        rates: ratesCache
    });
});

app.get('/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.query;
        if (!from || !to || !amount) {
            return res.status(400).send("Missing parameters");
        }

        // Fetch and cache in memory
        const response = await axios.get(`https://open.er-api.com/v6/latest/${from}`);
        ratesCache = response.data.rates;
        
        const rate = ratesCache[to];
        if (!rate) {
            return res.status(400).send("Currency not supported");
        }

        const converted = amount * rate;
        res.json({ converted, rate });
    } catch (err) {
        console.error(err);
        res.status(500).send("Conversion error");
    }
});

app.listen(3002, () => console.log("Currency Service running on 3002"));