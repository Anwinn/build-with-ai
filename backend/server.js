const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend static files
app.use(express.static(path.join(__dirname, '../')));

// This creates a fake testing email account automatically!
// You can replace this with your real Gmail later.
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Credentials obtained, listening on port 3000');

    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
});

app.post('/api/alert', async (req, res) => {
    const { vehicleId, rtoEmail, ownerEmail, riskType, riskScore } = req.body;

    console.log(`\n🚨 Received Risk Alert from Vehicle ${vehicleId}: ${riskType}`);

    try {
        // Prepare the Warning Email for the RTO
        const mailOptionsRTO = {
            from: '"Predictive Safety System" <system@predictivesafety.inc>',
            to: rtoEmail,
            subject: `URGENT RTO NOTICE: Severe Risk Detected - Vehicle ${vehicleId}`,
            text: `OFFICIAL NOTICE: \n\nVehicle ${vehicleId} has triggered a critical safety threshold.\n\nRisk Type: ${riskType}\nConfidence Score: ${riskScore}%\nAction Required: Immediate review of driver logs.`,
        };

        // Prepare the Warning Email for the Owner/Fleet Manager
        const mailOptionsOwner = {
            from: '"Predictive Safety System" <system@predictivesafety.inc>',
            to: ownerEmail,
            subject: `WARNING: High-Risk Behavior Detected - Your Vehicle ${vehicleId}`,
            text: `ATTENTION OWNER: \n\nYour vehicle ${vehicleId} has just exhibited dangerous driving patterns.\n\nRisk Type: ${riskType}\nRisk Score: ${riskScore}%\n\nPlease contact the driver immediately to prevent a potential accident.`,
        };

        // Send to RTO
        const infoRTO = await transporter.sendMail(mailOptionsRTO);
        console.log('✅ RTO Alert Sent! Preview URL: %s', nodemailer.getTestMessageUrl(infoRTO));

        // Send to Owner
        const infoOwner = await transporter.sendMail(mailOptionsOwner);
        console.log('✅ Owner Alert Sent! Preview URL: %s', nodemailer.getTestMessageUrl(infoOwner));

        res.json({
            success: true,
            message: 'Alerts sent to RTO and Owner successfully!',
            rtoPreviewUrl: nodemailer.getTestMessageUrl(infoRTO),
            ownerPreviewUrl: nodemailer.getTestMessageUrl(infoOwner)
        });

    } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).json({ success: false, error: 'Failed to send alerts' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend Alert Server running on http://localhost:${PORT}`);
    console.log(`Wait 2 seconds for Ethereal Email test account generation...`);
});
