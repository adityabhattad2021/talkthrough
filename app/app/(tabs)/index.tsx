import { useConversationControls, useConversationStatus } from '@elevenlabs/react-native';
import React from 'react';
import { View, Text, Button } from 'react-native';

export default function ConversationComponent() {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
 
  const handleStart = async () => {
    await startSession({
      agentId: 'agent_7101k5zvyjhmfg983brhmhkd98n6',
    });
  };

  return (
    <View>
      <Text>Status: {status}</Text>
      <Button
        title={status === 'connected' ? 'End' : 'Start'}
        onPress={status === 'connected' ? endSession : handleStart}
      />
    </View>
  );
}
