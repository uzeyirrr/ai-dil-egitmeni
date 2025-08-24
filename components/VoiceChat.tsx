"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/utils";

interface VoiceChatProps {
  accessToken: string;
}

export default function VoiceChat({ accessToken }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [language, setLanguage] = useState<"en-US" | "tr-TR">("en-US");
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const startVoiceChat = async () => {
    try {
      // Mikrofon erişimi al
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // MediaRecorder başlat
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

             // Speech Recognition başlat
       if ('webkitSpeechRecognition' in window) {
         const recognition = new (window as any).webkitSpeechRecognition();
         recognition.continuous = true;
         recognition.interimResults = true;
         recognition.lang = language; // Seçilen dil

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
            sendMessage(finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

                 recognition.onend = () => {
           setIsListening(false);
           // Sürekli dinleme modunda otomatik olarak yeniden başlat
           if (isConnected && isContinuousMode) {
             setTimeout(() => {
               if (recognitionRef.current) {
                 recognitionRef.current.start();
               }
             }, 100);
           }
         };

        recognitionRef.current = recognition;
        recognition.start();
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Error starting voice chat:', error);
      alert('Mikrofon erişimi sağlanamadı.');
    }
  };

  const stopVoiceChat = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
  };

  const sendMessage = async (message: string) => {
    try {
      const response = await fetch("/api/google-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          systemPrompt: `You are an English teacher. Respond in English and help the student improve their English skills. Keep responses short and conversational.`
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setAiResponse(data.response);
      
      // AI yanıtını sesli olarak söyle
      speakResponse(data.response);
    } catch (error) {
      console.error("Error sending message:", error);
      setAiResponse("Üzgünüm, bir hata oluştu.");
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Burada ses dosyasını Google AI'ya gönderebiliriz
    // Şimdilik sadece transcript kullanıyoruz
    console.log('Audio processed:', audioBlob.size, 'bytes');
  };

     const speakResponse = (text: string) => {
     if ('speechSynthesis' in window) {
       setIsSpeaking(true);
       const utterance = new SpeechSynthesisUtterance(text);
       utterance.lang = 'en-US';
       utterance.rate = 0.8;
       utterance.pitch = 1;
       
       utterance.onend = () => {
         setIsSpeaking(false);
         // AI konuşması bittikten sonra dinlemeye devam et
         if (isConnected && isContinuousMode && recognitionRef.current) {
           setTimeout(() => {
             recognitionRef.current.start();
           }, 500);
         }
       };
       
       speechSynthesis.speak(utterance);
     }
   };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-6">
                 <div className="text-center">
           <h2 className="text-2xl font-bold mb-2">Sesli İngilizce Dersi</h2>
           <p className="text-muted-foreground">
             Google AI Studio benzeri gerçek zamanlı sesli görüşme
           </p>
         </div>

                   {/* Dil Seçimi */}
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setLanguage("en-US")}
              variant={language === "en-US" ? "default" : "outline"}
              size="sm"
            >
              🇺🇸 İngilizce Konuş
            </Button>
            <Button
              onClick={() => setLanguage("tr-TR")}
              variant={language === "tr-TR" ? "default" : "outline"}
              size="sm"
            >
              🇹🇷 Türkçe Konuş
            </Button>
          </div>

          {/* Sürekli Dinleme Modu */}
          <div className="flex justify-center">
            <Button
              onClick={() => setIsContinuousMode(!isContinuousMode)}
              variant={isContinuousMode ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isContinuousMode ? "🔄" : "⏸️"}
              {isContinuousMode ? "Sürekli Dinleme" : "Tek Seferlik"}
            </Button>
          </div>

        {/* Durum Göstergeleri */}
        <div className="flex justify-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full text-sm",
            isListening ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isListening ? "bg-green-500 animate-pulse" : "bg-gray-400"
            )} />
            {isListening ? "Dinleniyor" : "Bekliyor"}
          </div>
          
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-full text-sm",
            isSpeaking ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isSpeaking ? "bg-blue-500 animate-pulse" : "bg-gray-400"
            )} />
            {isSpeaking ? "Konuşuyor" : "Sessiz"}
          </div>
        </div>

        {/* Ana Kontrol Butonu */}
        <div className="flex justify-center">
          <Button
            onClick={isConnected ? stopVoiceChat : startVoiceChat}
            className={cn(
              "w-20 h-20 rounded-full text-lg",
              isConnected 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-green-500 hover:bg-green-600"
            )}
          >
            {isConnected ? <PhoneOff className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
          </Button>
        </div>

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted p-4 rounded-lg"
          >
            <h3 className="font-medium mb-2">Siz:</h3>
            <p className="text-sm">{transcript}</p>
          </motion.div>
        )}

        {/* AI Yanıtı */}
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 p-4 rounded-lg"
          >
            <h3 className="font-medium mb-2">AI Öğretmen:</h3>
            <p className="text-sm">{aiResponse}</p>
          </motion.div>
        )}

                 {/* Talimatlar */}
         <div className="text-center text-sm text-muted-foreground">
           <p>🌍 Dil seçin (İngilizce/Türkçe)</p>
           <p>🔄 Sürekli dinleme modu aktif</p>
           <p>🎤 Mikrofon butonuna basın ve konuşun</p>
           <p>🔊 AI İngilizce olarak yanıt verecek</p>
           <p>💬 Gerçek zamanlı sesli görüşme deneyimi</p>
         </div>
      </div>
    </div>
  );
}
