import { SmartGlasses } from "./glasses";
import { apiRequest } from "./queryClient";

/**
 * Sends the command to backend AI for interpretation
 */
export async function handleAICommand(command: string) {
  const res = await apiRequest("POST", "/api/ai/chat", {
    messages: [
      {
        role: "system",
        content: "You are a tree service pricing AI. Analyze tree service job descriptions and provide estimates. Return JSON with: title (short job title), estimatedPrice (number in USD), riskLevel (low/medium/high), estimatedHours (number), requiredEquipment (array of strings), jobId (if applicable)."
      },
      {
        role: "user",
        content: command
      }
    ]
  });
  
  const response = await res.json();
  
  // Extract content from OpenAI format
  const content = response.choices[0]?.message?.content;
  try {
    return JSON.parse(content);
  } catch (e) {
    return { text: content };
  }
}

export async function handleVoiceCommand(command: string) {
  const cmd = command.toLowerCase();
  console.log(`[VOICE-COMMAND] ${cmd}`);

  // Get AI interpretation
  const aiResult = await handleAICommand(cmd);

  if (cmd.includes("mark job complete")) {
    console.log("Processing 'mark job complete'...");
    if (aiResult.jobId) {
      await apiRequest("PATCH", `/api/jobs/${aiResult.jobId}/status`, { status: "completed" });
    }
    await SmartGlasses.alert();
  }

  if (cmd.includes("take photo")) {
    console.log("Processing 'take photo'...");
    const photo = await SmartGlasses.takePhoto();
    if (photo) {
      console.log("Photo captured:", photo);
      await SmartGlasses.alert();
    }
  }

  if (cmd.includes("current location")) {
    console.log("Processing 'current location'...");
    const location = await SmartGlasses.getLocation();
    if (location) {
      console.log("Contractor location:", location);
      // Sync telemetry to backend
      await apiRequest("POST", "/api/ar/telemetry", {
        deviceType: "mobile_ar",
        gpsLat: location.lat,
        gpsLng: location.lng
      });
      await SmartGlasses.alert();
    }
  }

  if (cmd.includes("what's next")) {
    console.log("Processing 'what's next'...");
    try {
      const response = await apiRequest("GET", "/api/jobs");
      const jobs = await response.json();
      const nextJob = jobs.find((j: any) => j.status === 'accepted' || j.status === 'requested');
      
      let msg = "";
      if (nextJob) {
        msg = `Your next job is at ${nextJob.address}. ${nextJob.description}`;
      } else {
        msg = "No upcoming tasks found.";
      }
      
      console.log("Voice Feedback:", msg);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(msg);
        window.speechSynthesis.speak(utterance);
      }
      await SmartGlasses.alert();
    } catch (err) {
      console.error("Error in what's next command:", err);
    }
  }
}
