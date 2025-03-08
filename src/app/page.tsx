import { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const formatResponse = (response) => response.replace(prompt, '');

  const sendMessage = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:8000/complete', {
        prompt,
      });
      const botReply = {
        text: formatResponse(response?.data?.data?.choices[0].text),
        isBot: true,
      };
      setMessages((prevMessages) => [...prevMessages, botReply]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt) {
      setMessages((prevMessages) => [...prevMessages, { text: prompt }]);
      sendMessage();
      setPrompt('');
    }
  };

  return (
    <div>
      <h1>Llama Chatbot</h1>
      <div>
        {messages.map((message, index) => (
          <div key={index} className={message.isBot ? 'bot-message' : 'user-message'}>
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
