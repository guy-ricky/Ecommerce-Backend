const axios = require("axios");

const createToken = async (req, res, next) => {
  try {
    const secret = process.env.MPESA_SECRET;
    const consumer = process.env.MPESA_KEY;
    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const token = response.data.access_token;
    console.log(token);

    // Pass the obtained token to the next middleware or route
    req.mpesaToken = token;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create token" });
  }
};

const stkPush = async (req, res) => {
  try {
    const shortCode = 174379;
    const phone = req.body.phone.substring(1);
    const amount = req.body.amount;
    const passkey = process.env.MPESA_PASSKEY;
    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(shortCode + passkey + timestamp).toString(
      "base64"
    );
    
    const data = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: `254${phone}`,
      PartyB: shortCode,
      PhoneNumber: `254${phone}`,
      CallBackURL: "https://mydomain.com/api", // Replace with your actual callback URL
      AccountReference: "MpesaTest",
      TransactionDesc: "Testing stk push",
    };

    // Retrieve the token from the request object
    const token = req.mpesaToken;

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initiate STK push" });
  }
};



module.exports = { createToken, stkPush };
