# 💫 Pyxis

## 🧭 Inspiration
We’ve all been there... signing up for a “free trial” that quietly becomes a monthly charge, or realizing too late that five different streaming services are nibbling away at our bank accounts. Subscriptions are sneaky, and modern spending is scattered across emails, receipts, and transactions that don’t tell the full story.  

We wanted to fix that. **Pyxis** uncovers hidden charges, analyzes spending patterns, and guides users toward smarter financial decisions. Just like the *Pyxis constellation* guides sailors, our app helps users navigate their financial universe with clarity.

---

## 💡 What It Does
**Pyxis** scans your emails to detect recurring subscriptions, hidden fees, and potential fraud. It connects with your bank account to analyze spending patterns and delivers **AI-powered insights** and personalized advice.  

The result? A simple, actionable view of your finances that helps you save money, avoid surprises, and make smarter financial decisions.

---

## 🛠️ How We Built It

We built Pyxis by integrating several powerful APIs and frameworks to create a seamless experience that connects banking data, financial insights, and user emails into one unified dashboard.

💳 Nessie Integration
We simulated realistic user bank transactions by creating a spreadsheet of sample financial data. This data was then uploaded to the Nessie API (Capital One’s hackathon API) to emulate user banking behavior such as purchases, bills, and balances. This allowed us to dynamically fetch and visualize mock transaction data within our app.

📧 Email Parser
We connected to the Gmail API via Google Cloud to access users’ email metadata and content (with explicit consent). Once we retrieved the emails, we passed them through an AI classifier that identified which emails were financial in nature — such as bills, subscriptions, or purchase receipts. The model then returned a clean JSON object summarizing key details (sender, amount, date, and category), which the UI displayed in real-time.

🌌 Budget Constellation Visualization
To give users an intuitive understanding of their spending habits, we generated a weighted graph (or “constellation”) where each node represented a spending category or merchant. The size of each node indicated how much the user spent, and the distance between nodes reflected the relationship between spending categories.

🔐 Authentication
We implemented NextAuth for secure authentication, enabling users to log in with their Google or Outlook accounts. This allowed us to safely access their email data for analysis while maintaining full OAuth compliance.

💻 Frontend UI
The frontend was built using React and styled with TailwindCSS for a sleek and responsive user experience. We designed a dashboard-driven interface with interactive insight cards, dynamic charts, and clean visual feedback that makes the data feel alive. 
🔗 [GitHub Repository](https://github.com/CSB-Noel/hack25)

---

## ⚔️ Challenges We Ran Into
Our team was mainly composed of new(ish) hackathon members, so we had a hard time settling on project ideas. Since we focused on the **Capital One track**, integrating **Nessie** was difficult — configuring it and pulling data took longer than expected.  

Despite these challenges, we learned a lot and adapted our workflow to keep the project moving forward.  

We also implemented user authentication using **direct Gmail OAuth** and **Outlook via Azure**, which was tricky to configure. We had to modify our code several times to handle **expiring tokens** and maintain session stability.

---

## 🏆 Accomplishments We’re Proud Of
We’re very proud that we were able to **connect user data from email and their bank account (Nessie)** to output **insightful financial advice!**

---

## 📚 What We Learned
A lot!  
- **Priscilla** learned Supabase  
- **Aaron** explored prompt engineering  
- **Noel** worked with Nessie and general API development 
- **Rohan** built the React development environment  

---

## 🚀 What’s Next for Pyxis
- More features and integrations  
- A **mobile app version** for convenience  
- Talking to potential users for further insights  

---

## 🧩 Built With
- `google-gmail-oauth`  
- `openrouter (Gemini)`  
- `outlook`  
- `react`  
- `supabase`  
- `typescript`
- `Nessie API`
- `Fast API`

---

## 🔍 Try It Out
[Visit our project →](https://github.com/CSB-Noel/hack25)
