import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, message) => {
    try {
        const email = {
            to: to,
            from: process.env.SENDGRID_EMAIL,
            subject: subject,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        width: 100%;
                        max-width: 600px;
                        margin: auto;
                    }
                    .header {
                        padding: 20px;
                        background-color: #19a572;
                        color: white;
                        text-align: center;
                    }
                    .content {
                        padding: 20px;
                        background-color: #fff;
                    }
                    .footer {
                        padding: 20px;
                        background-color: #eee;
                        text-align: center;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Flavors Of Kalimpong</h1>
                    </div>
                    <div class="content">
                        <h2>${subject}</h2>
                        <p>${message}</p>
                    </div>
                    <div class="footer">
                        &copy; 2023 Flavors Of Kalimpong. All rights reserved.
                    </div>
                </div>
            </body>
            </html>`
        }
        const emailResponse = await sendgrid.send(email);
        if(emailResponse && Array.isArray(emailResponse)
          && emailResponse.length>0 && emailResponse[0].statusCode === 202){
            return true;
        }else{
            return false;
        }
       
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            console.log(error.response.data.message);
           } else {
             console.log(error);
           }
           return null;
    }
}

export default sendEmail;
