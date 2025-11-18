import { GoogleGenAI, Type } from "@google/genai";
import { User, Meeting, PlayerPool } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        date: { type: Type.STRING, description: 'The suggested date in YYYY-MM-DD format.' },
        time: { type: Type.STRING, description: 'The suggested time in HH:MM format (24-hour clock).' },
        reason: { type: Type.STRING, description: 'A brief, friendly explanation for why this time was chosen, referencing player habits within the pool.' },
    },
    required: ["date", "time", "reason"],
};

export const getAiGameSuggestion = async (
  pool: PlayerPool,
  playersInPool: User[],
  allMeetings: Meeting[]
): Promise<{ date: string; time: string; reason: string; }> => {
  const today = new Date().toISOString().split('T')[0];

  const playersAvailability = playersInPool.map(p => ({
    name: p.name,
    availability: p.availability?.map(a => `${a.day} from ${a.startTime} to ${a.endTime}`).join(', ') || 'No availability set'
  }));
  
  // Filter for meetings specifically for this pool
  const relevantMeetings = allMeetings.filter(m => m.poolId === pool.id);

  const gameHistory = relevantMeetings.map(m => ({
    date: m.date,
    time: m.time,
    players: m.players.map(p => p.name).join(', ')
  }));
  
  const prompt = `
    You are an intelligent Padel Game scheduler. Your goal is to find the single best day and time for the players in the "${pool.name}" pool to have a Game.

    Here are the constraints:
    1.  The Game must be scheduled on or after today's date: ${today}.
    2.  You must respect the general availability of all players in the pool. If there's a conflict for any member, you cannot suggest that time.
    3.  Analyze the provided Game history FOR THIS SPECIFIC POOL to identify the most frequent day of the week and time these players play together. This is the primary factor for your suggestion.
    4.  Your goal is to find the next upcoming date that matches their most popular playing slot and respects everyone's availability.
    5.  Do NOT suggest a location.

    Here is the data for the players in the "${pool.name}" pool, including their general availability:
    ${JSON.stringify(playersAvailability, null, 2)}

    Here is the pool's shared Game history to understand their habits:
    ${JSON.stringify(gameHistory, null, 2)}

    Based on all this information, determine the single best future date (in YYYY-MM-DD format) and time (in HH:MM format) for the next Game. Provide a friendly reason for your choice.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const suggestion = JSON.parse(response.text);
    
    if (suggestion.date && suggestion.time && suggestion.reason) {
        return suggestion;
    } else {
        throw new Error("AI response was incomplete.");
    }

  } catch (error) {
    console.error("Error getting AI suggestion:", error);
    throw new Error("The AI scheduler is currently unavailable. Please try again later.");
  }
};