
# TradeWise

Welcome to our Stock Trading Application! This platform provides users with the ability to buy and sell stocks, manage their portfolios, and view transaction histories seamlessly. Users can authenticate via Google authentication or an OTP-based system for secure access. The application supports both limit and market orders, ensuring flexibility in trading strategies. Built with Next.js for the frontend, Node.js for the backend, and MongoDB for the database, our platform offers a reliable and efficient trading experience.


## Backend

### Installing

A step by step series of examples that tell you how to get a development env running

```
1. Install node js
2. Verify installation by running node -v and npm -v on the terminal.
3. npm install
4. npm start
```
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3100] to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

###Code Integration
Buying and selling a stock is dependedent on the user profile module. If a user has credits then only he can buy stocks. Also, when the user buys a stock, credits gets deducted from the user. If the user credits are not enough, he/she wont be able to buy a stock. When the user sells a stock, the amount at that time for that stock gets credited to the user account.

## API Endpoints

Welcome to the backend of our Stock Trading Application! Below are the API endpoints along with their purposes:

### Orders

- **Place Order**: `/orders/placeOrder` (POST)
  - Place an order for buying or selling stocks.

### Stocks

- **Get All Stocks**: `/stocks` (GET)
  - Retrieve all stocks.
- **Get Stock by Symbol**: `/stocks/:symbol` (GET)
  - Retrieve a specific stock by symbol.
- **Create Stock**: `/stocks` (POST)
  - Create a new stock.

### Transactions

- **Get All Transactions**: `/transactions` (GET)
  - Retrieve all transactions.
- **Get Transactions by Symbol**: `/transactions/symbol/:symbol` (GET)
  - Retrieve transactions by stock symbol.
- **Get Transactions by User ID**: `/transactions/user/:userId` (GET)
  - Retrieve transactions by user ID.
- **Get Transaction by ID**: `/transactions/id/:transactionId` (GET)
  - Retrieve a specific transaction by ID.
- **Execute Transaction**: `/transactions/execute` (POST)
  - Execute a transaction.

### Authentication

- **Register User**: `/auth/register` (POST)
  - Register a new user.
- **Login User**: `/auth/login` (POST)
  - Login an existing user.
- **Refresh Token**: `/auth/refresh` (POST)
  - Refresh user token.
- **Forgot Password**: `/auth/forgot` (POST)
  - Initiate forgot password flow.
- **Reset Password**: `/auth/reset` (POST)
  - Reset user password.
- **Logout User**: `/auth/logout` (GET)
  - Logout user.

### Google Authentication

- **Google Sign-In**: `/auth/google/signIn` (GET)
  - Initiate Google sign-in.
- **Google Callback**: `/auth/google/callback` (GET)
  - Handle Google sign-in callback.
- **Google Sign-Out**: `/auth/google/signOut` (GET)
  - Sign out from Google authentication.

### User Profile

- **Update Profile**: `/user/profile/update` (POST)
  - Update user profile details.
- **Update Password**: `/user/profile/updatePassword` (POST)
  - Update user password.
- **Get User Balance**: `/user/profile/getUserBalance` (POST)
  - Retrieve user balance.
- **Update User Balance**: `/user/profile/updateUserBalance` (POST)
  - Update user balance.
