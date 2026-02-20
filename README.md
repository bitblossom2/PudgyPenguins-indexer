# Pudgy Penguins Indexer 🐧 | Envio HyperIndex Challenge

This repo contains an Indexer for the NFT collection **Pudgy Penguins** from the Ethereum mainnet blockchain. It's object is to show how efficient is the Hyperindex envio framework and how you can use it in a very simple project like a dashboard, but also having the possibility of integrating it with other tools and make more powerfull projects.

---
## Envio Indexer
Please refer to the [documentation website](https://docs.envio.dev) for a thorough guide on all [Envio](https://envio.dev) indexer features
---

## 🚀 How to Run

To experience the full dashboard, you need to run the **Backend (Indexer)** and the **Frontend (UI)** simultaneously.

### 1. Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [pnpm (v8+)](https://pnpm.io/)
- [Docker Desktop](https://www.docker.com/) (Required to run the indexer database)

### 2. Launch the Backend (Indexer)
This process starts the Envio engine, the PostgreSQL database, and the Hasura GraphQL API.
```bash
# Install dependencies
pnpm install

# Generate Envio types from config & schema
pnpm codegen

# Start the indexer and local environment
pnpm dev
```
> **Note:** The GraphQL Playground will be available at http://localhost:8080 (Password: `testing`).


### 3. Launch the Frontend (Dashboard)
Open a new terminal tab, navigate to your frontend directory, and run:
```bash
# Navigate to your frontend folder
cd frontend 

# Install and start
pnpm install
pnpm dev
```
Visit the local URL shown in your terminal (usually http://localhost:5173) to see the live dashboard.

---

## 🚀 My dev process (Step-by-Step)

In order to build this project, I took an incremental approach:

1.  **Research**: I started by simply downloading the **HyperIndex** docs to understand how it manage the EVM events.

2.  **Project idea**: I chose to work with NFT data to create a dashboard with relevant insights. I decided on Pudgy Penguins because they are currently among the top 3 most famous NFT collections on the Ethereum mainnet.

3. **Data arqitechture**: Defined an entity (`Account`) which helped me to avoid manual updates and kept Indexer's velocity. 

4.  **Handler Logic**: Initially, I defined simple properties like mintedAt in `EventHandlers.ts` to capture updates on demand.

5.  **Frontend**: I must admit I'm not a fan of frontend development, so I used AI to assist with the UI. However, I wrote all the queries myself to ensure I understood exactly where the data was coming from.

6. **Testing**: I used pnpm envio dev to set up the environment and tested it multiple times. I also used Hasura to verify that the data was correct and that the frontend was fetching it properly.

7.  **Increasing Complexity:**:
    * I started with basic properties to get used to the Envio workflow. 
    * Then, I added research-oriented properties. I tried to find the "oldest NFTs kept alive," but I discovered that no NFTs in this collection had been burned yet, so I focused on other metrics. 
    * I implemented a list of the "oldest NFTs still held by their original minter", and a list of the ten most recent transactions which worked quite well.
    * Regarding market data, I attempted to connect with Reservoir for real-time prices. It got a bit complex, so I implemented fallback data to demonstrate how HyperIndex can integrate with external tools.
    * As I added more charts, I encountered some frontend bugs where the data was present in the page but not displaying correctly, even though the Hasura queries worked perfectly. I decided to show my current progress while I refactor these visual elements.

8.  **Insights**:
    * I decided to kept the "burn" detection logic active for future-proofing and potential use with other NFT collections.

---
## Technical details

### Burn Detection
The indexer processes data for every mint and transfer event. I implemented a classification for "burned" NFTs by monitoring the receiving address of every transaction. If the destination is the Zero Address (0x0000...), the NFT is marked as isBurned in the database, as it is permanently trapped and inaccessible.

### Transfers
The indexer maintains a real-time state of each Pudgy Penguin's lifecycle:
- `Is original owner`: When an NFT moves between different wallet addresses for the first time, the isOriginalOwner property stays in false.
- `Ownership Updates`: The currentOwner property is updated on every transfer event to ensure the dashboard reflects the most recent holder.

---
## Challenges & Improvements

- NFT Images: I couldn't fixed the connection issues to ensure NFT images load consistently, so I added a custom "hacker" scan-line animation and a specialized "OFFLINE" design to make the dashboard more visually striking and professional.
- Market Data: I decided to stop using external APIs like Reservoir because they often failed to connect. Instead, the dashboard now uses real-time data directly from my own indexer, which is much more stable.
