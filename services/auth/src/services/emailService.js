const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendThankYouEmail(to, name) {
  try {
    const data = await resend.emails.send({
      from: 'GoStream <noreply@update.webstream258.online>',
      to,
      subject: 'You’re in! 🎉 Welcome to GoStream!',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Hi ${name}, thanks for joining GoStream! 🍿</h2>
          <p>We’re thrilled to have you onboard. Get ready to stream like never before.</p>
          <img src="https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif" alt="Thank you" style="width: 300px; height: auto; margin-top: 10px;" />
          <p>Let the binge begin! 🚀</p>
        </div>
      `,
    });
    console.log('Email sent:', data);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}



module.exports = { sendThankYouEmail };
