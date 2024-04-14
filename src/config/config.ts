import dotenv from "dotenv";
dotenv.config();


const { PORT,
       MONGODB_URL,
       JWT_SECRET,
       ACCESS_TOKEN_SECRET_KEY,
       REFRESH_TOKEN_SECRET_KEY,
       GOOGLE_OAUTH_CLIENT_ID,
       GOOGLE_OAUTH_CLIENT_SECRET,
       CALLBACK_URL,
       BASE_URL,
       CLIENT_URL,
       ALPHA_VANTAGE_API_KEY,
       SMTP_HOST,
       SMTP_PORT,
       SMTP_SECURE,
       SMTP_REQUIRE_TLS,
       SMTP_AUTH_USER,
       SMTP_AUTH_PASS,
       PRODUCT_NAME,
       TYPE_FORGOT_PASSWORD
} = process.env;

export {
       PORT,
       MONGODB_URL,
       JWT_SECRET,
       ACCESS_TOKEN_SECRET_KEY,
       REFRESH_TOKEN_SECRET_KEY,
       GOOGLE_OAUTH_CLIENT_ID,
       GOOGLE_OAUTH_CLIENT_SECRET,
       CALLBACK_URL,
       BASE_URL,
       CLIENT_URL,
       ALPHA_VANTAGE_API_KEY,
       SMTP_HOST,
       SMTP_PORT,
       SMTP_SECURE,
       SMTP_REQUIRE_TLS,
       SMTP_AUTH_USER,
       SMTP_AUTH_PASS,
       PRODUCT_NAME,
       TYPE_FORGOT_PASSWORD
};
       
 


