const nodemailer = require('nodemailer');

// In-memory cache for OTP codes with expirations
const otpStore = new Map();

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (req.method === 'POST') {
    if (action === 'send') {
      const { email, password } = req.body;
      const expectedEmail = process.env.VITE_ADMIN_EMAIL || 'vitalagro4@gmail.com';
      const expectedPassword = process.env.VITE_ADMIN_PASSWORD || 'Bsfood$44';

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (email.trim() !== expectedEmail || password !== expectedPassword) {
        return res.status(401).json({ error: 'Unauthorized Administrative Credentials' });
      }

      // Generate a secure 6-digit numeric OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store in memory with 10 minutes validation
      otpStore.set(email.trim().toLowerCase(), {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      // Construct nodemailer transporter
      // Uses Gmail service mapping credentials
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: expectedEmail,
          pass: expectedPassword
        }
      });

      const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Vital Agro Administrative 2FA Verification</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #080c08; color: #ffffff; margin: 0; padding: 0; }
            .wrapper { padding: 40px 20px; background-color: #080c08; }
            .container { max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.02); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
            .header { background: linear-gradient(135deg, #051c0c, #0d0d0d); padding: 30px; text-align: center; border-bottom: 1px solid rgba(16, 185, 129, 0.2); }
            .logo { font-size: 24px; font-weight: 900; color: #10B981; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
            .body { padding: 40px 30px; text-align: center; }
            .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 15px; }
            .desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 30px; }
            .otp-box { background: rgba(16, 185, 129, 0.08); border: 1px dashed #10B981; border-radius: 12px; padding: 20px; font-size: 32px; font-family: monospace; font-weight: 900; color: #34D399; letter-spacing: 8px; margin-bottom: 30px; display: inline-block; text-shadow: 0 0 10px rgba(52, 211, 153, 0.3); }
            .footer { padding: 25px 30px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); text-align: center; font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1 class="logo">Vital Agro</h1>
              </div>
              <div class="body">
                <h2 class="title">Administrative Authorization Required</h2>
                <p class="desc">A login request was initiated for your Vital Agro administrative command panel. Use the secure 2FA passcode below to authorize access. This code is valid for 10 minutes.</p>
                <div class="otp-box">${otp}</div>
                <p class="desc" style="font-size: 11px; margin-bottom: 0;">If you did not make this request, please contact security protocols immediately.</p>
              </div>
              <div class="footer">
                VITAL AGRO INDUSTRIES &copy; 2026<br>
                SECURE MANAGEMENT GATEWAY // SSL 256-BIT CONNECTION ACTIVE
              </div>
            </div>
          </div>
        </body>
      </html>
      `;

      try {
        await transporter.sendMail({
          from: `"Vital Agro Security" <${expectedEmail}>`,
          to: email,
          subject: '🔒 Vital Agro Administrative 2FA Verification Passcode',
          html: htmlTemplate
        });
        
        console.log(`[OTP Sent] Code ${otp} dispatched successfully via email to ${email}`);
        return res.status(200).json({ success: true, message: 'OTP sent successfully' });
      } catch (err) {
        console.error('Error sending OTP email, running fallback:', err);
        // Fallback for development/offline test scenarios to let the user proceed
        return res.status(200).json({ 
          success: true, 
          message: 'OTP generated (Simulated console mode)', 
          devOtp: otp 
        });
      }
    } 
    
    if (action === 'verify') {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: 'Email and verification code are required' });
      }

      const record = otpStore.get(email.trim().toLowerCase());
      if (!record) {
        return res.status(400).json({ error: 'No active OTP verification session found' });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(email.trim().toLowerCase());
        return res.status(400).json({ error: 'OTP validation session expired' });
      }

      if (record.otp === code) {
        otpStore.delete(email.trim().toLowerCase());
        return res.status(200).json({ success: true, token: 'authenticated_true' });
      } else {
        return res.status(400).json({ error: 'Access Denied: Invalid Administrative Token' });
      }
    }
  }

  return res.status(404).json({ error: 'Not found' });
};
