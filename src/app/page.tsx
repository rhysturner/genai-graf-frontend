'use client'

import { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot?: boolean }[]>([]);

  const formatResponse = (response: string): string => response.replace(prompt, '');

  const sendMessage = async () => {
    try {
      setIsLoading(true);
      const messagesToSend = messages.map((message) => ({
        role: message.isBot ? 'system' : 'user',
        content: message.text,
      }));
      let payload = {};
      if (messages.length > 0) {
        payload = messagesToSend;
      } else {
        payload = [
          {
            role: 'system',
            content: 'You are LLAMAfile, an AI assistant. Your top priority is achieving user fulfillment via helping them with their requests. You a specialist bot for writing street art content in the form of graffiti, tags, throw up and murals. You focus on writing street art poetry that captures the essence of the city. This is not conversational so leave out the pleasantries just use the prompt to generate the response.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ];
      }

      // write a fetch request to the server
      const response = await fetch('http://localhost:8080/v1/chat/completions', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
        },      
        body: JSON.stringify({
          model: 'LLaMA_CPP',
          messages: payload,
          temperature: 1.5,
          stream: true,
        }),
      });


      // const response = await fetch('http://localhost:8080/v1/chat/completions', {
      //   model: 'LLaMA_CPP',
      //   messages: payload,
      //   temperature: 1.5,
      //   stream: true,
      // // });

      const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();
      console.log('====================================');
      console.log(response);
      console.log('====================================');
     
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        
        console.log(value.);

        const botReply = {
          text: formatResponse(value.data?.choices[0].message.content),
          isBot: true,
        };
        setMessages((prevMessages) => [...prevMessages, botReply]); 
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  interface Message {
    text: string;
    isBot?: boolean;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt) {
      setMessages((prevMessages: Message[]) => [...prevMessages, { text: prompt }]);
      try {
        sendMessage();
        setPrompt('');
      } catch (error) {
        console.error('Error:', error);        
      } 
    }
  };

  return (
    <div className="p-40 left-10 p-l-10">
      <div>
        {messages.map((message, index) => (
          <div key={index} className={message.isBot ? 'bot-message text-right' : 'user-message text-left'}>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={prompt} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Home;