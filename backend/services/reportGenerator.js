const Groq = require("groq-sdk");
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateExecutiveReport = async (data) => {
    try {
        console.log("🤖 Generating Premium AI Report...");

        const prompt = `
        You are an **Elite Business Intelligence Consultant** (McKinsey/BCG level). 
        Your task is to analyze the provided dashboard data and generate a **High-Impact Executive Summary**.

        ### 📊 INPUT DATA:
        - **Revenue:** $${data.revenue?.amount} (Change: ${data.revenue?.change}%)
        - **Active Users:** ${data.activeUsers?.current}
        - **New Orders:** ${data.newOrders?.count} (Trend: ${data.newOrders?.trend}%)
        - **Conversion Rate:** ${data.conversionRate}%
        - **Key Metrics:** ${JSON.stringify(data.analyticsSummary)}

        ### 📝 REPORT REQUIREMENTS:
        1.  **Tone:** Extremely professional, visionary, data-driven, and concise.
        2.  **Format:** Use clear Markdown headers, bullet points, and professional emojis (Start sections with icons like 📈, 🚀, 💡).
        3.  **Structure:**
            *   **🎯 Executive Snapshot:** One powerful paragraph summarizing the entire health of the business.
            *   **📈 Performance Deep-Dive:** Analyze Revenue vs. User Growth correlation. Identify what's driving the ${data.revenue?.change}% change.
            *   **⚠️ Critical Risk Assessment:** Identify "Red Flag" metrics (e.g., if Bounce Rate > 40% or Retention is low).
            *   **💎 Hidden Opportunities:** "Hallucinate" plausible logic based on data (e.g., "High conversion trend suggests product-market fit in premium segment").
            *   **🔮 Strategic Forecast (Next Quarter):** Predict where the numbers will go based on current momentum.
            *   **🚀 C-Level Action Plan:** 3 specific, high-ROI recommendations.

        ### 🎨 VISUAL STYLE:
        - Do NOT simply list numbers. Contextualize them (e.g., instead of "Revenue is $12k", say "Revenue generated a robust $12k, signaling a strong...").
        - Use bolding (**Market-Fit**) for key terms.
        - Make it look like a report worth $5,000.

        Generate the response now.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6, // Slightly lower for more professional consistency
            max_tokens: 1500,
        });

        return completion.choices[0]?.message?.content || "## ❌ Error: Report generation failed.";

    } catch (error) {
        console.error("❌ Report Service Error:", error.message);
        throw error;
    }
};

const generateStandardReport = async (data) => {
    try {
        console.log("🤖 Generating Detailed Standard Report...");

        const prompt = `
        You are a **Senior Data Auditor & Business Strategist**. 
        Input Data: ${JSON.stringify(data)}

        Your task is to generate a **Comprehensive Standard Business Report**. Unlike an executive summary, this must be **detailed, critical, and exhaustive**.

        ### 📝 REPORT STRUCTURE & REQUIREMENTS:

        #### 1. 📉 Financial & Operational Deep Dive
        - Analyze the Revenue ($${data.revenue?.amount}) and Change (${data.revenue?.change}%).
        - Break down the *implications* of this change. Is it sustainable?
        - Analyze 'New Orders' and 'Conversion Rate'. correlation.
        
        #### 2. 🔍 Loss & Weakness Analysis (The "Bad" News)
        - Ruthlessly identify where the business is leaking money or users.
        - Look at 'Bounce Rate', 'Retention', or low conversion.
        - **Highlight specific areas of failure.** (e.g., "The bounce rate of X% indicates a failure in landing page relevance...").

        #### 3. 🧪 SWOT Analysis
        - **Strengths:** Internal positives.
        - **Weaknesses:** Internal negatives (Critical Section).
        - **Opportunities:** External factors to exploit.
        - **Threats:** What if the current negative trends continue?

        #### 4. 📊 Visual Trends (ASCII Charts)
        - You MUST generate **ASCII Bar Charts** for key metrics inside Markdown Code Blocks.
        - **Revenue Trend:**
        \`\`\`text
        Month 1: |████░░░░░░| $10k
        Month 2: |██████░░░░| $12k
        Month 3: |████████░░| $15k
        \`\`\`
        - **User Growth:**
        \`\`\`text
        Week 1:  |▃▃▃      | 200
        Week 2:  |▆▆▆▆▆    | 500
        Week 3:  |█████████| 900
        \`\`\`
        (Simulate plausible data based on the provided current values).

        #### 5. 🛠 Tactical Solutions
        - Give step-by-step fixes for the identified weaknesses.

        **Tone:** Analytical, Objective, Critical.
        **Format:** Markdown. Use TABLES for comparisons. Use CODE BLOCKS for Charts.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 2048,
        });

        return completion.choices[0]?.message?.content || "## ❌ Error: Standard Report generation failed.";

    } catch (error) {
        console.error("❌ Standard Report Service Error:", error.message);
        throw error;
    }
};

module.exports = { generateExecutiveReport, generateStandardReport };
