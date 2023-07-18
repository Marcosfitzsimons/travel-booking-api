import nodemailer from 'nodemailer'

const user = process.env.ZOHO_USER
const pass = process.env.ZOHO_PASS

const transport = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false, // If true, port should be 465
    auth: {
        user: user,
        pass: pass,
        authMethod: 'PLAIN', // Specify PLAIN authentication method
    },
});

const sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log("Check");
    transport.sendMail({
        from: user,
        to: email,
        subject: "Confirma tu cuenta por favor",
        html: `<h1>Confirmación por email</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=https://fabebuscda.com.ar/confirm/${confirmationCode}> Click here</a>
          </div>`,
    }).catch(err => console.log(err));
};

export default sendConfirmationEmail