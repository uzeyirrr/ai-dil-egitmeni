import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/button";
import { Phone, Globe } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import AISelector, { AIProvider } from "./AISelector";
import GoogleAIChat from "./GoogleAIChat";
import VoiceChat from "./VoiceChat";

const englishTeacherPrompt = `You are an English teacher. You should speak with the person in front of you in a simple and understandable way.

Important rules:
- Focus on teaching English to a Turkish-speaking person
- Use simple words and sentences
- Correct grammar mistakes gently
- Do practical speaking exercises
- Keep motivation high
- Be patient and supportive

In every conversation:
1. First greet
2. Ask simple questions
3. Listen and correct answers
4. Teach new words
5. Give opportunity to practice

Always respond in English and help the student improve their English skills.`;

export default function StartCall({ configId, accessToken }: { configId?: string, accessToken: string }) {
  const { status, connect } = useVoice();
  const [selectedAI, setSelectedAI] = useState<AIProvider>("hume");
  const [isStarted, setIsStarted] = useState(false);

  return (
    <AnimatePresence>
      {status.value !== "connected" && !isStarted ? (
        <motion.div
          className={"fixed inset-0 p-4 flex items-center justify-center bg-background"}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <AnimatePresence>
            <motion.div
              className="flex flex-col items-center gap-6 max-w-md w-full"
              variants={{
                initial: { scale: 0.5 },
                enter: { scale: 1 },
                exit: { scale: 0.5 },
              }}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">İngilizce Öğretmeni</h2>
                <p className="text-muted-foreground">AI sağlayıcısı seçin ve dersi başlatın</p>
              </div>

              <AISelector selectedAI={selectedAI} onSelectAI={setSelectedAI} />

              <Button
                className={"z-50 flex items-center gap-1.5 rounded-full w-full"}
                onClick={() => {
                  if (selectedAI === "hume") {
                    connect({ 
                      auth: { type: "accessToken", value: accessToken },
                      configId,
                      sessionSettings: {
                        type: "session_settings",
                        systemPrompt: englishTeacherPrompt
                      }
                    })
                      .then(() => {})
                      .catch(() => {
                        toast.error("Arama başlatılamadı");
                      })
                      .finally(() => {});
                  } else {
                    setIsStarted(true);
                  }
                }}
              >
                <span>
                  <Phone
                    className={"size-4 opacity-50 fill-current"}
                    strokeWidth={0}
                  />
                </span>
                <span>
                  {selectedAI === "hume" ? "Sesli Dersi Başlat" : "Chat Dersi Başlat"}
                </span>
              </Button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : selectedAI === "google" && isStarted ? (
        <VoiceChat accessToken={accessToken} />
      ) : null}
    </AnimatePresence>
  );
}
