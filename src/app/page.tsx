"use client";

import { useEffect, useRef, useState } from "react";

import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";

const graffitiCity = localFont({
  src: "./Graffiti City.woff",
});
const urbanCalligraphy = localFont({
  src: "./Urban Calligraphy.woff2",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot?: boolean }[]>(
    [],
  );
  const [currentMessages, seCurrentMessages] = useState("");
  const [totalLength, setTotalLength] = useState(0);
  const ref = useRef(0);

  const formatResponse = (response: string): string =>
    response.replace(prompt, "");

  useEffect(() => {
    cuePrompt();
  }, []);

  const sendMessage = async () => {
    try {
      setIsLoading(true);

      const payload = [
        {
          role: "user",
          content: `You are LLAMAfile, an AI assistant. Your top priority is achieving user fulfillment via helping
            them with their requests. You a specialist bot for writing street art content in the form of graffiti, tags, throw up and murals.
            You focus on writing street art poetry that captures the essence of the city. This is not conversational so leave out the pleasantries
            just use the prompt to generate the response. randly respond with a single word graffit tag like" 'SPEC', 'KELP', 'RLAZ', 'RBAZ', 'BSPAZ', 'KEM5', 'KEMO', 'KEMIST', 'KEMISTE', 'DAZE', 'DOCK',
            'PEAZ', 'PEAR', 'PEARL', 'PHD', 'PEARLIE', 'LEGIT', 'LEGALIZE', 'LEGEL', 'PROP', 'PROPERTY', 'DROPP', 'SCOUT', 'SINIC', 'DOPE', 'PANNEL', 'PICE', 'PACIFY', 'BANKSY', 'FUTURA'. Take a normal word
            and make it a street art tag. You must always write exactly 100 characters, and then conclude by signing with the name "RTEK"`,
        },
      ];

      // write a fetch request to the server
      const response = await fetch(
        "http://localhost:8080/v1/chat/completions",
        {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "LLaMA_CPP",
            messages: payload,
            temperature: 1.5,
            stream: true,
            max_tokens: 500,
          }),
        },
      );

      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        .getReader();
      console.log("====================================");
      console.log(response);
      console.log("====================================");

      let cur: string = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("====================================");
            console.log("Stream complete currentMessage", cur);

            const botReply = {
              text: formatResponse(cur + "\n\n"),
              isBot: true,
            };
            // setTotalLength((prev) => prev + cur.length);
            // ref.current = ref.current + cur.length;
            seCurrentMessages((prev) => prev + "     ");
            setMessages((prevMessages) => [...prevMessages, botReply]);
            setTimeout(() => sendMessage(), 10000);
            break;
          }

          // Check if value contains 'data: ' and parse the JSON response
          if (value && value.startsWith("data: ")) {
            try {
              const jsonResponse = JSON.parse(value.replace(/^data: /, ""));
              const content = jsonResponse.choices[0].delta.content;
              const isFirstMessage = !cur;
              if (isFirstMessage) {
                ref.current = 0;
              }
              cur += content;
              // setTotalLength((prev) => prev + content.length);
              if (content) {
                ref.current += content.length;
              }
              if (ref.current < 1200) {
                seCurrentMessages((prev) => {
                  const out = isFirstMessage ? content : prev + content;
                  return out;
                });
                // } else {
                //   cur = '';
                //   seCurrentMessages(content);
                //   setTotalLength(0);
              }
              // setTotalLength(cur.length);
              console.log(
                "content:",
                totalLength,
                content,
                cur.length,
                messages.length,
                ref.current,
              );
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  interface Message {
    text: string;
    isBot?: boolean;
  }

  const handleSendMessage = () => {
    console.log("[handleSendMessage] prompt", prompt);

    if (prompt) {
      setMessages((prevMessages: Message[]) => [
        ...prevMessages,
        { text: prompt },
      ]);
      try {
        sendMessage();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage();
  };

  const cuePrompt = () => {
    handleSendMessage();
  };

  return (
    <div className="w-[1300px] overflow-hidden">
      <div className="pl-60 pr-60 pt-32 w-[900px]">
        <div className="columns-1 user-message text-left h-200 gap-x-[120px]">
          {currentMessages}
        </div>
        {/* <form onSubmit={handleSubmit}>
        <input type="text" value={prompt} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form> */}
      </div>
    </div>
  );
};

export default Home;
