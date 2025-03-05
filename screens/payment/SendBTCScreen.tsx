import React from 'react';
import { 
  VStack, 
  Box, 
  Heading, 
  Button, 
  FormControl, 
  Input, 
  Text 
} from "@gluestack-ui/themed";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useHaptics } from '@/hooks/useHaptics';

// Define form validation schema with zod
const sendBtcSchema = z.object({
  address: z.string()
    .min(26, 'Bitcoin address is too short')
    .max(90, 'Bitcoin address is too long'),
  amount: z.coerce.number()
    .positive('Amount must be greater than 0')
    .max(21000000, 'Amount exceeds maximum Bitcoin supply'),
  memo: z.string().optional(),
});

type SendBtcFormData = z.infer<typeof sendBtcSchema>;

/**
 * Screen for sending Bitcoin to another address
 * Uses react-hook-form with zod validation for form handling
 */
const SendBTCScreen = () => {
  const { triggerNotification } = useHaptics();
  const { control, handleSubmit, formState: { errors } } = useForm<SendBtcFormData>({
    resolver: zodResolver(sendBtcSchema),
    defaultValues: {
      address: '',
      amount: undefined,
      memo: '',
    }
  });

  const onSubmit = (data: SendBtcFormData) => {
    console.log('Sending BTC:', data);
    // Here you would typically call your transaction service
    triggerNotification('success');
  };

  return (
    <Box flex={1} p="$4">
      <VStack space="lg">
        <Heading size="xl">Send Bitcoin</Heading>
        
        <FormControl isInvalid={!!errors.address}>
          <FormControl.Label>Bitcoin Address</FormControl.Label>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input>
                <Input.Input
                  placeholder="Enter recipient address"
                  value={value}
                  onChangeText={onChange}
                />
              </Input>
            )}
          />
          <FormControl.Error>
            {errors.address?.message}
          </FormControl.Error>
        </FormControl>
        
        <FormControl isInvalid={!!errors.amount}>
          <FormControl.Label>Amount (BTC)</FormControl.Label>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <Input>
                <Input.Input
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ''))}
                />
              </Input>
            )}
          />
          <FormControl.Error>
            {errors.amount?.message}
          </FormControl.Error>
        </FormControl>
        
        <FormControl>
          <FormControl.Label>Memo (Optional)</FormControl.Label>
          <Controller
            control={control}
            name="memo"
            render={({ field: { onChange, value } }) => (
              <Input>
                <Input.Input
                  placeholder="Add a note"
                  value={value || ''}
                  onChangeText={onChange}
                />
              </Input>
            )}
          />
        </FormControl>
        
        <Button 
          onPress={handleSubmit(onSubmit)}
          mt="$4"
        >
          <Button.Text>Send Bitcoin</Button.Text>
        </Button>
      </VStack>
    </Box>
  );
};

export default SendBTCScreen; 