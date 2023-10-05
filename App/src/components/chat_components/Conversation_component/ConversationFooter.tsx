import React, { useState, FormEvent } from 'react';
import ConfirmButton from '../../settings_components/styles/ConfirmButton.styled';
import { ConversationFooterWrapper } from './styles/ConversationFooter.styled';

const ConversationFooter: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  const handleOnSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevents the form from submitting the traditional way

    // Handle form submission action here
    console.log('Form Submitted with value: ', inputValue);
    setInputValue("");
  };

  return (
    <ConversationFooterWrapper>
      <form onSubmit={handleOnSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="type your message"
        />
        <ConfirmButton type="submit">Send</ConfirmButton>
      </form>
    </ConversationFooterWrapper>
  );
};

export default ConversationFooter;
