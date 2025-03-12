'use client'

import { useState } from 'react';

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

      const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();
      console.log('====================================');
      console.log(response);
      console.log('====================================');

      let currentMessage: string = '';
     
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('====================================');
          console.log('Stream complete currentMessage', currentMessage);
          const botReply = {
            text: formatResponse(currentMessage),
            isBot: true,
          };
          setMessages((prevMessages) => [...prevMessages, botReply]);
          break;
        }
        
        // Check if value contains 'data: ' and parse the JSON response
        if (value && value.startsWith('data: ')) {
          const jsonResponse = JSON.parse(value.replace(/^data: /, ''));
          const content = jsonResponse.choices[0].delta.content;
          console.log('content', content);
          currentMessage += content;
        }
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