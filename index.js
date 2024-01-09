const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000; // Choose any port you prefer

// Sample solSend function (replace this with your actual implementation)
async function sendSol(amount, recipientPublicKey) {

    // Build connection
    const {
        Connection,
        Keypair,
        LAMPORTS_PER_SOL,
        PublicKey,
        SystemProgram,
        Transaction,
        clusterApiUrl,
        sendAndConfirmTransaction,
      } = require("@solana/web3.js");

    const fs = require("fs");
    
    // const secret = JSON.parse(fs.readFileSync("escrow.json").toString());
    const secret = [
        57,  36, 217, 147, 131,  61, 118, 238, 124, 147, 229,
       180, 147,  72, 247,  65, 195,  53, 113, 210, 196, 164,
       176,  31,  35, 138, 203, 175, 221, 212, 149, 150, 169,
        71, 186, 241,  12, 130,  17,  45, 207,   2, 178, 179,
        19, 102, 220, 176,  72,  69, 160,  61,  21, 121, 117,
        85,  30,  65,   9, 207,  17, 145, 197, 156
     ]
    console.log(secret);
    const secretkey = Uint8Array.from(secret);
    
    const ownerKeypair = Keypair.fromSecretKey(secretkey);
    
    const publicKey = ownerKeypair.publicKey;
    
    console.log(publicKey.toBase58());


    
    const conn = new Connection(clusterApiUrl("devnet"));
    
    
    // calculate amount
    const sol_price = 100;
    // const converted_amount = parseFloat(amount)/sol_price
    const converted_amount = parseFloat(amount)/sol_price
    
    // let commision_amount = converted_amount * 0.05;
    // commision_amount = convertBigIntToFloatWithTwoDecimalPlaces(commision_amount);
    
    // let reciptent_amount = converted_amount - commision_amount;
    let reciptent_amount = converted_amount * 0.95;
    let commision_amount = converted_amount - reciptent_amount;
    // reciptent_amount = convertBigIntToFloatWithTwoDecimalPlaces(reciptent_amount);
    
    // console.log(commision_amount)
    // commision_amount = convertBigIntToFloatWithTwoDecimalPlaces(commision_amount);
    if (convertBigIntToFloatWithTwoDecimalPlaces(commision_amount) <= 0){
        commision_amount= commision_amount
    }
    else{
        commision_amount = convertBigIntToFloatWithTwoDecimalPlaces(commision_amount);
    }

    // reciptent_amount = convertBigIntToFloatWithTwoDecimalPlaces(reciptent_amount);

    console.log(amount, converted_amount, commision_amount, reciptent_amount)
    // commision publickey
    const commisionPublicKey = new PublicKey("2myWaEK9sJ1tUw7wdYmPxuLTTyeXQcfBCopjKi8DGTsJ");
    const recipientPublicKey_modified = new PublicKey(recipientPublicKey);

    
    
    // reciptent_instruction
    const sendSolInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPublicKey_modified,
        lamports: LAMPORTS_PER_SOL * reciptent_amount,
    });
    
    // commision instruction
    const ownSendSolInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: commisionPublicKey,
        lamports: LAMPORTS_PER_SOL * commision_amount,
    });
    
    
    // created transaction
    const transaction = new Transaction();
    transaction.add(sendSolInstruction);
    transaction.add(ownSendSolInstruction);
    
    // send transaction
    try {
        const signature = await sendAndConfirmTransaction(
          conn,
          transaction,
          [ownerKeypair]
        );
        console.log("Successfully transferred SOL. Signature:", signature);
        return {"text": "Transaction has been successul."}
      } catch (error) {
        console.error("Not enough balance. Error:", error);
      }

    // Function to convert a BigInt to a float with two decimal places
    function convertBigIntToFloatWithTwoDecimalPlaces(bigIntValue) {

        // Convert BigInt to a string
        const stringValue = bigIntValue.toString();
        
        // Get the integer and decimal parts
        const integerPart = stringValue.slice(0, -2) || '0';
        const decimalPart = stringValue.slice(-2);
        
        // Create a float by combining the integer and decimal parts
        const floatValue = parseFloat(`${integerPart}.${decimalPart}`);
        
        return floatValue;
        }
        
}
// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Endpoint to handle solSend
app.post('/sendSol', (req, res) => {
  const { amount, publicKey } = req.body;

  // Validate input
  if (typeof amount !== 'number' || typeof publicKey !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Call your solSend function
  sendSol(amount, publicKey);

  // Respond with a success message (you can customize this)
  res.json({ message: 'Solana sent successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app