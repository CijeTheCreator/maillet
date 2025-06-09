# Maillet

An EVM wallet designed to be operated completely through mail.

## Things you can do

- Send/Receive funds to any email address  
- Send/Receive funds to any wallet address
- Fetch your balance  
- Fetch your transaction history 

## Quickstart

### Host System Package Dependencies

-   Docker

### After system dependencies are installed, clone this repository:

```sh
# clone and enter repo
git clone https://github.com/CijeTheCreator/maillet
```

```sh
# fill out .env.example
mv .env.example .env
```

```env
DATABASE_URL=VALUE_HERE
ENCRYPTION_KEY=VALUE_HERE
RPC_URL=VALUE_HERE
NEXTAUTH_SECRET=VALUE_HERE

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=VALUE_HERE
CLERK_SECRET_KEY=VALUE_HERE
CLERK_WEBHOOK_SIGNING_SECRET=VALUE_HERE

COINGECKO_API_KEY=VALUE_HERE
ETHERSCAN_API_KEY=VALUE_HERE

FAUCET_PRIVATE_KEY=VALUE_HERE


GOOGLE_API_KEY=VALUE_HERE
SENDGRID_API_KEY=VALUE_HERE
ETH_RATE=VALUE_HERE
WALLET_API_URL=VALUE_HERE
```

```sh
docker build -t maillet .
docker run -d --name maillet -p 3000:3000 -p 5000:5000 maillet_app --env-file .env

```

- The Next.js client will run on localhost:3000.
- The flask server (for parsing mails) will run on localhost:5000.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
